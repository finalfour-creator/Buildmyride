import config from "../config/index.js";
import User from "../models/User.js";

/**
 * Get user by email. Placeholder: reads from env. Replace with DB lookup when ready.
 * @param {string} email - User email
 * @returns {Promise<{ id: string; email: string; passwordHash: string } | null>}
 */
// export async function getUserByEmail(email) {
//   const placeholderEmail = config.AUTH_PLACEHOLDER_EMAIL;
//   const placeholderPasswordHash = config.AUTH_PLACEHOLDER_PASSWORD_HASH;

//   if (!placeholderPasswordHash || email !== placeholderEmail) {
//     return null;
//   }

//   return {
//     id: "placeholder-user-id",
//     email: placeholderEmail,
//     passwordHash: placeholderPasswordHash,
//   };
// }



export async function getUserByEmail(email) {
  // const user = await User.findOne({ email });

  const user = await User.findOne({ email }).select("name email password");

  if (!user) return null;

  return {
    id: user._id.toString(),
    email: user.email,
    password: user.password, // assuming plain for now
    name:user.name
  };
}


// UPDATE (single user)
export const updateUser = async (id, data) => {
  return await User.findByIdAndUpdate(id, data, { new: true });
};

// READ (single user by ID)
export const getUserById = async (id) => {
  return await User.findById(id);
};

export const deleteUser = async (id) => {
  return await User.findByIdAndDelete(id);
};


// CREATE
// export const createUser = async (data) => {
//   return await User.create(data);
// };

// // READ (all users)
// export const getUsers = async () => {
//   return await User.find();
// };

// // READ (single user)
// export const getUserById = async (id) => {
//   return await User.findById(id);
// };

// // UPDATE
// export const updateUser = async (id, data) => {
//   return await User.findByIdAndUpdate(id, data, { new: true });
// };

// // DELETE
// export const deleteUser = async (id) => {
//   return await User.findByIdAndDelete(id);
// };

