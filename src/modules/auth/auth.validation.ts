import { body } from "express-validator";

export class AuthValidation {
  static register = [
    body("name")
      .exists({ values: "falsy" })
      .withMessage("Name is required")
      .isString()
      .withMessage("Name must be a string")
      .trim()
      .notEmpty()
      .withMessage("Name cannot be empty"),

    body("email")
      .exists({ values: "falsy" })
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),

    body("password")
      .exists({ values: "falsy" })
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ];

  static login = [
    body("email")
      .exists({ values: "falsy" })
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),

    body("password")
      .exists({ values: "falsy" })
      .withMessage("Password is required")
      .notEmpty()
      .withMessage("Password cannot be empty"),
  ];
}
