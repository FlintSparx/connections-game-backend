import express from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Register route
const router = express.Router();

// Function that will check usernames for profanity
function checkUsernameProfanity(username) {
  try {
    const result = swearify.findAndFilter(
      username,
      '*',
      ['en'],
      [],
      []
    );
  }
}

router.post("/register", async (req, res) => {
  const { username, email, password, first_name, last_name } = req.body;  const newUser = new User({
    username,
    email: email.toLowerCase(),
    password: await bcryptjs.hash(password, parseInt(process.env.SALT)),
    first_name,
    last_name,
    isAdmin: false,
  });
  await newUser.save();
  res.json({ message: `User ${username} created successfully ` });
});

//Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find a user based on their username address
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const verified = await bcryptjs.compare(password, user.password);
    if (!verified) {
      return res.status(401).json({ message: "Incorrect password!" });
    }

    if (!process.env.JWT_KEY) {
      return res
        .status(500)
        .json({ message: "JWT_KEY not set in environment" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_KEY,
      {
        expiresIn: 60 * 60 * 24,
      }
    );

    res.json({
      message: "User logged in successfully",
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user profile
router.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profile" });
  }
});

// Update user profile
router.put("/profile/:id", async (req, res) => {
  try {
    const { username, email, first_name, last_name, currentPassword, newPassword } = req.body;
    
    // Find user
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const verified = await bcryptjs.compare(currentPassword, user.password);
    if (!verified) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Update user fields
    user.username = username;
    user.email = email;
    user.first_name = first_name;
    user.last_name = last_name;

    // Update password if new one is provided
    if (newPassword && newPassword.trim() !== '') {
      user.password = await bcryptjs.hash(newPassword, parseInt(process.env.SALT));
    }

    await user.save();

    // Generate new token with updated info
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_KEY,
      {
        expiresIn: 60 * 60 * 24,
      }
    );

    res.json({ 
      message: "Profile updated successfully",
      token 
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
});

// Delete user account
router.delete("/profile/:id", async (req, res) => {
  try {
    const { password } = req.body;
    
    // Find user
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify password
    const verified = await bcryptjs.compare(password, user.password);
    if (!verified) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Delete user
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "Error deleting account" });
  }
});

export default router;
