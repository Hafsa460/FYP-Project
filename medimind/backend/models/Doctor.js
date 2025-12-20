// models/Doctor.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  pno: { type: Number, unique: true }, // Make unique but not required initially
  password: { type: String, required: true },
  department: { type: String, required: true },

  // OPTION 3: required + default
  designation: { type: String, required: true, default: "Doctor" },

  gender: { type: String, enum: ["male", "female"], required: true },

  leaveDays: [
    {
      date: { type: String },
      reason: { type: String },
    },
  ],

  workingHours: {
    start: { type: String, default: "08:00" },
    end: { type: String, default: "14:00" },
  },

  appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Appointment" }],

  // soft-delete flag
  active: { type: Boolean, default: true },

  // Verification fields
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  verificationTokenExpires: Date,
  tempPassword: String, // Temporary storage for plain text password
}, { timestamps: true });

doctorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

doctorSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema);
