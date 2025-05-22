import mongoose from "mongoose";

const Game = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
});

export default mongoose.model("Game", Game);
