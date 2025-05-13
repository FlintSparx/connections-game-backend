import mongoose from "mongoose";
import Category from "./Categories.js";

const Game = new mongoose.Schema({
  category1: {
    type: Category.schema,
    required: true,
  },
  category2: {
    type: Category.schema,
    required: true,
  },
  category3: {
    type: Category.schema,
    required: true,
  },
  category4: {
    type: Category.schema,
    required: true,
  },
});

export default mongoose.model("Game", Game);
