import express from "express";
import Game from "../models/Games.js";
import tokenChecker from "../middleware/auth.js";
import swearify from "swearify";

// router for handling game-related API endpoints (CRUD operations)
const router = express.Router();

// Allowed curse words for NSFW game boards:
const allowedProfanity = [
  "teste",
  "fuck",
  "shit",
  "bitch",
  "cock",
  "dick",
  "pussy",
  "ass",
];

// Function to check if content contains any NSFW language
const checkForNSFWContent = (textArray) => {
  const joinedText = textArray.join(" ").toLowerCase();
  return allowedProfanity.some((word) =>
    joinedText.includes(word.toLowerCase())
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
    } // Validate that each category has exactly 4 words
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

    // Check for disallowed profanity (block truly offensive words)
    for (const text of allContent) {
      try {
        const result = swearify.findAndFilter(
          text, // sentence to filter
          "*", // placeholder character
          ["en"], // languages to check (English)
          allowedProfanity, // words to ALLOW (don't block these)
          [] // custom words to add (empty)
        );
        console.log(result);
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

  try {
    const game = await Game.findById(id);
    if (!game) return res.status(404).json({ message: "Game not found" });

    game.plays += 1;
    if (won) game.wins += 1;
    await game.save();

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
