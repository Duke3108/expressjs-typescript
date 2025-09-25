import asyncHandler from "express-async-handler";
import db from "../models/index.js";
import { Op } from "sequelize";

export const createUser = asyncHandler(async (req: any, res: any) => {
  const { email, password, fullname, phone } = req.body;
  if (!email || !password || !fullname || !phone) {
    return res.status(400).json({
      success: false,
      mes: "missing inputs",
    });
  }
  const user = await db.User.findOne({ email });
  if (user) throw new Error("User has existed");
  else {
    const response = await db.User.create({
      email,
      password,
      fullname,
      phone,
    });
    return res.status(200).json({
      success: response ? true : false,
      createdUser: response ? response : "Cannot create user",
    });
  }
});

export const getAllUsers = asyncHandler(async (req: any, res: any) => {
  const queries = { ...req.query };

  // Tách các field đặc biệt
  const excludeFields = ["limit", "sort", "page", "fields"];
  excludeFields.forEach((el) => delete queries[el]);

  let formatedQueries: { [key: string]: any } = {};

  // Search q: email, fullname, phone
  if (req.query.q) {
    formatedQueries[Op.or as any] = [
      { email: { [Op.iLike]: `%${req.query.q}%` } },
      { fullname: { [Op.iLike]: `%${req.query.q}%` } },
      { phone: { [Op.iLike]: `%${req.query.q}%` } },
    ];
  }

  // Sorting
  let order = [];
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").map((el: any) => {
      if (el.startsWith("-")) return [el.substring(1), "DESC"];
      return [el, "ASC"];
    });
    order = sortBy;
  }

  // Pagination
  const page = +req.query.page || 1;
  const limit = +req.query.limit || 10;
  const offset = (page - 1) * limit;

  // Execute query
  const { rows: users, count } = await db.User.findAndCountAll({
    where: formatedQueries,
    order,
    limit,
    offset,
  });

  return res.status(200).json({
    success: true,
    counts: count,
    users,
  });
});

export const getUserById = asyncHandler(async (req: any, res: any) => {
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

export const updateUser = asyncHandler(async (req: any, res: any) => {
  const { uid } = req.params;
  const { fullname, phone } = req.body;
  if (!fullname || !phone) throw new Error("Missing inputs");
  const user = await db.User.findByPk(uid);
  if (user) {
    await user.update({ fullname, phone });
  }
  return res.status(200).json({
    success: user ? true : false,
    mes: user ? "Cập nhật người dùng thành công" : "Something went wrong",
  });
});

export const deleteUser = asyncHandler(async (req: any, res: any) => {
  const { uid } = req.params;
  const user = await db.User.findByPk(uid);
  const response = await db.User.destroy({ where: { id: uid } });
  return res.status(200).json({
    success: response ? true : false,
    mes: response
      ? `Đã xóa tài khoản của người dùng ${user.fullname}`
      : "Không tìm thấy người dùng",
  });
});
