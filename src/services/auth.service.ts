import { inject, injectable } from "tsyringe";
import addMailJob, { type MailJobData } from "../queues/mail.producer.ts";
import "dotenv/config";
import brcypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../middlewares/jwt.ts";
import { UserRepository } from "../repositories/userRepository.ts";
import type { UserData } from "./user.service.ts";
import crypto from "crypto";

type UserRegisterData = UserData & {
  registerToken: string;
};

@injectable()
export class AuthService {
  constructor(@inject("UserRepository") private userRepo: UserRepository) {}

  private static isCorrectPassword(
    inputPassword: string,
    hashedPassword: string
  ) {
    return brcypt.compareSync(inputPassword, hashedPassword);
  }

  public static async hashPassword(password: string) {
    const salt = await brcypt.genSalt(10);
    const hashedPassword = await brcypt.hash(password, salt);
    return hashedPassword;
  }

  async createPasswordChangeToken(userId: number) {
    const resetToken = crypto.randomBytes(32).toString("hex");
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
    await this.userRepo.update(userId, {
      resetPwdToken: passwordResetToken,
      resetPwdExpires: passwordResetExpires,
    });
    return resetToken;
  }

  async register(userData: UserRegisterData) {
    const user = await this.userRepo.findByEmail(userData.email);
    if (user) throw new Error("Tài khoản đã tồn tại");
    return await this.userRepo.create(userData);
  }

  async verifyEmail(token: string) {
    const user = await this.userRepo.findOne({
      where: {
        registerToken: token,
      },
    });
    if (!user) throw new Error("Token không hợp lệ");
    return await this.userRepo.update(user.id, {
      emailVerified: true,
      registerToken: null,
    });
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new Error("Tài khoản không tồn tại");
    if (!user.emailVerified) throw new Error("Tài khoản chưa được xác thực");
    if (!AuthService.isCorrectPassword(password, user.password))
      throw new Error("Sai mật khẩu");
    const newRefreshToken = generateRefreshToken(user.id);
    await this.userRepo.update(user.id, { refreshToken: newRefreshToken });

    const accessToken = generateAccessToken(user.id, user.role);
    return { user, accessToken };
  }

  async refreshToken(userId: number, token: string) {
    const user = await this.userRepo.findOne({
      where: {
        id: userId,
        refreshToken: token,
      },
    });
    if (!user) throw new Error("Token không hợp lệ");
    return generateAccessToken(user.id, user.role);
  }

  async forgotPassword(email: string) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new Error("Tài khoản không tồn tại");
    return await this.createPasswordChangeToken(user.id);
  }

  async resetPassword(token: string, newPassword: string) {
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    const user = await this.userRepo.findOne({
      where: {
        resetPwdToken: passwordResetToken,
      },
    });
    if (!user) throw new Error("Token không hợp lệ");
    if (user.resetPwdExpires && user.resetPwdExpires < new Date()) {
      await this.userRepo.update(user.id, {
        resetPwdToken: null,
        resetPwdExpires: null,
      });
      throw new Error("Token đã hết hạn");
    }

    return await this.userRepo.update(user.id, {
      password: await AuthService.hashPassword(newPassword),
      resetPwdToken: null,
      resetPwdExpires: null,
      passwordChangedAt: new Date(),
    });
  }

  async sendMail(data: MailJobData) {
    return await addMailJob(data);
  }
}
