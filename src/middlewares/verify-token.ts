import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

export const verifyToken = async (req: any, res: any, next: any) => {
  if (req.headers.authorization?.startsWith("Bearer")) {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(
      token,
      process.env.JWT_ACCESS_KEY as string,
      async (err: any, decoded: any) => {
        if (err) {
          return res.status(401).json({ message: "Token không hợp lệ" });
        }
        req.user = decoded;
        next();
      }
    );
  } else {
    return res.status(401).json({ message: "Bạn chưa đăng nhập" });
  }
};
export const isAdmin = asyncHandler(async (req: any, res: any, next: any) => {
  const { role } = req.user;
  if (+role !== 3108)
    return res.status(401).json({
      success: false,
      mes: "Require admin role",
    });
  next();
});
