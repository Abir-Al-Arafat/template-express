import { NextFunction, Request, Response } from "express";
import { AppError } from "../core/errors/AppError";
import { ResponseBuilder } from "../core/utils/apiResponse";

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    console.error("err instanceof AppError", err);
    res.status(err.statusCode).json(ResponseBuilder.failure(err.message));
    return;
  }
  console.error("err default case", err);
  res.status(500).json(ResponseBuilder.failure("Internal server error"));
};
