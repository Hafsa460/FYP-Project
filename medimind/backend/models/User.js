<<<<<<< HEAD
=======
// models/User.js
>>>>>>> sirat
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
<<<<<<< HEAD
  },
  name: String,
  age: Number,
  mrNo: {
    type: Number,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  testReports: {
    type: [String],
    default: [],
  },
});

=======
    match: /^[^\s@]+@gmail\.com$/ // only gmail.com
  },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  mrNo: { type: Number, unique: true }, // auto-generated username
  password: { type: String, required: true },
  testReports: { type: [String], default: [] },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  verificationTokenExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

// Hash password before saving if modified
>>>>>>> sirat
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
<<<<<<< HEAD
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model("User", userSchema);
=======
  } catch (err) {
    next(err);
  }
});

const User = mongoose.model("User", userSchema, "users");
>>>>>>> sirat
module.exports = User;
