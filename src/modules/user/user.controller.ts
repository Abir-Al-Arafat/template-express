import { Request, Response } from "express";
import { AppError } from "../../core/errors/AppError";
import { ResponseBuilder } from "../../core/utils/apiResponse";
import { UserService } from "./user.service";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export class UserController {
  constructor(private readonly userService: UserService) {}

  getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
      throw new AppError("Unauthorized access", 401);
    }

    const profile = await this.userService.getProfile(req.user.id);
    res
      .status(200)
      .json(ResponseBuilder.success("Profile fetched successfully", profile));
  };
}
