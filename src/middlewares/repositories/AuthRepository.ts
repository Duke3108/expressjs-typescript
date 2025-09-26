import { injectable } from "tsyringe";
import db from "../../models/index.ts";
import brcypt from "bcryptjs";
import type { UserData } from "./UserRepository.ts";
import { generateAccessToken, generateRefreshToken } from "../jwt.ts";
import crypto from "crypto";
import { Op } from "sequelize";
import { hashPassword } from "../../controllers/auth.controller.ts";

const createPasswordChangeToken = async (userId: number) => {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const passwordResetExpires = Date.now() + 15 * 60 * 1000;
  const user = await db.User.findByPk(userId);
  await user.update({
    resetPwdToken: passwordResetToken,
    resetPwdExpires: passwordResetExpires,
  });
  return resetToken;
};

export type UserRegisterInput = UserData & {
  registerToken: string;
};

const isCorrectPassword = (inputPassword: string, hashedPassword: string) => {
  return brcypt.compareSync(inputPassword, hashedPassword);
};

@injectable()
export class AuthRepository {
  async register(userData: UserRegisterInput) {
    const user = await db.User.findOne({ where: { email: userData.email } });
    if (user) throw new Error("Tài khoản đã tồn tại");
    return await db.User.create(userData);
  }

  async verifyEmail(token: string) {
    const user = await db.User.findOne({ where: { registerToken: token } });
    if (!user) throw new Error("Token không hợp lệ");
    user.emailVerified = true;
    return await user.save();
  }

  async login(email: string, password: string) {
    const user = await db.User.findOne({ where: { email } });
    if (!user) throw new Error("Tài khoản không tồn tại");
    if (!user.emailVerified) throw new Error("Tài khoản chưa được xác thực");
    if (!isCorrectPassword(password, user.password))
      throw new Error("Sai mật khẩu");
    const newRefreshToken = generateRefreshToken(user.id);
    user.refreshToken = newRefreshToken;
    return await user.save();
  }

  // async refreshToken(userId: number, token: string) {
  //   // check token trong DB
  //   const user = await db.User.findOne({
  //     where: {
  //       id: userId,
  //       refreshToken: token,
  //     },
  //   });
  //   if (!user) throw new Error("Token không hợp lệ 1");
  //   return generateAccessToken(user.id, user.role);
  // }

  async forgotPassword(email: string) {
    const user = await db.User.findOne({ where: { email } });
    if (!user) throw new Error("Tài khoản không tồn tại");
    return await createPasswordChangeToken(user.id);
  }

  async resetPassword(token: string, newPassword: string) {
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    const user = await db.User.findOne({
      where: {
        resetPwdToken: passwordResetToken,
        // resetPwdExpires: { [Op.gt]: Date.now() },
      },
    });
    if (!user) throw new Error("Token không hợp lệ");
    if (user.resetPwdExpires && user.resetPwdExpires < new Date()) {
      user.resetPwdToken = null;
      user.resetPwdExpires = null;
      await user.save();
      throw new Error("Token đã hết hạn");
    }
    user.password = hashPassword(newPassword);
    user.resetPwdToken = "";
    user.resetPwdExpires = null;
    user.passwordChangedAt = new Date();
    return await user.save();
  }
}
