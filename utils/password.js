const Bcrypt = require('bcryptjs');

export async function comparePassword(password, hash) {
  try {
    // Compare password
    return await Bcrypt.compare(password, hash);
  } catch (error) {
    return error;
  }

  // Return false if error
  return false;
};
