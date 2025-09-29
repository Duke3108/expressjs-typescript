import asyncHandler from "express-async-handler";
import { generateAccessToken } from "../middlewares/jwt.ts";
import makeToken from "uniqid";
import "dotenv/config";
import { inject, injectable } from "tsyringe";
import { AuthService } from "../services/auth.service.ts";
import jwt, { type JwtPayload } from "jsonwebtoken";

@injectable()
export class AuthController {
  constructor(@inject("AuthService") private authService: AuthService) {}

  register = asyncHandler(async (req, res) => {
    const { email, password, fullname, phone } = req.body;
    if (!email || !password || !fullname || !phone) {
      res.status(400).json({
        success: false,
        msg: "missing inputs",
      });
      return;
    }
    const token = makeToken();
    await this.authService.register({
      email,
      password: await AuthService.hashPassword(password),
      fullname,
      phone,
      registerToken: token,
    });
    await this.authService.sendMail({
      email,
      html: `Nhập token để hoàn tất quá trình đăng ký. <b>${token}</b>`,
      subject: "Xác nhận đăng ký tài khoản",
    });
    res.json({
      success: true,
      msg: "Kiểm tra email của bạn để hoàn tất quá trình đăng ký",
    });
    return;
  });

  verifyEmail = asyncHandler(async (req, res) => {
    await this.authService.verifyEmail(req.params.token ?? "");
    res.status(200).json({
      success: true,
      msg: "Đăng ký thành công, bạn có thể đăng nhập",
    });
  });

  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({
        success: false,
        msg: "Tài khoản hoặc mật khẩu không được để trống",
      });
      return;
    }

    const user = await this.authService.login(email, password);
    //tao access token
    const accessToken = generateAccessToken(user.id, user.role);

    res.status(200).json({
      success: true,
      msg: "Đăng nhập thành công",
      accessToken,
    });
    return;
  });

  refreshToken = asyncHandler(async (req, res) => {
    const token = req.body.refreshToken;
    if (!token) throw new Error("Thiếu refresh token");
    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_KEY as string
    ) as JwtPayload & { id: number };
    const newAccessToken = await this.authService.refreshToken(
      decoded.id,
      token
    );
    res.status(200).json({
      success: true,
      newAccessToken,
    });
    return;
  });

  forgotPassword = asyncHandler(async (req, res) => {
    const email = req.body.email;
    if (!email) throw new Error("Missing email");
    const resetToken = await this.authService.forgotPassword(email);
    await this.authService.sendMail({
      email,
      html: `Nhập token để thay đổi mật khẩu. <b>${resetToken}</b>`,
      subject: "Quên mật khẩu",
    });

    res.status(200).json({
      success: true,
      msg: resetToken
        ? "Vui lòng kiểm tra email của bạn"
        : "Something went wrong",
    });
  });

  resetPassword = asyncHandler(async (req, res) => {
    const { newPassword, token } = req.body;
    if (!newPassword) throw new Error("Vui lòng nhập mật khẩu mới");
    if (!token) throw new Error("Vui lòng nhập mã xác nhận");
    const user = await this.authService.resetPassword(token, newPassword);

    res.status(200).json({
      success: user ? true : false,
      msg: user
        ? "Cập nhật mật khẩu thành công, vui lòng đăng nhập lại"
        : "Cập nhật mật khẩu thất bại",
    });
  });
}
