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
  // ====================== CARDIOLOGY ======================
  { 
    name: "Dr. John Smith", 
    email: "john@example.com", 
    pno: 1000001, 
    password: "password123",
    department: "Cardiology",
    designation: "Senior Cardiologist",
    gender: "male",
    leaveDays: [
      { date: "2025-09-27", reason: "Conference" },
      { date: "2025-09-18", reason: "Personal Leave" }
    ],
    workingHours: { start: "08:00", end: "14:00" }
  },
  { 
    name: "Dr. Sarah Williams", 
    email: "sarah.cardiology@example.com", 
    pno: 1000004, 
    password: "cardio456",
    department: "Cardiology",
    designation: "Junior Cardiologist",
    gender: "female",
    leaveDays: [],
    workingHours: { start: "09:00", end: "15:00" }
  },
  { 
    name: "Dr. Ahmed Khan", 
    email: "ahmed.khan@example.com", 
    pno: 1000005, 
    password: "heartDoc123",
    department: "Cardiology",
    designation: "Cardiology Specialist",
    gender: "male",
    leaveDays: [],
    workingHours: { start: "10:00", end: "16:00" }
  },

  // ====================== NEUROLOGY ======================
  { 
    name: "Dr. Emily Davis", 
    email: "emily@example.com", 
    pno: 1000002, 
    password: "securePass456",
    department: "Neurology",
    designation: "Assistant Neurologist",
    gender: "female",
    leaveDays: [
      { date: "2025-09-14", reason: "Medical Camp" }
    ],
    workingHours: { start: "08:00", end: "14:00" }
  },
  { 
    name: "Dr. Michael Johnson", 
    email: "michael.neuro@example.com",
    pno: 1000006,
    password: "neuro999",
    department: "Neurology",
    designation: "Senior Neurologist",
    gender: "male",
    leaveDays: [],
    workingHours: { start: "10:00", end: "17:00" }
  },
  { 
    name: "Dr. Laura Chen", 
    email: "laura.chen@example.com",
    pno: 1000007,
    password: "brainPower123",
    department: "Neurology",
    designation: "Neuro Consultant",
    gender: "female",
    leaveDays: [],
    workingHours: { start: "09:00", end: "14:00" }
  },

  // ====================== PEDIATRICS ======================
  { 
    name: "Dr. Mark Taylor", 
    email: "mark@example.com", 
    pno: 1000003, 
    password: "docMark789",
    department: "Pediatrics",
    designation: "Junior Pediatrician",
    gender: "male",
    leaveDays: [],
    workingHours: { start: "09:00", end: "15:00" }
  },
  { 
    name: "Dr. Rachel Ahmed", 
    email: "rachel.peds@example.com",
    pno: 1000008,
    password: "peds123",
    department: "Pediatrics",
    designation: "Senior Pediatrician",
    gender: "female",
    leaveDays: [],
    workingHours: { start: "10:00", end: "16:00" }
  },
  { 
    name: "Dr. Omar Ali", 
    email: "omar.peds@example.com",
    pno: 1000009,
    password: "kidsCare456",
    department: "Pediatrics",
    designation: "Pediatric Specialist",
    gender: "male",
    leaveDays: [],
    workingHours: { start: "08:00", end: "13:00" }
  },

  // ====================== DERMATOLOGY ======================
  { 
    name: "Dr. Hannah Brown",
    email: "hannah.derma@example.com",
    pno: 1000010,
    password: "skinDoc123",
    department: "Dermatology",
    designation: "Senior Dermatologist",
    gender: "female",
    leaveDays: [],
    workingHours: { start: "09:00", end: "13:00" }
  },
  { 
    name: "Dr. Yusuf Malik",
    email: "yusuf.derma@example.com",
    pno: 1000011,
    password: "derma2025",
    department: "Dermatology",
    designation: "Cosmetic Dermatologist",
    gender: "male",
    leaveDays: [],
    workingHours: { start: "12:00", end: "18:00" }
  },

  // ====================== ORTHOPEDICS ======================
  { 
    name: "Dr. Sophia Carter",
    email: "sophia.ortho@example.com",
    pno: 1000012,
    password: "ortho789",
    department: "Orthopedics",
    designation: "Ortho Consultant",
    gender: "female",
    leaveDays: [],
    workingHours: { start: "09:00", end: "14:00" }
  },
  { 
    name: "Dr. Hasan Raza",
    email: "hasan.ortho@example.com",
    pno: 1000013,
    password: "boneCare123",
    department: "Orthopedics",
    designation: "Senior Orthopedic Surgeon",
    gender: "male",
    leaveDays: [],
    workingHours: { start: "10:00", end: "16:00" }
  },
  { 
    name: "Dr. Olivia Johnson",
    email: "olivia.ortho@example.com",
    pno: 1000014,
    password: "orthoLove321",
    department: "Orthopedics",
    designation: "Junior Orthopedic Doctor",
    gender: "female",
    leaveDays: [],
    workingHours: { start: "08:00", end: "13:00" }
  }
];

async function seedDoctors() {
  try {
    await Doctor.deleteMany({});
    console.log("🗑 Old doctors removed.");

    for (const doc of doctors) {
      const doctor = new Doctor(doc);
      await doctor.save(); // password will be hashed if you have pre-save middleware
    }

    console.log("✅ Doctors seeded successfully.");
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error seeding doctors:", error);
    mongoose.connection.close();
  }
}

seedDoctors();
