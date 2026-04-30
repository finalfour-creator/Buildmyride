// import * as userService from "../services/userService.js";

// // CREATE
// export const createUser = async (req, res) => {
//   const user = await userService.createUser(req.body);
//   res.json(user);
// };

// // READ
// export const getUsers = async (req, res) => {
//   const users = await userService.getUsers();
//   res.json(users);
// };

// // UPDATE
// export const updateUser = async (req, res) => {
//   const user = await userService.updateUser(req.params.id, req.body);
//   res.json(user);
// };

// // DELETE
// export const deleteUser = async (req, res) => {
//   await userService.deleteUser(req.params.id);
//   res.json({ message: "User deleted" });
// };

import * as userService from "../services/userService.js";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

// CREATE
export const createUser = async (req, res) => {
  const user = await userService.createUser(req.body);
  res.json(user);
};

// READ
export const getUsers = async (req, res) => {
  const users = await userService.getUsers();
  res.json(users);
};

// UPDATE
export const updateUser = async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  res.json(user);
};

// DELETE
export const deleteUser = async (req, res) => {
  await userService.deleteUser(req.params.id);
  res.json({ message: "User deleted" });
};

// ========== NEW FUNCTIONS FOR PROFILE SETTINGS ==========

// Password validation helper
const validatePassword = (password) => {
  const errors = [];
  if (password.length < 8) errors.push("at least 8 characters");
  if (!/[A-Z]/.test(password)) errors.push("1 uppercase letter (A-Z)");
  if (!/[a-z]/.test(password)) errors.push("1 lowercase letter (a-z)");
  if (!/[0-9]/.test(password)) errors.push("1 number (0-9)");
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push("1 special character (!@#$%^&*)");
  return errors;
};

// export const updateName = async (req, res) => {
//   try {
//     const { fullName } = req.body;
//     const userId = req.user.id;

//     if (!fullName || fullName.trim().length < 2) {
//       return res.status(400).json({ message: "Name must be at least 2 characters" });
//     }

//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { name: fullName },
//       { new: true }
//     );

//     res.status(200).json({
//       success: true,
//       message: "Name updated successfully",
//       user: { id: updatedUser._id, name: updatedUser.name, email: updatedUser.email }
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

export const updateName = async (req, res) => {
  try {
    const { name } = req.body;  // ← CHANGED: name instead of fullName
    const userId = req.user.id;

    if (!name || name.trim().length < 2) {  // ← Uses name
      return res.status(400).json({ message: "Name must be at least 2 characters" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name },  // ← CHANGED: name instead of fullName
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Name updated successfully",
      user: { id: updatedUser._id, name: updatedUser.name, email: updatedUser.email }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const updateEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user.id;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { email },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Email updated successfully",
      user: { id: updatedUser._id, name: updatedUser.name, email: updatedUser.email }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      return res.status(400).json({ message: `Password must contain: ${passwordErrors.join(", ")}` });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};