import asyncHandler from "express-async-handler";
import "dotenv/config";
import { injectable, inject } from "tsyringe";
import { UserService } from "../services/user.service.js";
import { AuthService } from "../services/auth.service.js";

@injectable()
export class UserController {
  constructor(@inject("UserService") private userService: UserService) {}

  getUserById = asyncHandler(async (req, res) => {
    const user = await this.userService.getUserProfile(Number(req.params.uid));
    res.json({
      success: true,
      msg: user ? user : "Không tìm thấy người dùng",
    });
  });

  getAllUsers = asyncHandler(async (req, res) => {
    const users = await this.userService.getAllUsers();
    res.status(200).json({
      success: true,
      msg: "Lấy danh sách người dùng thành công",
      users,
    });
  });

  createUser = asyncHandler(async (req, res) => {
    const { email, password, fullname, phone } = req.body;
    if (!email || !password || !fullname || !phone)
      throw new Error("Missing inputs");
    const response = await this.userService.createUser({
      email,
      password: await AuthService.hashPassword(password),
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
    await this.userService.updateUser(Number(uid), req.body);
    res.status(200).json({
      success: true,
      msg: "Cập nhật người dùng thành công",
    });
    return;
  });

  deleteUser = asyncHandler(async (req, res) => {
    const { uid } = req.params;
    await this.userService.deleteUser(Number(uid));
    res.status(200).json({
      success: true,
      msg: `Đã xóa tài khoản id: ${uid}`,
    });
  });
}
