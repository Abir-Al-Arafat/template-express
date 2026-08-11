import { AppError } from "../../core/errors/AppError";
import { UserRepository } from "./user.repository";
import { UserDocument } from "./user.model";
import { UserResponse } from "./user.types";

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  mapToUserResponse(userDoc: UserDocument): UserResponse {
    return {
      id: userDoc._id.toString(),
      name: userDoc.name,
      email: userDoc.email,
      createdAt: (userDoc as any).createdAt,
      updatedAt: (userDoc as any).updatedAt,
    };
  }

  async getProfile(userId: string): Promise<UserResponse> {
    const userDoc = await this.userRepository.findById(userId);
    if (!userDoc) {
      throw new AppError("User not found", 404);
    }

    return this.mapToUserResponse(userDoc);
  }
}
