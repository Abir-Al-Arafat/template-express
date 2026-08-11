import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { ResponseBuilder } from "../core/utils/apiResponse";

export const validateRequestMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json(
      ResponseBuilder.failure(
        errors
          .array()
          .map((error) => error.msg)
          .join(", "),
      ),
    );
    return;
  }

  next();
};
