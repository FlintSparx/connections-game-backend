import "dotenv/config";
import express from "express";
import cors from "cors";
import { dbConnect } from "./db.js";

const app = express();
const PORT = process.env.PORT || 5000;

//Routers
import gamesRouter from "./controllers/games.js";

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use("/games", gamesRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // Connect to the database when the server starts
  dbConnect();
});
