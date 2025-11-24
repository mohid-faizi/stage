// app/api/auth/login/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma";
import { signAccessToken, ACCESS_TOKEN_COOKIE } from "../../../../lib/auth";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required",
          data: null,
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
          data: null,
        },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
          data: null,
        },
        { status: 401 }
      );
    }

    // hard block rejected accounts
    if (user.isRejected) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your account has been rejected. You cannot log in with this email.",
          data: { status: "REJECTED" },
        },
        { status: 403 }
      );
    }

    // still pending approval
    if (!user.isApproved) {
      return NextResponse.json(
        {
          success: false,
          message: "Your account is pending admin approval.",
          data: { status: "PENDING_APPROVAL" },
        },
        { status: 403 }
      );
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // create access token
    const token = signAccessToken(user);

    // send json + set httpOnly cookie
    const res = NextResponse.json(
      {
        success: true,
        message: "Logged in successfully",
        data: { user: safeUser },
      },
      { status: 200 }
    );

    res.cookies.set(ACCESS_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // in prod use HTTPS
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (err) {
    console.error("LOGIN_ERROR", err);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        data: null,
      },
      { status: 500 }
    );
  }
}
