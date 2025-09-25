import jwt from "jsonwebtoken";
import "dotenv/config";

export const generateAccessToken = (uid: number, role: number) =>
  jwt.sign({ id: uid, role }, process.env.JWT_ACCESS_KEY as string, {
    expiresIn: "7d",
  });
export const generateRefreshToken = (uid: number) =>
  jwt.sign(
    { id: uid },
    (process.env.JWT_REFRESH_KEY as string) || "Khuutientuoc123@",
    {
      expiresIn: "30d",
    }
  );
