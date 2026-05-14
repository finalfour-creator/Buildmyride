
import createError from "http-errors";
import bcrypt from "bcryptjs";
import { validateCredentials, createToken } from "../services/authService.js";
import { loginSchema } from "../validators/authSchemas.js";
import { registerSchema } from "../validators/authSchemas.js";
import { createUser } from "../services/authService.js";

/**
 * 🔐 Password validation function
 */
const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) errors.push("at least 8 characters");
  if (!/[A-Z]/.test(password)) errors.push("1 uppercase letter (A-Z)");
  if (!/[a-z]/.test(password)) errors.push("1 lowercase letter (a-z)");
  if (!/[0-9]/.test(password)) errors.push("1 number (0-9)");
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push("1 special character (!@#$%^&*)");
  
  return errors;
};

/**
 * POST /auth/login
 */
// export async function login(req, res, next) {
//   console.log("LOGIN BODY:", req.body);
//   const parsed = loginSchema.safeParse(req.body);
//   if (!parsed.success) {
//     return res.status(400).json({ field: "email", message: "Invalid email format" });
//   }

//   const { email, password } = parsed.data;
  
//   // Check if user exists with this email
//   const user = await validateCredentials(email);
  
//   if (!user) {
//     return res.status(401).json({ field: "email", message: "Invalid email" });
//   }

//   // Check if password matches
//   const isMatch = await bcrypt.compare(password, user.password);
  
//   if (!isMatch) {
//     return res.status(401).json({ field: "password", message: "Invalid password" });
//   }

//   const token = createToken({ sub: user.id, email: user.email });
//   res.status(200).json({ 
//     user: { id: user.id, email: user.email, name: user.name }, 
//     token 
//   });
// }

export async function login(req, res, next) {
  console.log("LOGIN BODY:", req.body);
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ field: "email", message: "Invalid email format" });
  }

  const { email, password } = parsed.data;
  
// Step 1: Check if user exists with this email
  const user = await validateCredentials(email);
  
  if (!user) {
    return res.status(401).json({ field: "email", message: "Incorrect email" });
  }

  // Step 2: Check if password matches
  const isMatch = await bcrypt.compare(password, user.password);
  
  if (!isMatch) {
    return res.status(401).json({ field: "password", message: "Incorrect password" });
  }

  const token = createToken({ sub: user.id, email: user.email });
  res.status(200).json({ 
    user: { id: user.id, email: user.email, name: user.name }, 
    token 
  });
}

/**
 * POST /auth/register
 */
export async function register(req, res, next) {
  try {
    console.log("REGISTER BODY:", req.body);

    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(createError(400, "Invalid input data"));
    }

    const { name, email, password } = parsed.data;

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return next(createError(400, `Password must contain: ${passwordErrors.join(", ")}`));
    }

    const user = await createUser(name, email, password);

    if (!user) {
      return next(createError(400, "User already exists"));
    }

    const token = createToken({ sub: user.id, email: user.email });

    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name },
      token,
    });

  } catch (error) {
    next(error);
  }
}

/**
 * GET /auth/me
 */
export function me(req, res) {
  res.status(200).json({ user: req.user });
}