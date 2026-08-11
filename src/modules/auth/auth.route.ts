import { Router } from "express";
import multer from "multer"
import { asyncHandler } from "../../core/utils/asyncHandler";
import { validateRequestMiddleware } from "../../middlewares/validateRequest.middleware";
import { UserRepository } from "../user/user.repository";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthValidation } from "./auth.validation";

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

const upload = multer();
const authRouter = Router();

authRouter.post(
  "/register",
  upload.none(),
  AuthValidation.register,
  validateRequestMiddleware,
  asyncHandler(authController.register),
);

authRouter.post(
  "/login",
  upload.none(),
  AuthValidation.login,
  validateRequestMiddleware,
  asyncHandler(authController.login),
);

export { authRouter };
