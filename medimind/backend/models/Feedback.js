const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  _id: String,
  aiReportID: String,
  result: String,
  givenBy: String,
});

module.exports = mongoose.model("FeedBack", feedbackSchema);
