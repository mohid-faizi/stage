// app/api/auth/logout/route.js
import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "../../../../lib/auth";

export async function POST() {
  const res = NextResponse.json(
    {
      success: true,
      message: "Logged out successfully",
      data: null,
    },
    { status: 200 }
  );

  // clear cookie
  res.cookies.set(ACCESS_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return res;
}
