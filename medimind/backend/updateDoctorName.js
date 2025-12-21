const mongoose = require("mongoose");
const Doctor = require("./models/Doctor");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ Connection error:", err));

async function updateDoctorName() {
  try {
    const result = await Doctor.updateOne(
      { pno: 298268 },                 // 👈 find by pno
      { $set: { name: "Dr Sara Ali" } } // 👈 ONLY update name
    );

    if (result.matchedCount === 0) {
      console.log("⚠️ No doctor found with this pno");
    } else {
      console.log("✅ Doctor name updated successfully");
    }

    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Update error:", error);
    mongoose.connection.close();
  }
}

updateDoctorName();
