"use strict";

import { enumData } from "../utils/constant.js";
import {
  BOOLEAN,
  DATE,
  ENUM,
  INTEGER,
  STRING,
  type QueryInterface,
  type Sequelize,
} from "sequelize"; // thêm type an toàn

export default {
  async up(queryInterface: QueryInterface, Sequelize: Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: INTEGER,
      },
      email: {
        type: STRING,
      },
      phone: {
        type: STRING,
      },
      fullname: {
        type: STRING,
      },
      emailVerified: {
        type: BOOLEAN,
        defaultValue: false,
      },
      phoneVerified: {
        type: BOOLEAN,
        defaultValue: false,
      },
      password: {
        type: STRING,
      },
      role: {
        type: ENUM,
        values: enumData.code,
        defaultValue: "2904",
      },
      resetPwdToken: {
        type: STRING,
      },
      resetPwdExpires: {
        type: DATE,
      },
      passwordChangedAt: {
        type: DATE,
      },
      refreshToken: {
        type: STRING,
      },
      registerToken: {
        type: STRING,
      },
      createdAt: {
        allowNull: false,
        type: DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DATE,
      },
    });
  },

  async down(queryInterface: QueryInterface, Sequelize: Sequelize) {
    await queryInterface.dropTable("Users");
  },
};
