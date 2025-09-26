import { Model, DataTypes, Sequelize } from "sequelize";
import { enumData } from "../utils/constant.ts";

export default (sequelize: Sequelize) => {
  class User extends Model {
    static associate() {
      // define association here
    }
  }

  User.init(
    {
      email: DataTypes.STRING,
      phone: DataTypes.STRING,
      fullname: DataTypes.STRING,
      emailVerified: DataTypes.BOOLEAN,
      phoneVerified: DataTypes.BOOLEAN,
      password: DataTypes.STRING,
      role: {
        type: DataTypes.ENUM(...enumData.code),
      },
      resetPwdToken: DataTypes.STRING,
      resetPwdExpires: DataTypes.DATE,
      passwordChangedAt: DataTypes.DATE,
      refreshToken: DataTypes.STRING,
      registerToken: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
      tableName: "Users", // (tùy chọn) nếu bạn muốn đặt tên table rõ ràng
    }
  );

  return User;
};
