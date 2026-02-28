import { z } from "zod";

/** @type {z.ZodObject<{ email: z.ZodString; password: z.ZodString }>} */
export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});
