import type { NextFunction, Request, Response } from "express";
import type { VerifyErrors } from "jsonwebtoken";

export const errorHandler = (
  err: VerifyErrors | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  const message = err?.message?.replaceAll(`\"`, "");
  res.status(statusCode).json({
    success: false,
    message: message || "Lỗi hệ thống",
  });
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(
    `Không tìm thấy đường dẫn ${req.method} ${req.originalUrl} `
  );
  res.status(404);
  next(error);
};
