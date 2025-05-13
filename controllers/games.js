import express from "express";
import Game from "../models/Games.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { category1, category2, category3, category4 } = req.body;
    const newGame = new Game({
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

export default router;
