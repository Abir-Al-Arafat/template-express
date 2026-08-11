import { Request, Response } from "express";
import { ResponseBuilder } from "../../core/utils/apiResponse";
import { AuthService } from "./auth.service";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const authResult = await this.authService.register(req.body);
    res
      .status(201)
      .json(ResponseBuilder.success("Registration successful", authResult));
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const authResult = await this.authService.login(req.body);
    res
      .status(200)
      .json(ResponseBuilder.success("Login successful", authResult));
  };
}
