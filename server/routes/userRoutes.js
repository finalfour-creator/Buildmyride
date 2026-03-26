import express from "express";
import * as userController from "../controllers/userController.js";

const router = express.Router();

router.post("/", userController.createUser);   // CREATE
router.get("/", userController.getUsers);      // READ
router.put("/:id", userController.updateUser); // UPDATE
router.delete("/:id", userController.deleteUser); // DELETE

export default router;