const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  pno: { type: Number, required: true, unique: true },
  password: { type: String, required: true },
  department: { type: String, required: true },

  leaveDays: [
    {
      date: { type: String, required: true },
      reason: { type: String }
    }
  ],

  workingHours: {
    start: { type: String, default: "08:00" },
    end: { type: String, default: "14:00" }
  },

  // 🔹 New field
  appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Appointment" }]
});

doctorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

doctorSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Doctor", doctorSchema);