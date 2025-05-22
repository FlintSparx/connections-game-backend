import "dotenv/config";
import express from "express";
import cors from "cors";
import { dbConnect } from "./db.js";

const app = express();
const PORT = process.env.PORT || 5000;

//Routers
import gamesRouter from "./controllers/games.js";
import userRouter from "./controllers/users.js";
import adminRouter from "./controllers/admin.js";

// Importing middleware
import adminChecker from "./middleware/adminChecker.js";

// Middleware
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174"], credentials: true }));
app.use(express.json());
app.use("/games", gamesRouter);
app.use("/users", userRouter);
app.use("/admin", adminChecker, adminRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // Connect to the database when the server starts
  dbConnect();
});
