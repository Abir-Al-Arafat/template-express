import { NextFunction, Request, Response } from "express";
import HTTP_STATUS from "../constants/statusCodes";
import { validationResult } from "express-validator";
import { ResponseBuilder } from "../core/utils/apiResponse";

export const validateRequestMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(HTTP_STATUS.BAD_REQUEST).json(
      ResponseBuilder.failure(
        errors
          .array()
          .map((error) => error.msg)
          .join(", "),
        HTTP_STATUS.BAD_REQUEST,
      ),
    );
    return;
  }

  next();
};
