import asyncHandler from "express-async-handler";
import db from "../models/index.ts";
import brcypt from "bcryptjs";
import jwt, { type JwtPayload, type VerifyErrors } from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../middlewares/jwt.ts";
import crypto from "crypto";
import makeToken from "uniqid";
import "dotenv/config";
import addMailJob from "../queues/mail.producer.ts";
import { Op } from "sequelize";

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

const createPasswordChangeToken = async (user: {
  update: (arg0: {
    resetPwdToken: string;
    resetPwdExpires: number;
  }) => Promise<void>;
}) => {
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

export const register = asyncHandler(async (req, res) => {
  const { email, password, fullname, phone } = req.body;
  if (!email || !password || !fullname || !phone) {
    res.status(400).json({
      success: false,
      msg: "missing inputs",
    });
    return;
  }
  const user = await db.User.findOne({ where: { email } });
  if (user) throw new Error("Tài khoản đã tồn tại");
  else {
    const token = makeToken();
    await db.User.create({
      email,
      password: hashPassword(password),
      fullname,
      phone,
      registerToken: token,
    });
    const html = `Nhập token để hoàn tất quá trình đăng ký. 
            Token sẽ hết hạn sau 15 phút. <b>${token}</b>`;

    const data = {
      email,
      html,
      subject: "Xác nhận email đăng ký",
    };

    await addMailJob(data);
    res.json({
      success: true,
      msg: "Kiểm tra email của bạn để hoàn tất quá trình đăng ký",
    });
    return;
  }
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({
      success: false,
      msg: "Tài khoản hoặc mật khẩu không được để trống",
    });
    return;
  }

  const response = await db.User.findOne({ where: { email } });
  if (!response) throw new Error("Tài khoản không tồn tại");
  if (!response.emailVerified)
    throw new Error("Vui lòng xác minh Email trước khi đăng nhập");
  if (
    response &&
    response.emailVerified &&
    (await isCorrectPassword(password, response.password))
  ) {
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

    res.status(200).json({
      success: true,
      msg: "Đăng nhập thành công",
      accessToken,
    });
    return;
  } else {
    throw new Error("Sai mật khẩu");
  }
});

export const refreshToken = asyncHandler(async (req, res) => {
  //lay token tu db
  const token = req.body.refreshToken;
  //check token hop le
  jwt.verify(
    token,
    process.env.JWT_REFRESH_KEY as string,
    (err: VerifyErrors | null, decoded: JwtPayload | string | undefined) => {
      if (err) {
        return res.status(401).json({
          success: false,
          msg: "Token không hợp lệ",
        });
      }

      const payload = decoded as { id: string };

      // check token trong DB
      db.User.findOne({
        where: {
          id: payload.id,
          refreshToken: token,
        },
      }).then((response: { id: number; role: string }) => {
        return res.status(200).json({
          success: !!response,
          newAccessToken: response
            ? generateAccessToken(response.id, response.role)
            : "Token không hợp lệ",
        });
      });
    }
  );
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body.email;
  if (!email) throw new Error("Missing email");
  const user = await db.User.findOne({ where: { email } });
  if (!user) throw new Error("User not found");
  const resetToken = await createPasswordChangeToken(user);

  const html = `Nhập reset token để thay đổi mật khẩu. 
        Token sẽ hết hạn sau 15 phút. <b>${resetToken}</b>`;

  const data = {
    email,
    html,
    subject: "Quên mật khẩu",
  };

  const rs = await addMailJob(data);
  res.status(200).json({
    success: true,
    msg: rs ? "Vui lòng kiểm tra email của bạn" : "Something went wrong",
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { newPassword, token } = req.body;
  if (!newPassword) throw new Error("Vui lòng nhập mật khẩu mới");
  if (!token) throw new Error("Vui lòng nhập mã xác nhận");
  const passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  const user = await db.User.findOne({
    where: {
      resetPwdToken: passwordResetToken,
      resetPwdExpires: { [Op.gt]: Date.now() },
    },
  });
  if (!user) throw new Error("Token không hợp lệ hoặc đã hết hạn");
  user.update({
    password: hashPassword(newPassword),
    resetPwdToken: null,
    resetPwdExpires: null,
    passwordChangedAt: Date.now(),
  });

  res.status(200).json({
    success: user ? true : false,
    msg: user
      ? "Cập nhật mật khẩu thành công, vui lòng đăng nhập lại"
      : "Cập nhật mật khẩu thất bại",
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token, email } = req.body;
  const user = await db.User.findOne({
    where: { email, registerToken: token },
  });
  if (!user) throw new Error("Token không hợp lệ");
  await user.update({ emailVerified: true });
  res.status(200).json({
    success: true,
    msg: "Xác nhận đăng ký thành công, bạn có thể đăng nhập",
    user,
  });
});
