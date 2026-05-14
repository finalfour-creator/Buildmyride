import express from "express";
import * as designController from "../controllers/designController.js";
import { isAuth } from "../middleware/authMiddleware.js"; 

const router = express.Router();

// All design routes require authentication
router.use(isAuth);

router.post("/", designController.createDesign);          // Initialize draft
router.get("/", designController.getUserDesigns);        // List user's drafts
router.get("/:id", designController.getDesignById);      // Resume draft
router.put("/:id", designController.updateDesign);       // Update draft (Auto-save)

export default router;
