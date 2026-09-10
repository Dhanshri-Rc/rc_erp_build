import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Session from "../models/Session.js";

const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
const newPassword = process.env.SEED_ADMIN_PASSWORD;

if (!email) {
  throw new Error("SEED_ADMIN_EMAIL is required");
}

if (!newPassword || newPassword.length < 12) {
  throw new Error(
    "SEED_ADMIN_PASSWORD must contain at least 12 characters",
  );
}

await connectDB();

try {
  const admin = await User.findOne({
    email,
    role: "admin",
  }).select("+password");

  if (!admin) {
    throw new Error(`Admin account not found: ${email}`);
  }

  // User model middleware will hash this password automatically.
  admin.password = newPassword;
  admin.passwordChangedAt = new Date();
  admin.status = "active";

  await admin.save();

  // Log out all existing sessions for this admin.
  await Session.updateMany(
    {
      user: admin._id,
      revokedAt: null,
    },
    {
      $set: { revokedAt: new Date() },
    },
  );

  console.log("Administrator password reset successfully");
} finally {
  await mongoose.disconnect();
}