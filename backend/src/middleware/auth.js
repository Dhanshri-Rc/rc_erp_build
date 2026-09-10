import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Session from '../models/Session.js';

const isProduction = process.env.NODE_ENV === "production";
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must contain at least 32 characters");
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
      jwtSecret,
      {
        algorithms: ["HS256"],
        issuer: 'rc-erp-api',
        audience: 'rc-erp-web',
      },
    );

    if (!payload?.id || !payload?.jti) {
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

    const session = await Session.exists({ tokenId:payload.jti, user:user._id, revokedAt:null, expiresAt:{$gt:new Date()} });
    if (!session) return res.status(401).json({success:false,message:'Session is no longer active',errors:[]});

    req.user = user;
    req.auth = {
      userId: user._id,
      issuedAt: payload.iat,
      expiresAt: payload.exp,
      tokenId: payload.jti,
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
