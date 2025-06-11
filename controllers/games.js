import express from "express";
import Game from "../models/Games.js";
import tokenChecker from "../middleware/auth.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

// router for handling game-related API endpoints (CRUD operations)

const router = express.Router();

// Words to block (racial, homophobic, religious, misogynistic, ableist slurs)

const blockedWords = [
  // Racial slurs
  "nigger",
  "nigga",
  "chink",
  "gook",
  "spic",
  "wetback",
  "kike",
  "jap",
  "towelhead",
  "raghead",
  "sandnigger",
  "beaner",
  "honkey",
  "cracker",
  "whitey",
  "redskin",
  "injun",
  "squaw",
  "gyp",
  "gypsy",
  "slope",
  "zipperhead",
  "jungle bunny",
  "porch monkey",
  "sand monkey",
  // Homophobic/transphobic slurs
  "faggot",
  "fag",
  "dyke",
  "tranny",
  "shemale",
  "homo",
  "pansy",
  "sissy",
  // Misogynistic terms
  "cunt",
  "whore",
  "slut",
  "skank",
  // Ableist slurs
  "retard",
  "retarded",
  "spastic",
  "mongoloid",
  "midget",
  // Religious slurs
  "infidel",
  "heathen",
  // Other highly offensive terms
  "nazi",
  "hitler",
];

// Function to check for blocked words

const containsBlockedWords = (text) => {
  const lowerText = text.toLowerCase();
  return blockedWords.some((word) => lowerText.includes(word.toLowerCase()));
};

// Function to check if content contains any NSFW language (allowed words for tagging)

const checkForNSFWContent = (textArray) => {
  const joinedText = textArray.join(" ").toLowerCase();
  const allowedNSFWWords = [
    // General profanities/swears
    "fuck",
    "shit",
    "bitch",
    "cock",
    "dick",
    "pussy",
    "ass",
    "bastard",
    "damn",
    "hell",
    "piss",
    "bullshit",
    "goddamn",
    "bloody",
    "prick",
    "asshole",
    "dickhead",
    "shithead",
    "fuckface",
    "motherfucker",
    "sonofabitch",
    "jackass",
    "dumbass",
    "smartass",
    "badass",
    "fatass",
    "piece of shit",
    "full of shit",
    "horseshit",
    "dipshit",
    "chickenshit",
    "apeshit",
    "batshit",
    "holy shit",
    "no shit",
    "tough shit",
    "eat shit",
    "shit for brains",
    "shitty",
    "shittier",
    "shittiest",
    "fucking",
    "fucked",
    "fucker",
    "fuckery",
    "unfuckingbelievable",
    "clusterfuck",
    "mindfuck",
    "brainfuck",
    "what the fuck",
    "wtf",
    "for fuck's sake",
    "fuck off",
    "fuck you",
    "go fuck yourself",
    "bitchy",
    "bitchier",
    "bitchiest",
    "bitchass",
    "basic bitch",
    "son of a bitch",
    "bitch please",
    "crazy bitch",
    "stupid bitch",
    "douchebag",
    "douche",
    "douchecanoe",
    "scumbag",
    "shitbag",
    "dirtbag",
    "sleazebag",
    "slimeball",
    "creep",
    "pervert",
    "perv",
    "wanker",
    "tosser",
    "bellend",
    "knobhead",
    "twat",
    "git",
    "pillock",
    "minger",
    "munter",
    "chavvy",
    "pikey",
    "gyppo",
    "spunk",
    "fanny",
    "bugger",
    "sod",
    "prat",
    "plonker",
    "wazzock",
    "numpty",
    "muppet",
    "crap",
    "crud",
    "turd",
    "dickwad",
    "dickweed",
    "peckerhead",
    "schmuck",
    "putz",
    "dump",
    "poop",
    "fart",
    "fecal",
    // Sex terms
    "cum",
    "jizz",
    "tits",
    "boobs",
    "titties",
    "boobies",
    "porn",
    "sex",
    "orgasm",
    "masturbate",
    "anal",
    "blowjob",
    "handjob",
    "69",
    "dildo",
    "vibrator",
    "horny",
    "slutty",
    "sexy",
    "nude",
    "naked",
    "semen",
    "penis",
    "vagina",
    "clitoris",
    "testicles",
    "balls",
    "scrotum",
    "labia",
    "nipples",
    "erection",
    "ejaculate",
    "aroused",
    "climax",
    "foreplay",
    "intercourse",
    "penetration",
    "threesome",
    "orgy",
    "bondage",
    "fetish",
    "kinky",
    "bdsm",
    "dominatrix",
    "submissive",
    "spanking",
    "whip",
    "latex",
    "leather",
    "pegging",
    "rimjob",
    "facial",
    "creampie",
    "gangbang",
    "bukkake",
    "milf",
    "cougar",
    "virgin",
    "deflower",
    "missionary",
    "doggy",
    "cowgirl",
    "dong",
    "schlong",
    "pecker",
    "wiener",
    "johnson",
    "rod",
    "meat",
    "member",
    // Drug/substance terms
    "weed",
    "pot",
    "ganja",
    "420",
    "blunt",
    "joint",
    "bong",
    "stoner",
    "pothead",
  ];
  return allowedNSFWWords.some((word) =>
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
      if (containsBlockedWords(text)) {
        return res.status(400).json({
          message:
            "Content contains inappropriate language and cannot be saved",
        });
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

// Get list of solved games for a user

router.get("/solved/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Extract just the gameId from each solved game

    const solvedGameIds = user.gamesSolved
      ? user.gamesSolved.map((game) => game.gameId.toString())
      : [];
    res.json({ solvedGames: solvedGameIds });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch solved games" });
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
router.get("/new", async (req, res) => {
  try {
    // Get all games
    let allGames = await Game.find();

    if (allGames.length === 0) {
      return res.status(404).json({ message: "No games available" });
    }

    // Check if user is adult (18+) and logged in
    let isAdult = false;
    let userId = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        userId = decoded.id;

        // Check if user has dateOfBirth and is 18+
        if (decoded.dateOfBirth) {
          const today = new Date();
          const birthDate = new Date(decoded.dateOfBirth);
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();

          // Adjust age if birthday hasn't occurred this year
          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ) {
            age--;
          }

          isAdult = age >= 18;
        }
      } catch (err) {
        // Invalid token, continue as guest (isAdult = false)
      }
    }

    // Filter out NSFW games if user is not adult or not logged in
    allGames = allGames.filter((game) => !game.tags?.includes("NSFW"));

    // For logged-in users, try to prioritize unsolved games
    if (userId) {
      try {
        const user = await User.findById(userId);
        if (user && user.gamesSolved && user.gamesSolved.length > 0) {
          const solvedIds = user.gamesSolved.map((g) => g.gameId.toString());
          const unsolvedGames = allGames.filter(
            (game) => !solvedIds.includes(game._id.toString())
          );

          // If user has unsolved games, pick from those, otherwise pick from all
          if (unsolvedGames.length > 0) {
            const randomIndex = Math.floor(
              Math.random() * unsolvedGames.length
            );
            return res.json(unsolvedGames[randomIndex]);
          }
        }
      } catch (err) {
        // Error fetching user, continue to default selection
      }
    }

    // Default: pick random game from filtered games
    const randomIndex = Math.floor(Math.random() * allGames.length);
    res.json(allGames[randomIndex]);
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
