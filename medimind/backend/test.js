require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "hospital"
    });

    const mrNo = 12;           // Test MR No
    const plainPassword = "test123"; // Password you want to use

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const existingUser = await User.findOne({ mrNo });

    if (existingUser) {
      await User.updateOne(
        { mrNo },
        { $set: { password: hashedPassword } }
      );
      console.log(`✅ Existing user MR No ${mrNo} password updated to '${plainPassword}'`);
    } else {
      const newUser = await User.create({
        email: "test@gmail.com",
        name: "Test User",
        age: 25,
        mrNo,
        password: hashedPassword,
        isVerified: true
      });
      console.log(`✅ New test user created: MR No ${mrNo}, password '${plainPassword}'`);
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating/updating test user:", err);
    process.exit(1);
  }
})();
