// backend/seed.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // Check if admin already exists
    const adminExists = await User.findOne({ email: "admin@trustchain.com" });
    if (adminExists) {
      console.log("Admin already exists. Updating password...");
      adminExists.password = "admin123";
      await adminExists.save();
      console.log("Admin password updated to 'admin123'");
    } else {
      await User.create({
        name: "Super Admin",
        email: "admin@trustchain.com",
        password: "admin123",
        role: "admin",
        company: "TrustChain Authority"
      });
      console.log("Admin user created successfully!");
    }

    // Also create a demo HR user
    const hrExists = await User.findOne({ email: "hr@iitdelhi.edu" });
    if (!hrExists) {
      await User.create({
        name: "IIT Delhi Registrar",
        email: "hr@iitdelhi.edu",
        password: "password123",
        role: "hr",
        company: "IIT Delhi"
      });
      console.log("Demo HR user created!");
    }

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
}

seedAdmin();
