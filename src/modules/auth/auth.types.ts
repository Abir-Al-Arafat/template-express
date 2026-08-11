import { UserResponse } from "../user/user.types";

export interface AuthResponse {
  user: UserResponse;
  token: string;
}
