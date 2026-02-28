import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config/index.js";
import { getUserByEmail } from "./userService.js";

const SALT_ROUNDS = 12;

/**
 * Validate credentials against placeholder user (or DB when replaced).
 * @param {string} email - User email
 * @param {string} password - Plain password
 * @returns {Promise<{ id: string; email: string } | null>} User without password, or null
 */
export async function validateCredentials(email, password) {
  const user = await getUserByEmail(email);
  if (!user) return null;

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return null;

  return { id: user.id, email: user.email };
}

/**
 * Create a JWT for the given payload.
 * @param {Object} payload - Token payload (e.g. { sub, email })
 * @returns {string} Signed JWT
 */
export function createToken(payload) {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
}
