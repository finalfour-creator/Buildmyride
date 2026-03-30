import createError from "http-errors";
import { validateCredentials, createToken } from "../services/authService.js";
import { loginSchema } from "../validators/authSchemas.js";

/**
 * POST /auth/login - validate body, check credentials, return user + token.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function login(req, res, next) {
  console.log("LOGIN BODY:", req.body);
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(createError(400, "Invalid email or password"));
  }

  const { email, password } = parsed.data;
  const user = await validateCredentials(email, password);
  if (!user) {
    return next(createError(401, "Invalid email or password"));
  }

  const token = createToken({ sub: user.id, email: user.email });
  res.status(200).json({ user: { id: user.id, email: user.email }, token });
}

/**
 * GET /auth/me - return req.user (set by isAuth middleware).
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export function me(req, res) {
  res.status(200).json({ user: req.user });
}
