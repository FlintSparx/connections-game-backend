import express from "express";
import Game from "../models/Games.js";
import tokenChecker from "../middleware/auth.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
// router for handling game-related API endpoints (CRUD operations)
const router = express.Router();

// Words to block
const blockedWords = [
  // Racial slurs
  "nigger", "nigga", "chink", "gook", "spic", "wetback", "kike", "jap", 
  "towelhead", "raghead", "sandnigger", "beaner", "honkey", "cracker", 
  "whitey", "redskin", "injun", "squaw", "gyp", "gypsy",
  // Homophobic/transphobic slurs
  "faggot", "fag", "dyke", "tranny", "shemale",
  // Misogynistic terms
  "cunt", "whore", "slut", "skank",
  // Ableist slurs
  "retard", "retarded", "spastic", "mongoloid", "midget",
  // Religious slurs
  "infidel", "heathen",
  // Other highly offensive terms
  "nazi", "hitler"
];

// Function to check for blocked words
const containsBlockedWords = (text) => {
  const lowerText = text.toLowerCase();
  return blockedWords.some(word => lowerText.includes(word.toLowerCase()));
};

// Function to check if content contains any NSFW language (allowed words for tagging)
const checkForNSFWContent = (textArray) => {
  const joinedText = textArray.join(" ").toLowerCase();
<<<<<<< HEAD
  const allowedNSFWWords = ["teste", "fuck", "shit", "bitch", "cock", "dick", "pussy", "ass"];
  return allowedNSFWWords.some((word) =>
    joinedText.includes(word.toLowerCase()),
=======
  return allowedProfanity.some((word) =>
    joinedText.includes(word.toLowerCase())
>>>>>>> main
  );
};

router.post("/", tokenChecker, async (req, res) => {
  try {
    const { name, category1, category2, category3, category4 } = req.body;
    const createdBy = req.user.id; // Add the user ID from the token
    // Validate the name field
    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ message: "Game board name is required" });
    }
    // Validate that all categories have words and names
    if (
      ![category1, category2, category3, category4].every((categories) => {
        return Array.isArray(categories.words) && categories.name;
      })
    ) {
      return res.status(400).json({ message: "Invalid game format" });
    }
    // Validate that each category has exactly 4 words
    if (
      ![category1, category2, category3, category4].every(
        (cat) => cat.words.length === 4
      )
    ) {
      return res
        .status(400)
        .json({ message: "Each category must have exactly 4 words" });
    }
    // Collect all text content for checking
    const allContent = [
      name,
      category1.name,
      category2.name,
      category3.name,
      category4.name,
      ...category1.words,
      ...category2.words,
      ...category3.words,
      ...category4.words,
    ].filter((text) => text && typeof text === "string" && text.trim() !== "");
    // Check for blocked profanity
    for (const text of allContent) {
<<<<<<< HEAD
      if (containsBlockedWords(text)) {
        return res.status(400).json({
          message: "Content contains inappropriate language and cannot be saved",
        });
=======
      try {
        const result = swearify.findAndFilter(
          text, // sentence to filter
          "*", // placeholder character
          ["en"], // languages to check (English)
          allowedProfanity, // words to ALLOW (don't block these)
          [] // custom words to add (empty)
        );

        // Check if blocked profanity was found (words NOT in our allowed list)
        if (
          result &&
          result.found === true &&
          result.bad_words &&
          result.bad_words.length > 0
        ) {
          // Check if any blocked word is NOT in our allowed list
          const hasDisallowedWords = result.bad_words.some(
            (badWord) => !allowedProfanity.includes(badWord.toLowerCase())
          );

          if (hasDisallowedWords) {
            return res.status(400).json({
              message:
                "Content contains inappropriate language and cannot be saved",
            });
          }
        }
      } catch (error) {
        console.error("Swearify error for text:", text, error);
        continue;
>>>>>>> main
      }
    }
    // Check if content should be tagged as NSFW (contains allowed profanity)
    const isNSFW = checkForNSFWContent(allContent);
    let tags = [];
    if (isNSFW) {
      tags.push("NSFW");
    }
    // Create the new game with tags
    const newGame = new Game({
      name,
      category1,
      category2,
      category3,
      category4,
      createdBy,
      tags,
    });
    await newGame.save();
    res.status(201).json(newGame);
  } catch (error) {
    console.error("Error creating game:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// record a game win
router.post("/:id/play", async (req, res) => {
  const { id } = req.params;
  const { won } = req.body;
  // Optionally decode JWT if present
  let userId = null;
  const authHeader = req.headers.authorization;
  // console.log("Game play request:", {
  //   gameId: id,
  //   won,
  //   hasAuthHeader: !!authHeader,
  // });
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      userId = decoded.id;
    } catch (err) {
      // Invalid token, ignore for guest play
    }
  }
  try {
    const game = await Game.findById(id);
    if (!game) return res.status(404).json({ message: "Game not found" });
    game.plays += 1;
    if (won) game.wins += 1;
    await game.save();
    // If user won and is authenticated, update their profile
    if (won && userId) {
      try {
        const user = await User.findById(userId);
        if (user) {
          // Check if user has already solved this game
          const alreadySolved = user.gamesSolved.some(
            (g) => g.gameId && g.gameId.toString() === id
          );
          if (!alreadySolved) {
            user.gamesSolved.push({ gameId: id, completedAt: new Date() });
            await user.save();
          } else {
            console.log("Game already solved by user.");
          }
        } else {
          console.log("User not found for id:", userId);
        }
      } catch (error) {
        console.error("Error updating user with solved game:", error);
      }
    }
    res.json({
      message: "Game stats updated",
      plays: game.plays,
      wins: game.wins,
      winPercentage: game.winPercentage,
      difficulty: game.difficulty,
    });
  } catch (error) {
    console.error("Error updating game stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// Get number of wins for a user
router.get("/wins/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ wins: user.gamesSolved ? user.gamesSolved.length : 0 });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch wins" });
  }
});
router.get("/new", tokenChecker, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const solvedIds = user.gamesSolved.map((g) => g.gameId.toString());
    // Find games not yet solved by the user
    const unsolvedGames = await Game.find({
      _id: { $nin: solvedIds },
    });
    // If all games are solved, fallback to all games
    let gamesToChooseFrom =
      unsolvedGames.length > 0 ? unsolvedGames : await Game.find();
    // Randomly select a game (or use your own logic to "deprioritize" solved games)
    const randomIndex = Math.floor(Math.random() * gamesToChooseFrom.length);
    const selectedGame = gamesToChooseFrom[randomIndex];
    res.json(selectedGame);
  } catch (error) {
    console.error("Error fetching new game:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.get("/", async (req, res) => {
  try {
    // Populate createdBy with just the username field
    const games = await Game.find().populate("createdBy", "username");
    // the games array should already have proper difficulty values
    res.status(200).json(games);
  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Populate createdBy with the username field
    const game = await Game.findById(id).populate("createdBy", "username");
    res.status(200).json(game);
  } catch (error) {
    console.error("Error fetching game:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// delete a game by id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedGame = await Game.findByIdAndDelete(id);
    if (!deletedGame) {
      return res.status(404).json({ message: "Game not found" });
    }
    res.status(200).json({ message: "Game deleted successfully" });
  } catch (error) {
    console.error("Error deleting game:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
export default router;