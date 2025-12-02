// app/api/profile/summary/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ACCESS_TOKEN_COOKIE, verifyAccessToken } from "@/lib/auth";

async function getUserIdFromRequest() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value || null;

  if (!token) return null;

  const payload = verifyAccessToken(token);
  if (!payload || !payload.sub) return null;

  return payload.sub;
}

export async function GET() {
  try {
    const userId = await getUserIdFromRequest();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized", data: null },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        studentNumber: true,
        establishment: true,
        diploma: true,
        isApproved: true,
        isRejected: true,
        profile: {
          select: {
            city: true,
            phone: true,
            linkedin: true,
            isComplete: true,
            isAvailableForWork: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found", data: null },
        { status: 404 }
      );
    }

    const profile = user.profile;

    const data = {
      id: user.id,
      name: user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email,
      role: user.role,
      studentNumber: user.studentNumber || "",
      establishment: user.establishment || "",
      diploma: user.diploma || "",
      city: profile?.city || "",
      phone: profile?.phone || "",
      linkedin: profile?.linkedin || "",
      isProfileComplete: profile?.isComplete ?? false,
      isAvailableForWork: profile?.isAvailableForWork ?? true,
      isApproved: user.isApproved,
      isRejected: user.isRejected,
    };

    return NextResponse.json({
      success: true,
      message: "Profile summary fetched successfully",
      data,
    });
  } catch (err) {
    console.error("PROFILE_SUMMARY_ERROR", err);
    return NextResponse.json(
      { success: false, message: "Internal server error", data: null },
      { status: 500 }
    );
  }
}
