const mongoose = require("mongoose");
require("dotenv").config();

const uri = process.env.MONGO_URI;

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "hospital", // ✅ Set the correct DB name here
  })
  .then(() => console.log("✅ MongoDB connected to 'hospital' database"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Schemas
const userSchema = new mongoose.Schema({
  _id: String,
  name: String,
  age: Number,
  username: Number,
  password: String,
  testReports: Array,
});

const doctorSchema = new mongoose.Schema({
  _id: String,
  name: String,
  username: Number,
  password: String,
  designation: String,
  availableDays: [String],
});

const feedbackSchema = new mongoose.Schema({
  _id: String,
  aiReportID: String,
  result: String,
  givenBy: String,
});

// Models
const User = mongoose.model("User", userSchema);
const Doctor = mongoose.model("Doctor", doctorSchema);
const Feedback = mongoose.model("Feedback", feedbackSchema);

// Seed function
const seed = async () => {
  try {
    // 🧹 Clear previous data
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Feedback.deleteMany({});
    console.log("🧹 Previous data deleted");

    // 🔁 New data
    const user = new User({
      _id: "patient_001",
      name: "John Doe",
      age: 45,
      username: 3456789098765,
      password: "patient1",
      testReports: [
        {
          testReportID: "tr_001",
          doctorID: "doc_001",
          testName: "CT Scan",
          result: "Abnormal",
          diagnosis: "Tumor detected",
          followUp: "MRI recommended",
          aiReport: {
            aiReportID: "ai_001",
            diagnosis: "Likely benign tumor",
            feedback: [
              {
                feedbackID: "fb_001",
                result: "Useful",
                givenBy: "Doctor",
              },
            ],
          },
          prescription: {
            prescriptionID: "pr_001",
            test: "CT Scan",
            recommendation: "Consult oncologist",
            clinicalSummary: "Mass in left frontal lobe",
            investigation: "MRI advised",
            medication: "Ibuprofen",
            followUp: "After MRI",
          },
        },
      ],
    });

    const doctor = new Doctor({
      _id: "doc_001",
      name: "Dr. Sarah Khan",
      username: 1234567890987,
      password: "doctor1",
      designation: "Neurologist",
      availableDays: ["Monday", "Wednesday", "Friday"],
    });

    const feedback = new Feedback({
      _id: "fb_001",
      aiReportID: "ai_001",
      result: "Accurate",
      givenBy: "Patient",
    });

    await user.save();
    await doctor.save();
    await feedback.save();

    console.log("✅ Seeding done!");
  } catch (err) {
    console.error("❌ Seeding error:", err);
  } finally {
    mongoose.connection.close();
  }
};

seed();
