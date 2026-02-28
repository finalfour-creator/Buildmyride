import { Router } from "express";
import { login, me } from "../controllers/authController.js";
import { isAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/login", login);
router.get("/me", isAuth, me);

export default router;
