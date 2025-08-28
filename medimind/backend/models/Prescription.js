import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
  prid: {
    type: String,
    required: true,
  },
  MRid: {
    type: String,
    required: true,
  },
  testRecommendation: {
    type: String,
  },
  labReport: {
    type: String,
  },
  summary: {
    type: String,
  },
  investigation: {
    type: String,
  },
  followUp: {
    type: String,
  },
  prescription: {
    type: String,
  },
  diagnosis: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Prescription = mongoose.model("Prescription", prescriptionSchema);

export default Prescription;
