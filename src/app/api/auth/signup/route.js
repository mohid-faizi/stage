// app/api/auth/signup/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required", data: null },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      if (existing.isRejected) {
        return NextResponse.json(
          {
            success: false,
            message:
              "This email has been rejected by the administrator and cannot be used.",
            data: { status: "REJECTED" },
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { success: false, message: "Email already in use", data: null },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashed,
        role: "USER",         // 👈 always USER on signup
        isVerified: true,
        isApproved: false,
        isRejected: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isApproved: true,
        isRejected: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Account created successfully. Your account is pending admin approval.",
        data: { user },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("SIGNUP_ERROR", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error", data: null },
      { status: 500 }
    );
  }
}
