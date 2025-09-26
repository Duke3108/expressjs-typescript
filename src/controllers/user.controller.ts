import asyncHandler from "express-async-handler";
import db from "../models/index.ts";
import { Op, type Order, type WhereOptions } from "sequelize";
import "dotenv/config";

export const createUser = asyncHandler(async (req, res) => {
  const { email, password, fullname, phone } = req.body;
  if (!email || !password || !fullname || !phone) {
    res.status(400).json({
      success: false,
      msg: "missing inputs",
    });
  }
  const user = await db.User.findOne({ where: { email } });
  if (user) throw new Error("Tài khoản đã tồn tại");
  const response = await db.User.create({
    email,
    password,
    fullname,
    phone,
  });
  res.status(200).json({
    success: response ? true : false,
    createdUser: response ? response : "Tạo tài khoản thất bại",
  });
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const queries = { ...req.query };

  // Tách các field đặc biệt
  const excludeFields = ["limit", "sort", "page", "fields"];
  excludeFields.forEach((el) => delete queries[el]);

  let formatedQueries: WhereOptions = {};

  if (req.query.q) {
    formatedQueries = {
      [Op.or]: [
        { email: { [Op.iLike]: `%${req.query.q}%` } },
        { fullname: { [Op.iLike]: `%${req.query.q}%` } },
        { phone: { [Op.iLike]: `%${req.query.q}%` } },
      ],
    };
  }

  // Sorting
  let order: Order = [];
  if (req.query.sort && typeof req.query.sort === "string") {
    const sortBy: Order = req.query.sort.split(",").map((el) => {
      if (el.startsWith("-")) return [el.substring(1), "DESC"];
      return [el, "ASC"];
    });
    order = sortBy;
  }

  // Pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // Execute query
  const { rows: users, count } = await db.User.findAndCountAll({
    where: formatedQueries,
    order,
    limit,
    offset,
  });

  res.status(200).json({
    success: true,
    counts: count,
    users,
  });
});

export const getUserById = asyncHandler(async (req, res) => {
  const { uid } = req.params;
  const user = await db.User.findByPk(uid, {
    attributes: {
      exclude: ["password", "resetPwdExpires", "updatedAt", "resetPwdToken"],
    },
  });
  if (!user) {
    throw new Error("Không tìm thấy người dùng");
  }
  res.json({
    success: true,
    user,
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  const { uid } = req.params;
  const { fullname } = req.body;
  if (!fullname) throw new Error("Missing inputs");
  const user = await db.User.findByPk(uid);
  if (!user) throw new Error("Không tìm thấy người dùng");
  const response = await user.update({ fullname });
  res.status(200).json({
    success: response ? true : false,
    mes: response
      ? "Cập nhật người dùng thành công"
      : "Cập nhật người dùng thất bại",
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { uid } = req.params;
  const user = await db.User.findByPk(uid);
  if (!user) throw new Error("Không tìm thấy người dùng");
  const response = await db.User.destroy({ where: { id: uid } });
  res.status(200).json({
    success: response ? true : false,
    mes: response
      ? `Đã xóa tài khoản ${user.fullname}`
      : "Xóa tài khoản thất bại",
  });
});
