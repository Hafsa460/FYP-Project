// seedAdmin.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/admin");

const seedAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "hospital",
    });

    await Admin.deleteMany();

    const admins = [
      { id: 221460, name: "hafsa", password: "hafsa1234@", role: "doctorAdmin", gender: "female" },
      { id: 221382, name: "sirat", password: "sirat1234@", role: "patientAdmin", gender: "female" },
      { id: 221343, name: "areeba", password: "areeba1234@", role: "departmentAdmin", gender: "female" },
      { id: 222222, name: "admin", password: "admin1234@", role: "superAdmin", gender: "male" },
    ];

    for (let admin of admins) {
      admin.password = await bcrypt.hash(admin.password, 10);
    }

    await Admin.insertMany(admins);
    console.log("✅ Seed data inserted successfully");
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error inserting seed data:", error);
    mongoose.connection.close();
  }
};

seedAdmins();
