/**
 * Profile Controller
 * Handles current user's profile operations
 */

const { UserService } = require("../users/user.service");
const path = require("path");
const fs = require("fs").promises;

const userService = new UserService();

/**
 * GET /profile - Get current user's profile
 */
async function getProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const user = await userService.getUserById(userId);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /profile - Update current user's profile
 */
async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;

    const user = await userService.updateUser(userId, updateData);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /profile/avatar - Upload avatar
 */
async function uploadAvatar(req, res, next) {
  try {
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Generate avatar URL
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Get old avatar to delete if exists
    const currentUser = await userService.getUserById(userId);
    
    // Update user with new avatar
    const user = await userService.updateUser(userId, { avatar: avatarUrl });

    // Delete old avatar file if exists
    if (currentUser.avatar && currentUser.avatar.startsWith("/uploads/")) {
      const oldFilePath = path.join(__dirname, "../../../", currentUser.avatar);
      try {
        await fs.unlink(oldFilePath);
      } catch (err) {
        console.error("Failed to delete old avatar:", err);
      }
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /profile/avatar - Delete avatar
 */
async function deleteAvatar(req, res, next) {
  try {
    const userId = req.user.id;
    
    const currentUser = await userService.getUserById(userId);
    
    // Delete avatar file if exists
    if (currentUser.avatar && currentUser.avatar.startsWith("/uploads/")) {
      const filePath = path.join(__dirname, "../../../", currentUser.avatar);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.error("Failed to delete avatar file:", err);
      }
    }

    // Update user to remove avatar
    const user = await userService.updateUser(userId, { avatar: null });

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /profile/password - Change password
 */
async function changePassword(req, res, next) {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Old password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    await userService.changePassword(userId, oldPassword, newPassword);
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  changePassword,
};
