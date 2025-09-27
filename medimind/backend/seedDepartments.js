import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
});

const Department = mongoose.model("Department", departmentSchema);

const departments = [
  { name: "Cardiology", description: "Heart and blood vessel treatments" },
  { name: "Neurology", description: "Brain and nervous system treatments" },
  { name: "Pediatrics", description: "Child healthcare services" },
  { name: "Orthopedics", description: "Bone and joint care" },
  { name: "Dermatology", description: "Skin treatments" },
  { name: "Oncology", description: "Cancer treatments" },
  { name: "Gynecology", description: "Women’s health services" },
  { name: "ENT", description: "Ear, nose, and throat care" },
  { name: "Urology", description: "Urinary tract treatments" },
  { name: "Ophthalmology", description: "Eye care and surgeries" },
];

const seedDepartments = async () => {
  try {
    await Department.deleteMany();
    await Department.insertMany(departments);
    console.log("Departments seeded successfully!");
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    mongoose.connection.close();
  }
};

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    return seedDepartments();
  })
  .catch((err) => {
    console.error("❌ Connection error:", err);
  });