// import express from "express";
// import * as userController from "../controllers/userController.js";

// const router = express.Router();

// router.post("/", userController.createUser);   // CREATE
// router.get("/", userController.getUsers);      // READ
// router.put("/:id", userController.updateUser); // UPDATE
// router.delete("/:id", userController.deleteUser); // DELETE

// export default router;

import express from "express";
import * as userController from "../controllers/userController.js";
import { isAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", userController.createUser);   // CREATE
router.get("/", userController.getUsers);      // READ



// NEW ROUTES for profile settings
router.put("/update-name", isAuth, userController.updateName);
router.put("/update-email", isAuth, userController.updateEmail);
router.put("/update-password", isAuth, userController.updatePassword);

router.put("/:id", userController.updateUser); // UPDATE
router.delete("/:id", userController.deleteUser); // DELETE

export default router;