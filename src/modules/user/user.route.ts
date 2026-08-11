import { Router } from "express";
import { asyncHandler } from "../../core/utils/asyncHandler";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { UserController } from "./user.controller";
import { UserRepository } from "./user.repository";
import { UserService } from "./user.service";

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

const userRouter = Router();

userRouter.get(
  "/profile",
  authMiddleware,
  asyncHandler(userController.getProfile),
);

export { userRouter };
