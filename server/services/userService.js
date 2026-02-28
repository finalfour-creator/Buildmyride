import config from "../config/index.js";

/**
 * Get user by email. Placeholder: reads from env. Replace with DB lookup when ready.
 * @param {string} email - User email
 * @returns {Promise<{ id: string; email: string; passwordHash: string } | null>}
 */
export async function getUserByEmail(email) {
  const placeholderEmail = config.AUTH_PLACEHOLDER_EMAIL;
  const placeholderPasswordHash = config.AUTH_PLACEHOLDER_PASSWORD_HASH;

  if (!placeholderPasswordHash || email !== placeholderEmail) {
    return null;
  }

  return {
    id: "placeholder-user-id",
    email: placeholderEmail,
    passwordHash: placeholderPasswordHash,
  };
}
