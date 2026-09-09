import jwt from "jsonwebtoken";
import User from "../models/User.js";

const isProduction = process.env.NODE_ENV === "production";
const jwtSecret = process.env.JWT_SECRET;

if (isProduction && !jwtSecret) {
  throw new Error("JWT_SECRET is required in production");
}

export async function protect(req, res, next) {
  try {
    const cookieToken = req.cookies?.rcerp_token;

    const authorization = req.headers.authorization;
    const bearerToken = authorization?.startsWith("Bearer ")
      ? authorization.slice(7).trim()
      : null;

    const token = cookieToken || bearerToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        errors: [],
      });
    }

    const payload = jwt.verify(
      token,
      jwtSecret || "development-secret-change-me",
      {
        algorithms: ["HS256"],
      },
    );

    if (!payload?.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid session",
        errors: [],
      });
    }

    const user = await User.findById(payload.id).select("-password");

    if (!user || user.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Account is unavailable",
        errors: [],
      });
    }

    /*
     * Invalidate JWT if the password was changed after
     * the token was issued.
     */
    if (
      typeof user.changedPasswordAfter === "function" &&
      user.changedPasswordAfter(payload.iat)
    ) {
      return res.status(401).json({
        success: false,
        message: "Password was changed. Please log in again.",
        errors: [],
      });
    }

    req.user = user;
    req.auth = {
      userId: user._id,
      issuedAt: payload.iat,
      expiresAt: payload.exp,
    };

    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
        errors: [],
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid session. Please log in again.",
      errors: [],
    });
  }
}

export const allow =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        errors: [],
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
        errors: [],
      });
    }

    return next();
  };