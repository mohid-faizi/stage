import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/students/[id]
// Returns a single student with profile details for admin view
export async function GET(request, { params }) {
  try {
    const { id } = await params || {};

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Student id is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: {
          select: {
            phone: true,
            city: true,
            linkedin: true,
            presentation: true,
            expectedGraduation: true,
            classProjects: true,
            isComplete: true,
            isAvailableForWork: true,
            isProfileApproved: true,
            isProfileRejected: true,
            courses: true,
            skills: true,
            languages: true,
            experiences: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error("ADMIN_STUDENT_DETAIL_ERROR", err);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch student",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      },
      { status: 500 }
    );
  }
}
