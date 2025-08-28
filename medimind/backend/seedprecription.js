import mongoose from "mongoose";
import dotenv from "dotenv";
import Prescription from "./models/Prescription.js";

dotenv.config();

const seedData = [
  {
    prid: "P001",
    MRid: "695816",
    testRecommendation: "Blood test, X-ray chest",
    labReport: "Hemoglobin low, X-ray clear",
    summary: "Patient shows mild anemia",
    investigation: "Further tests recommended for iron deficiency",
    followUp: "After 2 weeks",
    prescription: "Iron supplements, Vitamin C",
    diagnosis: "Iron deficiency anemia",
  },
  {
    prid: "P002",
    MRid: "MR67890",
    testRecommendation: "MRI brain",
    labReport: "No abnormalities found",
    summary: "Normal MRI results",
    investigation: "Neurological examination required",
    followUp: "After 1 month",
    prescription: "Painkillers if needed",
    diagnosis: "Migraine",
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await Prescription.deleteMany({});
    await Prescription.insertMany(seedData);

    console.log("✅ Prescription Data Seeded!");
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seedDB();
