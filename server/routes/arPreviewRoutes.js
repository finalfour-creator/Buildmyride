import express from "express";
import {
  createArPreview,
  getUserArPreviews,
  getArPreviewById,
  updateArPreview,
  deleteArPreview,
} from "../controllers/arPreviewController.js";
import { isAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(isAuth);

router.post("/", createArPreview);
router.get("/", getUserArPreviews);
router.get("/:id", getArPreviewById);
router.put("/:id", updateArPreview);
router.delete("/:id", deleteArPreview);

export default router;
