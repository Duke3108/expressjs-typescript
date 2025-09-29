import { inject, injectable } from "tsyringe";
import addMailJob, { type MailJobData } from "../queues/mail.producer.ts";
import "dotenv/config";
import db from "../models/index.ts";
import brcypt from "bcryptjs";
import crypto from "crypto";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../middlewares/jwt.ts";
import { UserRepository } from "../repositories/userRepository.ts";
import type { UserData } from "./user.service.ts";

type UserRegisterData = UserData & {
  registerToken: string;
};

@injectable()
export class AuthService {
  constructor(@inject("UserRepository") private userRepo: UserRepository) {}

  public static async hashPassword(password: string) {
    const salt = await brcypt.genSalt(10);
    const hashedPassword = await brcypt.hash(password, salt);
    return hashedPassword;
  }

  async register(userData: UserRegisterData) {
    const user = await this.userRepo.findByEmail(userData.email);
    if (user) throw new Error("Tài khoản đã tồn tại");
    return await this.userRepo.create(userData);
  }

  async verifyEmail(token: string) {
    return await this.userRepo.verifyEmail(token);
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.login(email, password);
    if (!user) throw new Error("Đăng nhập thất bại");
    const accessToken = generateAccessToken(user.id, user.role);
    return { user, accessToken };
  }

  async refreshToken(userId: number, token: string) {
    return await this.userRepo.refreshToken(userId, token);
  }

  async forgotPassword(email: string) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new Error("Tài khoản không tồn tại");
    return await this.userRepo.createPasswordChangeToken(user.id);
  }

  async resetPassword(token: string, newPassword: string) {
    return await this.userRepo.resetPassword(token, newPassword);
  }

  async sendMail(data: MailJobData) {
    return await addMailJob(data);
  }
}
