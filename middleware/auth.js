import express from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Register route
const router = express.Router();

router.post("/", async (req, res) => {
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
    res.json({ message: `User ${username} created successfully `});
});

//Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Find a user based on their email address
    const user = await User.findOne({ email });
    const verified = await bcryptjs.compare(password, user.password);
    if (!verified) {
        res.send("incorrect password!");
    } else {
        const token = jwt.sign(
            {
                id: user._id,

                isAdmin: user.isAdmin,
            },
            process.env.JWT_KEY,
            {
                expiresIn: 60 * 60 * 24,
            }
        );

        res.send({
            message: "user logged in successfully",
            token,
        });
    }
});

export default router;