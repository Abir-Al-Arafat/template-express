import { NextFunction, Response } from "express";
import { AppError } from "../core/errors/AppError";
import { JwtHelper } from "../core/utils/crypto";
import { AuthenticatedRequest } from "../modules/user/user.controller";

export const authMiddleware = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("No token provided", 401);
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new AppError("No token provided", 401);
  }
  const decoded = JwtHelper.verify(token);

  if (!decoded) {
    throw new AppError("Invalid or expired token", 401);
  }

  req.user = {
    id: decoded.sub,
    email: decoded.email,
  };

  next();
};
