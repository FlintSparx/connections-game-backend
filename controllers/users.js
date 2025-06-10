import express from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import mongoose from "mongoose";

// Register route
const router = express.Router();

// Profanity Filter function
const containsBlockedWords = (text) => {
  const blockedWords = [
    // Racial slurs
    "nigger",
    "nigga",
    "chink",
    "gook",
    "spic",
    "wetback",
    "kike",
    "jap",
    "towelhead",
    "raghead",
    "sandnigger",
    "beaner",
    "honkey",
    "cracker",
    "whitey",
    "redskin",
    "injun",
    "squaw",
    "gyp",
    "gypsy",
    "slope",
    "zipperhead",
    "jungle bunny",
    "porch monkey",
    "sand monkey",
    // Homophobic/transphobic slurs
    "faggot",
    "fag",
    "dyke",
    "tranny",
    "shemale",
    "homo",
    "pansy",
    "sissy",
    // Misogynistic terms
    "cunt",
    "whore",
    "slut",
    "skank",
    // Ableist slurs
    "retard",
    "retarded",
    "spastic",
    "mongoloid",
    "midget",
    // Religious slurs
    "infidel",
    "heathen",
    // Other highly offensive terms
    "nazi",
    "hitler",
    // General profanities/swears
    "fuck",
    "shit",
    "bitch",
    "cock",
    "dick",
    "pussy",
    "ass",
    "bastard",
    "damn",
    "hell",
    "piss",
    "bullshit",
    "goddamn",
    "bloody",
    "prick",
    "asshole",
    "dickhead",
    "shithead",
    "fuckface",
    "motherfucker",
    "sonofabitch",
    "jackass",
    "dumbass",
    "smartass",
    "badass",
    "fatass",
    "piece of shit",
    "full of shit",
    "horseshit",
    "dipshit",
    "chickenshit",
    "apeshit",
    "batshit",
    "holy shit",
    "no shit",
    "tough shit",
    "eat shit",
    "shit for brains",
    "shitty",
    "shittier",
    "shittiest",
    "fucking",
    "fucked",
    "fucker",
    "fuckery",
    "unfuckingbelievable",
    "clusterfuck",
    "mindfuck",
    "brainfuck",
    "what the fuck",
    "wtf",
    "for fuck's sake",
    "fuck off",
    "fuck you",
    "go fuck yourself",
    "bitchy",
    "bitchier",
    "bitchiest",
    "bitchass",
    "basic bitch",
    "son of a bitch",
    "bitch please",
    "crazy bitch",
    "stupid bitch",
    "douchebag",
    "douche",
    "douchecanoe",
    "scumbag",
    "shitbag",
    "dirtbag",
    "sleazebag",
    "slimeball",
    "creep",
    "pervert",
    "perv",
    "wanker",
    "tosser",
    "bellend",
    "knobhead",
    "twat",
    "git",
    "pillock",
    "minger",
    "munter",
    "chavvy",
    "pikey",
    "gyppo",
    "spunk",
    "fanny",
    "bugger",
    "sod",
    "prat",
    "plonker",
    "wazzock",
    "numpty",
    "muppet",
    "crap",
    "crud",
    "turd",
    "dickwad",
    "dickweed",
    "peckerhead",
    "schmuck",
    "putz",
    "dump",
    "poop",
    "fart",
    "fecal",
    // Sex terms
    "cum",
    "jizz",
    "tits",
    "boobs",
    "titties",
    "boobies",
    "porn",
    "sex",
    "orgasm",
    "masturbate",
    "anal",
    "blowjob",
    "handjob",
    "69",
    "dildo",
    "vibrator",
    "horny",
    "slutty",
    "sexy",
    "nude",
    "naked",
    "semen",
    "penis",
    "vagina",
    "clitoris",
    "testicles",
    "balls",
    "scrotum",
    "labia",
    "nipples",
    "erection",
    "ejaculate",
    "aroused",
    "climax",
    "foreplay",
    "intercourse",
    "penetration",
    "threesome",
    "orgy",
    "bondage",
    "fetish",
    "kinky",
    "bdsm",
    "dominatrix",
    "submissive",
    "spanking",
    "whip",
    "latex",
    "leather",
    "pegging",
    "rimjob",
    "facial",
    "creampie",
    "gangbang",
    "bukkake",
    "milf",
    "cougar",
    "virgin",
    "deflower",
    "missionary",
    "doggy",
    "cowgirl",
    "dong",
    "schlong",
    "pecker",
    "wiener",
    "member",
    // Drug/substance terms
    "weed",
    "pot",
    "ganja",
    "420",
    "blunt",
    "joint",
    "bong",
    "stoner",
    "pothead",
  ];

  const lowerText = text.toLowerCase();
  return blockedWords.some((word) => lowerText.includes(word.toLowerCase()));
};

