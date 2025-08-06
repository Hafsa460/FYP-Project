const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  _id: String,
  name: String,
  username: String,
  password: String,
  designation: String,
  availableDays: [String],
});

module.exports = mongoose.model("Doctor", doctorSchema);
