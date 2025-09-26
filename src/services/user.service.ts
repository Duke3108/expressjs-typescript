import { injectable, inject } from "tsyringe";
import {
  UserRepository,
  type UserData,
} from "../middlewares/repositories/UserRepository.ts";
import type { Request } from "express";
import type { ParsedQs } from "qs";

@injectable()
export class UserService {
  constructor(@inject(UserRepository) private userRepo: UserRepository) {}

  async getUserProfile(id: number) {
    const user = await this.userRepo.findById(id);
    if (!user) throw new Error("Tài khoản không tồn tại");
    return user;
  }

  async getAllUsers(query: ParsedQs) {
    const { rows: users, count } = await this.userRepo.findAll(query);
    return { users, count };
  }

  async createUser(userData: UserData) {
    return await this.userRepo.create(userData);
  }

  async updateUser(id: number, userData: Partial<UserData>) {
    return await this.userRepo.update(id, userData);
  }
  async deleteUser(id: number) {
    return await this.userRepo.delete(id);
  }
}
