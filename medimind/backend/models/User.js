const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[^\s@]+@gmail\.com$/ 
  },
  name: { type: String, required: true },
  dob: { type: Date, required: true },   // ✅ store full DOB
  age: { type: Number, required: true }, // ✅ still store age
  mrNo: { type: Number, unique: true }, 
  gender: { 
    type: String, 
    enum: ["Male", "Female"], 
    required: true 
  },
  password: { type: String, required: true },
  testReports: { type: [String], default: [] },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  verificationTokenExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

const User = mongoose.model("User", userSchema, "users");
module.exports = User;