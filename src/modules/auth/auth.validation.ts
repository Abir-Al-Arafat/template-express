import { body } from "express-validator";

export class AuthValidation {
  static register = [
    body("name")
      .exists({ values: "falsy" })
      .withMessage("Name is required")
      .bail()
      .isString()
      .withMessage("Name must be a string")
      .bail()
      .trim()
      .notEmpty()
      .withMessage("Name cannot be empty")
      .bail(),

    body("email")
      .exists({ values: "falsy" })
      .withMessage("Email is required")
      .bail()
      .isEmail()
      .withMessage("Invalid email format")
      .bail()
      .normalizeEmail()
      .bail(),

    body("password")
      .exists({ values: "falsy" })
      .withMessage("Password is required")
      .bail()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
      .bail(),
  ];

  static login = [
    body("email")
      .exists({ values: "falsy" })
      .withMessage("Email is required")
      .bail()
      .isEmail()
      .withMessage("Invalid email format")
      .bail()
      .normalizeEmail()
      .bail(),

    body("password")
      .exists({ values: "falsy" })
      .withMessage("Password is required")
      .bail()
      .notEmpty()
      .withMessage("Password cannot be empty"),
  ];
}
