import asyncHandler from "express-async-handler";
import db from "../models/index.ts";
import "dotenv/config";
import { injectable, inject } from "tsyringe";
import { UserService } from "../services/user.service.ts";
import { hashPassword } from "./auth.controller.ts";

@injectable()
export class UserController {
  constructor(@inject(UserService) private userService: UserService) {}

  getUserById = asyncHandler(async (req, res) => {
    const user = await this.userService.getUserProfile(Number(req.params.uid));
    res.json({
      success: true,
      user,
    });
  });

  getAllUsers = asyncHandler(async (req, res) => {
    const { users, count } = await this.userService.getAllUsers(req.query);
    res.status(200).json({
      success: true,
      counts: count,
      users,
    });
  });

  createUser = asyncHandler(async (req, res) => {
    const { email, password, fullname, phone } = req.body;
    if (!email || !password || !fullname || !phone)
      throw new Error("Missing inputs");
    const response = await this.userService.createUser({
      email,
      password: hashPassword(password),
      fullname,
      phone,
    });

    res.status(200).json({
      success: response ? true : false,
      createdUser: response ? response : "Tạo tài khoản thất bại",
    });
    return;
  });

  updateUser = asyncHandler(async (req, res) => {
    const { uid } = req.params;
    const response = await this.userService.updateUser(Number(uid), req.body);
    res.status(200).json({
      success: response ? true : false,
      mes: response
        ? "Cập nhật người dùng thành công"
        : "Cập nhật người dùng thất bại",
    });
    return;
  });

  deleteUser = asyncHandler(async (req, res) => {
    const { uid } = req.params;
    const response = await this.userService.deleteUser(Number(uid));
    res.status(200).json({
      success: response ? true : false,
      mes: response ? `Đã xóa tài khoản id: ${uid}` : "Xóa tài khoản thất bại",
    });
  });
}
