/**
 * One-time script to generate bcrypt hash for AUTH_PLACEHOLDER_PASSWORD_HASH.
 * Usage: node server/scripts/hashPassword.js [password]
 * If no password given, uses "password" (dev only).
 */
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;
const password = process.argv[2] || "password";

const hash = await bcrypt.hash(password, SALT_ROUNDS);
console.log("Add to .env:\nAUTH_PLACEHOLDER_PASSWORD_HASH=" + hash);
