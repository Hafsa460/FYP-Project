const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Doctor = require("./models/Doctor");
require("dotenv").config(); // to load .env variables

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB Atlas"))
.catch(err => console.error("Connection error:", err));

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
];

async function seedDoctors() {
  try {
    await Doctor.deleteMany({});
    console.log("Old doctors removed.");

    for (let doc of doctors) {
      await Doctor.create(doc); // pre("save") will hash password
    }

    console.log("Doctors seeded successfully.");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding doctors:", error);
    mongoose.connection.close();
  }
}

seedDoctors();
