import { Router } from "express";
import { login, me, register } from "../controllers/authController.js";
import { isAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/login", login);
router.get("/me", isAuth, me);
router.post("/register", register);

export default router;
