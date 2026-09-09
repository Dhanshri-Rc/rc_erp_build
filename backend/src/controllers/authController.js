import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { asyncHandler, ok } from "../utils/http.js";
import { logActivity } from "../utils/audit.js";

const isProduction = process.env.NODE_ENV === "production";
const jwtSecret = process.env.JWT_SECRET;

if (isProduction && !jwtSecret) {
  throw new Error("JWT_SECRET is required in production");
}

const getCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: process.env.COOKIE_SAME_SITE || "lax",
  path: "/",
  ...(maxAge ? { maxAge } : {}),
});

const signToken = (userId, remember) => {
  const sessionDuration = remember ? "30d" : "8h";

  return jwt.sign(
    { id: userId },
    jwtSecret || "development-secret-change-me",
    { expiresIn: sessionDuration },
  );
};

const safe = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  fullName: user.fullName,
  contactNumber: user.contactNumber,
  role: user.role,
  status: user.status,
  avatar: user.avatar,
  lastLogin: user.lastLogin,
});

export const login = asyncHandler(async (req, res) => {
  const { identifier, email, username, password, remember } = req.body;

  const loginValue = (identifier || email || username || "")
    .trim()
    .toLowerCase();

  if (!loginValue || !password) {
    return res.status(422).json({
      success: false,
      message: "Username/email and password are required",
      errors: [],
    });
  }

  const user = await User.findOne({
    $or: [{ email: loginValue }, { username: loginValue }],
  }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({
      success: false,
      message: "Invalid username/email or password",
      errors: [],
    });
  }

  if (user.status !== "active") {
    return res.status(403).json({
      success: false,
      message: "Your account is inactive. Contact the administrator.",
      errors: [],
    });
  }

  user.lastLogin = new Date();
  await user.save();

  const shouldRemember = remember === true;
  const token = signToken(user._id, shouldRemember);

  const maxAge = shouldRemember
    ? 30 * 24 * 60 * 60 * 1000
    : 8 * 60 * 60 * 1000;

  res.cookie("rcerp_token", token, getCookieOptions(maxAge));

  req.user = user;

  await logActivity(req, {
    action: "LOGIN",
    module: "auth",
    entityType: "User",
    entityId: user._id,
    description: `${user.fullName} signed in`,
  });

  return ok(res, safe(user), "Login successful");
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("rcerp_token", getCookieOptions());

  return ok(res, null, "Logged out successfully");
});

export const me = asyncHandler(async (req, res) => {
  return ok(res, safe(req.user));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  return ok(
    res,
    null,
    "If the account exists, a password reset request has been recorded. Please contact your administrator.",
  );
});