import { inject, injectable } from "tsyringe";
import { UserRepository } from "../repositories/userRepository.js";

export type UserData = {
  email: string;
  password: string;
  fullname: string;
  phone: string;
};

@injectable()
export class UserService {
  constructor(@inject("UserRepository") private userRepo: UserRepository) {}

  async getUserProfile(id: number) {
    return await this.userRepo.findById(id, [
      "email",
      "fullname",
      "phone",
      "id",
      "emailVerified",
      "phoneVerified",
      "createdAt",
    ]);
  }

  async getAllUsers() {
    return await this.userRepo.find({
      select: [
        "email",
        "fullname",
        "phone",
        "id",
        "emailVerified",
        "phoneVerified",
        "createdAt",
      ],
    });
  }

  async createUser(userData: UserData) {
    const existingUser = await this.userRepo.findByEmail(userData.email);
    if (existingUser) throw new Error("Email đã được sử dụng");
    return await this.userRepo.create(userData);
  }

  async updateUser(id: number, userData: Partial<UserData>) {
    const user = await this.userRepo.findById(id);
    if (!user) throw new Error("Tài khoản không tồn tại");
    const safeData: Partial<UserData> = { ...userData };
    if (user.emailVerified && "email" in safeData) {
      delete safeData.email;
      throw new Error("Email đã xác minh");
    }
    if (user.phoneVerified && "phone" in safeData) {
      delete safeData.phone;
      throw new Error("Số điện thoại đã xác minh");
    }
    return await this.userRepo.update(id, safeData);
  }

  async deleteUser(id: number) {
    await this.userRepo.delete(id, "Tài khoản không tồn tại");
  }
}
