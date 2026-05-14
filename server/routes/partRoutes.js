import express from "express";
import { getParts, createPart, getPartById } from "../controllers/partController.js";

const router = express.Router();

router.get("/", getParts);
router.post("/", createPart);
router.get("/:id", getPartById);

export default router;
