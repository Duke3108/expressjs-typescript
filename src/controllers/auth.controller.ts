import asyncHandler from "express-async-handler";
import db from "../models/index.js";
import brcypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../middlewares/jwt.js";
import crypto from "crypto";
import makeToken from "uniqid";
import "dotenv/config";
import addMailJob from "../queues/mail.producer.js";

const hashPassword = (password: string) => {
  const salt = brcypt.genSaltSync(10);
  const hashedPassword = brcypt.hashSync(password, salt);
  return hashedPassword;
};

const isCorrectPassword = async (
  inputPassword: string,
  hashedPassword: string
) => {
  return await brcypt.compare(inputPassword, hashedPassword);
};

const createPasswordChangeToken = async (user: any) => {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const passwordResetExpires = Date.now() + 15 * 60 * 1000;
  await user.update({
    resetPwdToken: passwordResetToken,
    resetPwdExpires: passwordResetExpires,
  });
  return resetToken;
};

export const register = asyncHandler(async (req: any, res: any) => {
  const { email, password, fullname, phone } = req.body;
  if (!email || !password || !fullname || !phone) {
    return res.status(400).json({
      success: false,
      mes: "missing inputs",
    });
  }
  const user = await db.User.findOne({ email });
  if (user) throw new Error("User has existed");
  else {
    const token = makeToken();
    res.cookie(
      "dataregister",
      { ...req.body, token },
      {
        httpOnly: true,
        maxAge: 15 * 60 * 1000,
        sameSite: "lax",
        secure: false,
      }
    );
    const html = `Nhập token để hoàn tất quá trình đăng ký. 
            Token sẽ hết hạn sau 15 phút. <b>${token}</b>`;

    const data = {
      email,
      html,
      subject: "Xác nhận email đăng ký",
    };

    await addMailJob(data);
    return res.json({
      success: true,
      mes: "Kiểm tra email của bạn để hoàn tất quá trình đăng ký",
    });
  }
});

export const login = asyncHandler(async (req: any, res: any) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      mes: "missing inputs",
    });
  }

  const response = await db.User.findOne({ email });
  if (response && (await isCorrectPassword(password, response.password))) {
    //tach password va role
    const { password, role, refreshToken, ...userData } = response;

    //tao access token
    const accessToken = generateAccessToken(response.id, role);

    //tao refresh token
    const newRefreshToken = generateRefreshToken(response.id);

    //luu refresh token vao db
    const user = await db.User.findByPk(response.id);
    user.refreshToken = newRefreshToken;
    await user.save();

    return res.status(200).json({
      success: true,
      accessToken,
    });
  } else {
    throw new Error("Invalid credentials");
  }
});

export const refreshToken = asyncHandler(async (req: any, res: any) => {
  //lay token tu db
  const token = req.params;
  //check token hop le
  jwt.verify(
    token,
    process.env.JWT_REFRESH_KEY as string,
    async (err: any, decode: any) => {
      if (err)
        return res.status(401).json({
          success: false,
          mes: "Invalid refresh token",
        });
      //check token voi token luu trong db
      const response = await db.User.findOne({
        id: decode.id,
        refreshToken: token,
      });
      return res.status(200).json({
        success: response ? true : false,
        newAccessToken: response
          ? generateAccessToken(response.id, response.role)
          : "Refresh token invalid",
      });
    }
  );
});

export const forgotPassword = asyncHandler(async (req: any, res: any) => {
  const { email } = req.body;
  if (!email) throw new Error("Missing email");
  const user = await db.User.findOne({ email });
  if (!user) throw new Error("User not found");
  const resetToken = await createPasswordChangeToken(user);

  const html = `Nhập reset token để thay đổi mật khẩu. 
        Token sẽ hết hạn sau 15 phút. <b>${resetToken}</b>`;

  const data = {
    email,
    html,
    subject: "Quên mật khẩu",
  };

  const rs = (await addMailJob(data)) as any;
  return res.status(200).json({
    success: true,
    mes: rs ? "Vui lòng kiểm tra email của bạn" : "Something went wrong",
  });
});

export const resetPassword = asyncHandler(async (req: any, res: any) => {
  const { newPassword, token } = req.body;
  if (!newPassword || !token) throw new Error("Missing input");
  const passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  const user = await db.User.findOne({
    resetPwdToken: passwordResetToken,
    resetPwdExpires: { $gt: Date.now() },
  });
  if (!user) throw new Error("Invalid reset token");
  user.update({
    password: hashPassword(newPassword),
    resetPwdToken: null,
    resetPwdExpires: null,
    passwordChangedAt: Date.now(),
  });

  return res.status(200).json({
    success: user ? true : false,
    mes: user ? "Updated password" : "Something went wrong",
  });
});

export const verifyEmail = asyncHandler(async (req: any, res: any) => {
  const cookie = req.cookies;
  const { token } = req.params;
  if (!cookie || cookie?.dataregister?.token !== token) {
    res.clearCookie("dataregister");
    return res.status(400).json({
      success: false,
      mes: "Token không hợp lệ",
    });
  }
  const newUser = await db.User.create({
    email: cookie?.dataregister?.email,
    password: hashPassword(cookie?.dataregister?.password),
    fullname: cookie?.dataregister?.fullname,
    phone: cookie?.dataregister?.phone,
  });
  res.clearCookie("dataregister");
  if (newUser) {
    const user = await db.User.findOne({ email: cookie?.dataregister?.email });
    if (!user) throw new Error("User not found");
    await user.update({ emailVerified: true });
    return res.status(200).json({
      success: true,
      mes: "Tạo tài khoản thành công",
      newUser,
    });
  } else
    return res.status(400).json({
      success: false,
      mes: "Tạo tài khoản thất bại",
    });
});
