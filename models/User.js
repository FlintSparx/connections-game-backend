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
  dateOfBirth: {
    type: Date,
    required: true,
    validate: {
      validator: function(date) {
        // Ensure date is not in the future
        return date <= new Date();
      },
      message: 'Date of birth cannot be in the future'
    }
  }
}); // ← Schema definition ends here

// Add virtual fields AFTER the schema definition
User.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  // Adjust age if birthday hasn't occurred this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Add a virtual field to check if user is 18+
User.virtual('isAdult').get(function() {
  return this.age >= 18;
});

// Ensure virtual fields are included when converting to JSON
User.set('toJSON', { virtuals: true });
User.set('toObject', { virtuals: true });


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
  // gamesSolved: [
  //   {
  //     gameId: {
  //       type: mongoose.Schema.Types.ObjectId,
  //       ref: "Game"
  //     },
  //     attempts: {
  //       type: Number,
  //       default: 1
  //     },
  //     completedAt: {
  //       type: Date,
  //       default: Date.now
  //     }
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
//});

// //automatic timestamps for createdAt and updatedAt
// User.set("timestamps", true);

// //helps with querying by username and email
// User.index({ username: 1 });
// User.index({ email: 1 });

export default mongoose.model("User", User);