router.post("/register", async (req, res) => {
  const { username, email, password, first_name, last_name, dateOfBirth } =
    req.body;

  // Check username for profanity
  if (containsBlockedWords(username)) {
    return res.status(400).json({
      message: "Username contains inappropriate language and cannot be used",
    });
  }

  const newUser = new User({
    username,
    email: email.toLowerCase(),
    password: await bcryptjs.hash(password, parseInt(process.env.SALT)),
    first_name,
    last_name,
    dateOfBirth,
    isAdmin: false,
  });

  await newUser.save();
  res.json({ message: `User ${username} created successfully ` });
});

//Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find a user based on their email address
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
    } // Check if any required fields are missing and update account if needed
    let needsUpdate = false;
    let updateData = {};
    let needsUserInput = false;

    // Check fields that can be auto-populated
    console.log("User document:", JSON.stringify(user));

    // Check fields that require user input
    if (!user.dateOfBirth) {
      console.log("User needs to provide dateOfBirth");
      needsUserInput = true;
    } // Apply auto-updates to the user object if needed
    if (needsUpdate) {
      console.log(
        "Applying automatic updates to user account:",
        JSON.stringify(updateData)
      );

      await User.findByIdAndUpdate(user._id, updateData);

      // Reload user to get updated data
      const updatedUser = await User.findById(user._id);
      console.log("User after update:", JSON.stringify(updatedUser));
      // Use the updated user data
      Object.assign(user, updatedUser._doc);
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        isAdmin: user.isAdmin,
        dateOfBirth: user.dateOfBirth,
      },
      process.env.JWT_KEY,
      {
        expiresIn: 60 * 60 * 24,
      }
    );

    res.json({
      message: "User logged in successfully",
      token,
      needsProfileUpdate: needsUserInput,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user profile
router.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
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
    const {
      username,
      email,
      first_name,
      last_name,
      currentPassword,
      newPassword,
      dateOfBirth,
    } = req.body;

    // Check for inappropriate content in username
    if (containsBlockedWords(username)) {
      return res.status(400).json({
        message: "Username contains inappropriate language and cannot be used",
      });
    }

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

    // Update date of birth if provided
    if (dateOfBirth) {
      user.dateOfBirth = new Date(dateOfBirth);
    }

    // Update password if new one is provided
    if (newPassword && newPassword.trim() !== "") {
      user.password = await bcryptjs.hash(
        newPassword,
        parseInt(process.env.SALT)
      );
    }

    await user.save();

    // Generate new token with updated info
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        isAdmin: user.isAdmin,
        dateOfBirth: user.dateOfBirth,
      },
      process.env.JWT_KEY,
      {
        expiresIn: 60 * 60 * 24,
      }
    );
    res.json({
      message: "Profile updated successfully",
      token,
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

router.post("/:userId/:gameId", async (req, res) => {
  const { userId, gameId } = req.params;
  console.log("Adding game to user:", userId, gameId);

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.gamesSolved.some((game) => game._id.toString() === gameId)) {
      return res.status(400).json({ message: "Game already added to user" });
    }

    user.gamesSolved.push({
      gameId: new mongoose.Types.ObjectId(gameId),
      completedAt: new Date(),
    });

    await user.save();
    res.json({ message: "Game added to user successfully" });
  } catch (error) {
    console.error("Error adding game to user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/username/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select("username");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ username: user.username });
  } catch (error) {
    console.error("Error fetching username:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
