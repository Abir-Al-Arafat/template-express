import { HydratedDocument, model, Schema } from "mongoose";

export interface User {
  name: string;
  email: string;
  passwordHash: string;
  version: number;
}

const userSchema = new Schema<User>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: "version",
  },
);

export type UserDocument = HydratedDocument<User>;

export const UserModel = model<User>("User", userSchema);
