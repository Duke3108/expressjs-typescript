import jwt from "jsonwebtoken";

export const generateAccessToken = (uid: number, role: number) =>
  jwt.sign({ _id: uid, role }, process.env.JWT_ACCESS_KEY as string, {
    expiresIn: "7d",
  });
export const generateRefreshToken = (uid: number) =>
  jwt.sign({ _id: uid }, process.env.JWT_REFRESH_KEY as string, {
    expiresIn: "30d",
  });
