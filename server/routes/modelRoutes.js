import express from "express";
import { getModels, createModel, getModelById } from "../controllers/modelController.js";

const router = express.Router();

// Disable caching for GET /models to ensure fresh data
router.get("/", (req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
}, getModels);

router.get("/:id", getModelById);
router.post("/", createModel);

export default router;