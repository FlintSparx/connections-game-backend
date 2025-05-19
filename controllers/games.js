import express from "express";
import Game from "../models/Games.js";

// router for handling game-related API endpoints (CRUD operations)
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, category1, category2, category3, category4 } = req.body;
    console.log("Received data:", req.body);
    console.log();
    // Validate the name field
    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ message: "Game board name is required" });
    }

    // Validate that all categories have words and names
    if (
      ![category1, category2, category3, category4].every((categories) => {
        console.log(categories);
        Array.isArray(categories.words) && categories.name;
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

    const newGame = new Game({
      name,
      category1,
      category2,
      category3,
      category4,
    });
    await newGame.save();
    res.status(201).json(newGame);
  } catch (error) {
    console.error("Error creating game:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const games = await Game.find();
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
