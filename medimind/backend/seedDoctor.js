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
    leaveDays: [
      { date: "2025-09-12", reason: "Conference" },
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
    leaveDays: [
      { date: "2025-09-14", reason: "Medical Camp" }
    ],
    workingHours: { start: "08:00", end: "14:00" }
  }
  // add more doctors as you like...
];

async function seedDoctors() {
  try {
    await Doctor.deleteMany();
    console.log("🗑 Old doctors removed.");

    for (const doc of doctors) {
      const doctor = new Doctor(doc);
      await doctor.save(); // password gets hashed
    }

    console.log("✅ Doctors seeded successfully.");
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error seeding doctors:", error);
    mongoose.connection.close();
  }
}

seedDoctors();
