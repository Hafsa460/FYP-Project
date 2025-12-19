import mongoose from "mongoose";
import dotenv from "dotenv";
import Department from "./models/Department.js"; // adjust path if needed

dotenv.config();

const departments = [
  {
    name: "Cardiology",
    description: "Heart and blood vessel treatments",
    doctors: 12,
    nurses: 20,
    staff: 10,
    rooms: 15
  },
  {
    name: "Neurology",
    description: "Brain and nervous system treatments",
    doctors: 10,
    nurses: 18,
    staff: 8,
    rooms: 12
  },
  {
    name: "Pediatrics",
    description: "Child healthcare services",
    doctors: 15,
    nurses: 25,
    staff: 12,
    rooms: 20
  },
  {
    name: "Orthopedics",
    description: "Bone and joint care",
    doctors: 9,
    nurses: 14,
    staff: 7,
    rooms: 10
  },
  {
    name: "Dermatology",
    description: "Skin treatments",
    doctors: 6,
    nurses: 10,
    staff: 5,
    rooms: 6
  },
  {
    name: "Oncology",
    description: "Cancer treatments",
    doctors: 14,
    nurses: 22,
    staff: 11,
    rooms: 18
  },
  {
    name: "Gynecology",
    description: "Women’s health services",
    doctors: 11,
    nurses: 19,
    staff: 9,
    rooms: 14
  },
  {
    name: "ENT",
    description: "Ear, nose, and throat care",
    doctors: 7,
    nurses: 12,
    staff: 6,
    rooms: 8
  },
  {
    name: "Urology",
    description: "Urinary tract treatments",
    doctors: 8,
    nurses: 13,
    staff: 6,
    rooms: 9
  },
  {
    name: "Ophthalmology",
    description: "Eye care and surgeries",
    doctors: 9,
    nurses: 15,
    staff: 7,
    rooms: 11
  }
];

const seedDepartments = async () => {
  try {
    await Department.deleteMany();
    await Department.insertMany(departments);
    console.log("✅ Departments seeded successfully!");
  } catch (err) {
    console.error("❌ Seeding error:", err);
  } finally {
    mongoose.connection.close();
  }
};

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    return seedDepartments();
  })
  .catch((err) => {
    console.error("❌ Connection error:", err);
  });
