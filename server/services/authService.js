// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import config from "../config/index.js";
// import { getUserByEmail } from "./userService.js";
// import User from "../models/User.js";


// const SALT_ROUNDS = 12;

// /**
//  * Validate credentials against placeholder user (or DB when replaced).
//  * @param {string} email - User email
//  * @param {string} password - Plain password
//  * @returns {Promise<{ id: string; email: string } | null>} User without password, or null
//  */
// // export async function validateCredentials(email, password) {
// //   const user = await getUserByEmail(email);
// //   if (!user) return null;

// //   const match = await bcrypt.compare(password, user.passwordHash);
// //   if (!match) return null;

// //   return { id: user.id, email: user.email };
// // }

// // export const validateCredentials = async (email, password) => {

// //   console.log("Searching email:", email);

// //   const user = await User.findOne({ email });

// //   console.log("FOUND USER:", user);

// //   if (!user) return null;

// //   console.log("DB Password:", user.password);
// //   console.log("Entered Password:", password);

// //   if (user.password !== password) return null;

// //   return user;
// // };

// export const validateCredentials = async (email, password) => {

//   console.log("Validating:", email);

//   const user = await getUserByEmail(email);

//   if (!user) {
//     console.log("User not found");
//     return null;
//   }

//   console.log("User found:", user.email);

//   // 🔴 TEMP (since you are using plain password)
//   // const match = password === user.passwordHash;

// const match = await bcrypt.compare(password, user.passwordHash);

//   if (!match) {
//     console.log("Password mismatch");
//     return null;
//   }

//   // ✅ RETURN ONLY SAFE DATA
//   return {id: user.id, email: user.email, name: user.name || user.email.split('@')[0]};
// };

// export const createUser = async (name, email, password) => {

//   console.log("RAW PASSWORD:", password);
//   const existingUser = await User.findOne({ email });
//   if (existingUser) return null;

//   const hashedPassword = await bcrypt.hash(password, 10);

//   console.log("HASHED:", hashedPassword);

//   const user = await User.create({
//     name,
//     email,
//     password: hashedPassword, // later we hash this
//   });

//   return user;
// };

// /**
//  * Create a JWT for the given payload.
//  * @param {Object} payload - Token payload (e.g. { sub, email })
//  * @returns {string} Signed JWT
//  */
// export function createToken(payload) {
//   return jwt.sign(payload, config.JWT_SECRET, {
//     expiresIn: config.JWT_EXPIRES_IN,
//   });
// }


import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config/index.js";
import { getUserByEmail } from "./userService.js";
import User from "../models/User.js";

/**
 * Validate credentials - only checks if user exists
 */
export const validateCredentials = async (email) => {
  console.log("Validating email:", email);

  const user = await getUserByEmail(email);

  if (!user) {
    console.log("User not found");
    return null;
  }

  console.log("User found:", user.email);

  return {
    id: user.id,
    email: user.email,
    name: user.name || user.email.split('@')[0],
    password: user.password,
  };
};

export const createUser = async (name, email, password) => {
  console.log("RAW PASSWORD:", password);
  const existingUser = await User.findOne({ email });
  if (existingUser) return null;

  const hashedPassword = await bcrypt.hash(password, 10);

  console.log("HASHED:", hashedPassword);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return user;
};

export function createToken(payload) {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
}