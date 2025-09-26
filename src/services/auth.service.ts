import { inject, injectable } from "tsyringe";
import {
  AuthRepository,
  type UserRegisterInput,
} from "../middlewares/repositories/AuthRepository.ts";
import addMailJob, { type MailJobData } from "../queues/mail.producer.ts";
import jwt, { type JwtPayload, type VerifyErrors } from "jsonwebtoken";
import "dotenv/config";

@injectable()
export class AuthService {
  constructor(@inject("AuthRepository") private authRepo: AuthRepository) {}

  async register(userData: UserRegisterInput) {
    return await this.authRepo.register(userData);
  }

  async verifyEmail(token: string) {
    return await this.authRepo.verifyEmail(token);
  }

  async login(email: string, password: string) {
    return await this.authRepo.login(email, password);
  }

  // async refreshToken(token: string) {
  //   return jwt.verify(
  //     token,
  //     process.env.JWT_REFRESH_KEY as string,
  //     async (
  //       err: VerifyErrors | null,
  //       decoded: JwtPayload | string | undefined
  //     ) => {
  //       if (err) {
  //         throw new Error("Token không hợp lệ 2");
  //       }
  //       const payload = decoded as { id: number };
  //       return await this.authRepo.refreshToken(payload.id, token);
  //     }
  //   );
  // }

  async forgotPassword(email: string) {
    return await this.authRepo.forgotPassword(email);
  }

  async resetPassword(token: string, newPassword: string) {
    return await this.authRepo.resetPassword(token, newPassword);
  }

  async sendMail(data: MailJobData) {
    return await addMailJob(data);
  }
}
