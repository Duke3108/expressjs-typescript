import { inject, injectable } from "tsyringe";
import {
  AuthRepository,
  type UserRegisterInput,
} from "../middlewares/repositories/AuthRepository.ts";
import addMailJob, { type MailJobData } from "../queues/mail.producer.ts";
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

  async refreshToken(userId: number, token: string) {
    return this.authRepo.refreshToken(userId, token);
  }

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
