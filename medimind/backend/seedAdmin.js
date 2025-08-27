// seedAdmin.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/admin"); // make sure path is correct

const seedAdmins = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "hospital", // ensure using the correct DB
    });
    console.log("✅ Connected to MongoDB");

    // Optional: Clear existing admins
    await Admin.deleteMany();
    console.log("🗑️ Cleared existing admins");

    // Admin data
    const admins = [
      { id: 221460, name: "hafsa", password: "hafsa1234@", role: "doctorAdmin" },
      { id: 221382, name: "sirat", password: "sirat1234@", role: "patientAdmin" },
      { id: 221343, name: "areeba", password: "areeba1234@", role: "departmentAdmin" },
      { id: 222222, name: "admin", password: "admin1234@", role: "superAdmin" },
    ];

    // Hash passwords
    for (let admin of admins) {
      admin.password = await bcrypt.hash(admin.password, 10);
    }

    // Insert into DB
    await Admin.insertMany(admins);
    console.log("✅ Seed data inserted successfully");

    // Close DB connection
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error inserting seed data:", error);
    mongoose.connection.close();
  }
};

// Run seeding
seedAdmins();
