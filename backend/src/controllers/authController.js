import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { asyncHandler, ok } from "../utils/http.js";
import { logActivity } from "../utils/audit.js";
import Session from '../models/Session.js';
import crypto from 'crypto';

const isProduction = process.env.NODE_ENV === "production";
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must contain at least 32 characters");
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
  const tokenId = crypto.randomUUID();

  const token = jwt.sign(
    { id: userId, jti: tokenId },
    jwtSecret,
    { expiresIn: sessionDuration, issuer:'rc-erp-api', audience:'rc-erp-web' },
  );
  return { token, tokenId };
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

  const rawLogin = identifier || email || username || "";
  if (typeof rawLogin !== 'string' || typeof password !== 'string' || password.length > 128) {
    return res.status(422).json({ success: false, message: 'Invalid login request', errors: [] });
  }
  const loginValue = rawLogin
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
    return res.status(401).json({
      success: false,
      message: "Invalid username/email or password",
      errors: [],
    });
  }

  user.lastLogin = new Date();
  await user.save();

  const shouldRemember = remember === true;
  const { token, tokenId } = signToken(user._id, shouldRemember);

  const maxAge = shouldRemember
    ? 30 * 24 * 60 * 60 * 1000
    : 8 * 60 * 60 * 1000;

  res.cookie("rcerp_token", token, getCookieOptions(maxAge));
  res.setHeader('Cache-Control', 'no-store');
  await Session.create({ user:user._id, tokenId, expiresAt:new Date(Date.now()+maxAge) });

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
  if (req.auth?.tokenId) await Session.updateOne({tokenId:req.auth.tokenId,user:req.user._id},{$set:{revokedAt:new Date()}});
  res.clearCookie("rcerp_token", getCookieOptions());

  return ok(res, null, "Logged out successfully");
});

export const me = asyncHandler(async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  return ok(res, safe(req.user));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  return ok(
    res,
    null,
    "If the account exists, a password reset request has been recorded. Please contact your administrator.",
  );
});
