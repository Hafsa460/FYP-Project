// backend/seedDoctor.js
const mongoose = require("mongoose");
const Doctor = require("./models/Doctor");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch(err => console.error("❌ Connection error:", err));

const doctors = [
  { 
    name: "Dr. John Smith", 
    email: "john@example.com", 
    pno: 1000001, 
    password: "password123",
    department: "Cardiology",
    designation: "Senior Cardiologist"  
  },
  { 
    name: "Dr. Emily Davis", 
    email: "emily@example.com", 
    pno: 1000002, 
    password: "securePass456",
    department: "Neurology",
    designation: "Assistant Neurologist"    
  },
  { 
    name: "Dr. Mark Taylor", 
    email: "mark@example.com", 
    pno: 1000003, 
    password: "docMark789",
    department: "Pediatrics",
    designation: "Junior Pediatrician"   
  },
  {
    name: "Dr. John Smith",
    email: "john@example.com",
    pno: 1000001,
    password: "password123",
    department: "Cardiology",
    designation: "Consultant Cardiologist",
    gender: "male",
    leaveDays: [
      { date: "2025-09-27", reason: "Conference" },
      { date: "2025-09-18", reason: "Personal Leave" }
    ],
    workingHours: { start: "08:00", end: "14:00" }
  },
  {
    name: "Dr. Emily Davis",
    email: "emily@example.com",
    pno: 1000002,
    password: "securePass456",
    department: "Neurology",
    designation: "Assistant Professor of Neurology",
    gender: "female",
    leaveDays: [
      { date: "2025-09-14", reason: "Medical Camp" }
    ],
    workingHours: { start: "08:00", end: "14:00" }
  }

];

async function seedDoctors() {
  try {
    await Doctor.deleteMany({});
    console.log("🗑 Old doctors removed.");

    for (const doc of doctors) {
      const doctor = new Doctor(doc);
      await doctor.save();
    }

    console.log("✅ Doctors seeded successfully.");
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error seeding doctors:", error);
    mongoose.connection.close();
  }
}

seedDoctors();
