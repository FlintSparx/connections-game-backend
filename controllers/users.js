import express from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Register route
const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, email, password, first_name, last_name } = req.body;
  const newUser = new User({
    username,
    email,
    password: await bcryptjs.hashSync(password, process.env.SALT),
    first_name,
    last_name,
    isAdmin: false,
  });
  console.log(newUser);
  await newUser.save();
  res.json({ message: `User ${username} created successfully ` });
});

//Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find a user based on their username address
    const user = await User.findOne({ username });
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

export default router;
