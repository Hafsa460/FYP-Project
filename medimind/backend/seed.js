require("dotenv").config();
const mongoose = require("mongoose");

// Models
const Doctor = require("./models/Doctor");
const FeedBack = require("./models/Feedback");
const User = require("./models/User");

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: "hospital" });
    console.log("MongoDB connected for seeding");

    // Clear existing data (optional, remove if you want to keep existing docs)
    await Doctor.deleteMany({});
    await FeedBack.deleteMany({});
    await User.deleteMany({});

    // Seed Doctors
    const doctors = [
      {
        name: "Dr. Alice",
        email: "alice@example.com",
        password: "password123",
      },
      { name: "Dr. Bob", email: "bob@example.com", password: "securePass456" },
    ];
    await Doctor.insertMany(doctors);
    console.log("Doctors seeded");

    // Seed Feedbacks
    const feedbacks = [
      {
        _id: "fb1",
        aiReportID: "rep1",
        result: "Positive",
        givenBy: "patient1",
      },
      {
        _id: "fb2",
        aiReportID: "rep2",
        result: "Negative",
        givenBy: "patient2",
      },
    ];
    await FeedBack.insertMany(feedbacks);
    console.log("Feedbacks seeded");

    // Seed Users (Patients)
    const users = [
      {
        email: "john@example.com",
        name: "John Doe",
        age: 30,
        mrNo: 1001,
        password: "patient123",
      },
      {
        email: "jane@example.com",
        name: "Jane Roe",
        age: 25,
        mrNo: 1002,
        password: "mypassword",
      },
    ];
    await User.insertMany(users);
    console.log("Users seeded");

    console.log("✅ Seeding completed");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seed();
