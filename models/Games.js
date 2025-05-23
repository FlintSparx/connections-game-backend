import mongoose from "mongoose";

const Game = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  category1: {
    type: {
      name: {
        type: String,
        required: true,
      },
      words: {
        type: [String],
        required: true,
      },
    },
    required: true,
  },
  category2: {
    type: {
      name: {
        type: String,
        required: true,
      },
      words: {
        type: [String],
        required: true,
      },
    },
    required: true,
  },
  category3: {
    type: {
      name: {
        type: String,
        required: true,
      },
      words: {
        type: [String],
        required: true,
      },
    },
    required: true,
  },
  category4: {
    type: {
      name: {
        type: String,
        required: true,
      },
      words: {
        type: [String],
        required: true,
      },
    },
    required: true,
  },
  plays: {
    type: Number,
    default: 0,
  },
  wins: {
    type: Number,
    default: 0,
  },
});

Game.virtual("winPercentage").get(function () {
  if (this.plays === 0) return 0;
  return Math.round((this.wins / this.plays) * 100);
});

Game.virtual("difficulty").get(function () {
  const winPct = this.winPercentage;
  if (winPct >= 25) return "hard";
  if (winPct >= 50) return "medium";
  return "easy";
});

Game.set("toJSON", { virtuals: true });
Game.set("toObject", { virtuals: true });

export default mongoose.model("Game", Game);
