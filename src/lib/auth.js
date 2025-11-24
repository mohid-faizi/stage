// lib/auth.js
import jwt from "jsonwebtoken";

export const ACCESS_TOKEN_COOKIE = "access_token";

export function signAccessToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set");
  }

  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d", // 7 days
    }
  );
}

export function verifyAccessToken(token) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set");
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null; // invalid / expired
  }
}
