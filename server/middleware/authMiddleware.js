import jwt from "jsonwebtoken";
import createError from "http-errors";
import config from "../config/index.js";

/**
 * Verify Bearer JWT and attach payload to req.user. Use on protected routes.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export function isAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(createError(401, "Unauthorized"));
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, config.JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    next(createError(401, "Unauthorized"));
  }
}
