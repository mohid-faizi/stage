import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      return NextResponse.json(
        { success: false, message: "Invalid verification link", data: null },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.verificationToken || user.verificationToken !== token) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or already used verification token",
          data: null,
        },
        { status: 400 }
      );
    }

    if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) {
      return NextResponse.json(
        { success: false, message: "Verification link has expired", data: null },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        verificationToken: null,
        verificationTokenExpires: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Email verified successfully",
        data: { user: updatedUser },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("VERIFY_EMAIL_ERROR", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error", data: null },
      { status: 500 }
    );
  }
}
