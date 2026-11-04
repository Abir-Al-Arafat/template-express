import { Request, Response } from "express";
import HTTP_STATUS from "../../constants/statusCodes";
import { ResponseBuilder } from "../../core/utils/apiResponse";
import { AuthService } from "./auth.service";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const authResult = await this.authService.register(req.body);
    res
      .status(HTTP_STATUS.CREATED)
      .json(
        ResponseBuilder.success("Registration successful", authResult, HTTP_STATUS.CREATED),
      );
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const authResult = await this.authService.login(req.body);
    res
      .status(HTTP_STATUS.OK)
      .json(ResponseBuilder.success("Login successful", authResult, HTTP_STATUS.OK));
  };
}
