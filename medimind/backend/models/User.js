const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  age: Number,
  username: {
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

module.exports = mongoose.model("User", userSchema);
