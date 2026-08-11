import { AppError } from "../../core/errors/AppError";
import { hashPassword, verifyPassword, JwtHelper } from "../../core/utils/crypto";
import { UserRepository } from "../user/user.repository";
import { UserResponse } from "../user/user.types";
import { AuthResponse } from "./auth.types";

export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  private mapToUserResponse(userDoc: any): UserResponse {
    return {
      id: userDoc._id.toString(),
      name: userDoc.name,
      email: userDoc.email,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
    };
  }

  async register(payload: any): Promise<AuthResponse> {
    const existing = await this.userRepository.findByEmail(payload.email);
    if (existing) {
      throw new AppError("Email already in use", 409);
    }

    const passwordHash = hashPassword(payload.password);
    const userDoc = await this.userRepository.create({
      name: payload.name,
      email: payload.email,
      passwordHash,
    });

    const user = this.mapToUserResponse(userDoc);
    const token = JwtHelper.sign({ sub: user.id, email: user.email });

    return { user, token };
  }

  async login(payload: any): Promise<AuthResponse> {
    const userDoc = await this.userRepository.findByEmail(payload.email);
    if (!userDoc) {
      throw new AppError("Invalid email or password", 401);
    }

    const isValid = verifyPassword(payload.password, userDoc.passwordHash);
    if (!isValid) {
      throw new AppError("Invalid email or password", 401);
    }

    const user = this.mapToUserResponse(userDoc);
    const token = JwtHelper.sign({ sub: user.id, email: user.email });

    return { user, token };
  }
}
