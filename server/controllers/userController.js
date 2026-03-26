import * as userService from "../services/userService.js";

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