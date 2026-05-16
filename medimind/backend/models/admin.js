// models/admin.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["doctorAdmin", "patientAdmin", "departmentAdmin", "superAdmin"],
    required: true,
  },
  // optional gender for profile icon selection
  gender: {
    type: String,
    enum: ["male", "female"],
    default: "female",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  verificationTokenExpires: Date,
}, { timestamps: true });

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  if (typeof this.password !== "string") return next();
  if (this.password.startsWith("$2")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.models.Admin || mongoose.model("Admin", adminSchema);
