import { injectable } from "tsyringe";
import { User } from "../entity/User.ts";
import { GenericRepository } from "./genericRepository.ts";
import { AppDataSource } from "../data-source.ts";
import brcypt from "bcryptjs";
import crypto from "crypto";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../middlewares/jwt.ts";
import { AuthService } from "../services/auth.service.ts";

@injectable()
export class UserRepository extends GenericRepository<User> {
  constructor() {
    super(User, AppDataSource.manager);
  }

  private static isCorrectPassword(
    inputPassword: string,
    hashedPassword: string
  ) {
    return brcypt.compareSync(inputPassword, hashedPassword);
  }

  async createPasswordChangeToken(userId: number) {
    const resetToken = crypto.randomBytes(32).toString("hex");
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
    await this.repository.update(
      { id: userId },
      {
        resetPwdToken: passwordResetToken,
        resetPwdExpires: passwordResetExpires,
      }
    );
    return resetToken;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOneBy({ email });
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.repository.findOneBy({ registerToken: token });
    if (!user) throw new Error("Token không hợp lệ");
    await this.repository.update(
      { registerToken: token },
      { emailVerified: true }
    );
  }

  async login(email: string, password: string): Promise<User | null> {
    const user = await this.repository.findOneBy({ email });
    if (!user) throw new Error("Tài khoản không tồn tại");
    if (!user.emailVerified) throw new Error("Tài khoản chưa được xác thực");
    if (!UserRepository.isCorrectPassword(password, user.password))
      throw new Error("Sai mật khẩu");
    const newRefreshToken = generateRefreshToken(user.id);
    await this.repository.update(
      { id: user.id },
      { refreshToken: newRefreshToken }
    );
    return user;
  }

  async refreshToken(userId: number, token: string): Promise<string> {
    const user = await this.repository.findOneBy({
      id: userId,
      refreshToken: token,
    });
    if (!user) throw new Error("Token không hợp lệ");
    return generateAccessToken(user.id, user.role);
  }

  async resetPassword(token: string, newPassword: string): Promise<User> {
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    const user = await this.repository.findOneBy({
      resetPwdToken: passwordResetToken,
    });
    if (!user) throw new Error("Token không hợp lệ");
    if (user.resetPwdExpires && user.resetPwdExpires < new Date()) {
      user.resetPwdToken = null;
      user.resetPwdExpires = null;
      await this.repository.save(user);
      throw new Error("Token đã hết hạn");
    }
    user.password = await AuthService.hashPassword(newPassword);
    user.resetPwdToken = "";
    user.resetPwdExpires = null;
    user.passwordChangedAt = new Date();
    return await this.repository.save(user);
  }
}
