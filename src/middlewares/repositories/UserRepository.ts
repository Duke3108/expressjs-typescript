import { injectable } from "tsyringe";
import db from "../../models/index.ts";
import { Op, type Order, type WhereOptions } from "sequelize";
import type { ParsedQs } from "qs";

export type UserData = {
  email: string;
  password: string;
  fullname: string;
  phone: string;
};

@injectable()
export class UserRepository {
  async findById(id: number) {
    return await db.User.findByPk(id, {
      attributes: {
        exclude: ["password", "resetPwdExpires", "updatedAt", "resetPwdToken"],
      },
    });
  }

  //BUG: cannot search params
  async findAll(query: ParsedQs) {
    const queries = { ...query };

    // Tách các field đặc biệt
    const excludeFields = ["limit", "sort", "page", "fields"];
    excludeFields.forEach((el) => delete queries[el]);

    let formatedQueries: WhereOptions = {};

    if (query.q) {
      formatedQueries = {
        [Op.or]: [
          { email: { [Op.iLike]: `%${query.q}%` } },
          { fullname: { [Op.iLike]: `%${query.q}%` } },
          { phone: { [Op.iLike]: `%${query.q}%` } },
        ],
      };
    }

    // Sorting
    let order: Order = [];
    if (query.sort && typeof query.sort === "string") {
      const sortBy: Order = query.sort.split(",").map((el) => {
        if (el.startsWith("-")) return [el.substring(1), "DESC"];
        return [el, "ASC"];
      });
      order = sortBy;
    }

    // Pagination
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const offset = (page - 1) * limit;

    // Execute query
    return await db.User.findAndCountAll({
      where: formatedQueries,
      order,
      limit,
      offset,
    });
  }

  async create(userData: UserData) {
    const user = await db.User.findOne({ where: { email: userData.email } });
    if (user) throw new Error("Tài khoản đã tồn tại");
    return await db.User.create(userData);
  }

  async update(id: number, userData: Partial<UserData>) {
    const user = await db.User.findByPk(id);
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
    return await user.update(safeData);
  }

  async delete(id: number) {
    const user = await db.User.findByPk(id);
    if (!user) throw new Error("Tài khoản không tồn tại");
    await user.destroy();
    return user;
  }
}
