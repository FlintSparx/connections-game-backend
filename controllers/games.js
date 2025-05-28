import express from "express";
import Game from "../models/Games.js";
import tokenChecker from "../middleware/auth.js";
import swearify from "swearify";
import User from "../models/User.js";

// router for handling game-related API endpoints (CRUD operations)
const router = express.Router();

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

    // Use swearify to check for profanity
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

    for (const text of allContent) {
      try {
        const result = swearify.findAndFilter(
          text, // sentence to filter
          "*", // placeholder character
          ["en"], // languages to check (English)
          [], // allowed swears (empty = none allowed)
          [] // custom words to add (empty)
        );

        // Check if profanity was found
        if (
          result &&
          result.found === true &&
          result.bad_words &&
          result.bad_words.length > 0
        ) {
          return res.status(400).json({
            message:
              "Content contains inappropriate language and cannot be saved",
          });
        }
      } catch (error) {
        console.error("Swearify error for text:", text, error);
        continue;
      }
    }
    const newGame = new Game({
      name,
      category1,
      category2,
      category3,
      category4,
      createdBy,
    });
    await newGame.save();
    res.status(201).json(newGame);
  } catch (error) {
    console.error("Error creating game:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// record a game win
router.post("/:id/play", tokenChecker, async (req, res) => {
  const { id } = req.params;
  const { won } = req.body;

  try {
    const game = await Game.findById(id);
    if (!game) return res.status(404).json({ message: "Game not found" });

    game.plays += 1;
    if (won) game.wins += 1;
    await game.save();

    // If user won, update their profile
    if (won && req.user && req.user.id) {
      const user = await User.findById(req.user.id);
      if (user) {
        // Only add if not already solved
        const alreadySolved = user.gamesSolved.some(
          (g) => g.gameId.toString() === id
        );
        if (!alreadySolved) {
          user.gamesSolved.push({ gameId: id });
          await user.save();
        }
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
    const game = await Game.findById(id);
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
