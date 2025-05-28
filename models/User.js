import mongoose from "mongoose";

// user schema for our connections app
const User = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    // todo maybe add better email validation later
  },
  password: {
    type: String,
    required: true,
  },
  first_name: {
    type: String,
    unique: false,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
  },
  last_name: {
    type: String,
    required: true,
    unique: false,
    trim: true,
    minlength: 3,
    maxlength: 20,
  },
  isAdmin: {
    type: Boolean,
    default: false,
    required: false,
  },
  gamesSolved: [
    {
      gameId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Game",
      },
      completedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  // profilePic: {
  //   // optional profile picture url
  //   type: String,
  //   default: "https://ui-avatars.com/api/?name=User&background=random" // generates placeholder avatars with initials
  //   },
  //   gamesCreated: [
  //   {
  //     // reference to games user created
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "Game"
  //   }
  // ],
  // favorites: [
  //   {
  //     // games the user favorited/bookmarked
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "Game"
  //   }
  // ],
  // role: {
  //   type: String,
  //   enum: ["user", "admin"],
  //   default: "user"
  // },
});

// //automatic timestamps for createdAt and updatedAt
// User.set("timestamps", true);

// //helps with querying by username and email
// User.index({ username: 1 });
// User.index({ email: 1 });

export default mongoose.model("User", User);
