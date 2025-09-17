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

// Manually specify unique 7-digit PNOs
const doctors = [
  { name: "Dr. John Smith", email: "john@example.com", pno: 1000001, password: "password123" },
  { name: "Dr. Emily Davis", email: "emily@example.com", pno: 1000002, password: "securePass456" },
  { name: "Dr. Mark Taylor", email: "mark@example.com", pno: 1000003, password: "docMark789" },
];

async function seedDoctors() {
  try {
    await Doctor.deleteMany();
    console.log("Old doctors removed.");

    for (let doc of doctors) {
      // Do NOT hash manually, let pre("save") do it
      await Doctor.create({ 
        name: doc.name, 
        email: doc.email, 
        pno: doc.pno, 
        password: doc.password // raw password
      });
    }

    console.log("Doctors seeded successfully.");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding doctors:", error);
    mongoose.connection.close();
  }
}

seedDoctors();