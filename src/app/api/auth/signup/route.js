// app/api/auth/signup/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const normalize = (val) => {
  if (typeof val !== "string") return null;
  const trimmed = val.trim();
  return trimmed === "" ? null : trimmed;
};

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      firstName,
      lastName,
      email,
      password,
      studentNumber,
      establishment,
      diploma,
      city,
    } = body;

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

    if (!studentNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "Student number is required",
          data: null,
        },
        { status: 400 }
      );
    }

    const emailNormalized = email.trim().toLowerCase();

    // check existing email
    const existing = await prisma.user.findUnique({
      where: { email: emailNormalized },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Email already in use",
          data: null,
        },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    const firstNameNorm = normalize(firstName);
    const lastNameNorm = normalize(lastName);

    const user = await prisma.user.create({
      data: {
        // basic identity
        firstName: firstNameNorm,
        lastName: lastNameNorm,
        name:
          [firstNameNorm, lastNameNorm].filter(Boolean).join(" ") || null,

        // auth
        email: emailNormalized,
        password: hashed,
        role: "USER", // Prisma enum Role { ADMIN, USER }

        // academic info
        studentNumber: normalize(studentNumber),
        establishment: normalize(establishment),
        diploma: normalize(diploma),

        // workflow flags (can be omitted, defaults are false)
        isVerified: false,
        isApproved: false,
        isRejected: false,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        name: true,
        email: true,
        studentNumber: true,
        establishment: true,
        diploma: true,
        role: true,
        isVerified: true,
        isApproved: true,
        isRejected: true,
        createdAt: true,
      },
    });

    const cityNorm = normalize(city);
    if (cityNorm) {
      try {
        await prisma.profile.create({
          data: {
            userId: user.id,
            city: cityNorm,
          },
        });
      } catch (profileErr) {
        console.error("SIGNUP_PROFILE_CREATE_ERROR", profileErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Account request created successfully. Please wait for administrator approval.",
        data: { user },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("SIGNUP_ERROR", err);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        data: null,
      },
      { status: 500 }
    );
  }
}
