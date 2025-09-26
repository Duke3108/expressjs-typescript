import jwt, { type JwtPayload, type VerifyErrors } from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import type { NextFunction, Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload | string | undefined;
    }
  }
}

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.headers.authorization?.startsWith("Bearer")) {
    const token = req.headers.authorization.split(" ")[1] ?? "";
    jwt.verify(
      token,
      process.env.JWT_ACCESS_KEY as string,
      async (
        err: VerifyErrors | null,
        decoded: JwtPayload | string | undefined
      ) => {
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
export const isAdmin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { role } = req.user as JwtPayload;
    if (+role !== 3108)
      res.status(401).json({
        success: false,
        mes: "Require admin role",
      });
    ``;
    next();
  }
);
