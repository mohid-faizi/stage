import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    // Get pagination parameters from query string
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const status = searchParams.get("status") || "all";
    const skip = (page - 1) * limit;

    // Build profile filter based on status
    const profileFilter = { isComplete: true };

    if (status === "approved") {
      profileFilter.isProfileApproved = true;
    } else if (status === "pending") {
      profileFilter.isProfileApproved = false;
      profileFilter.isProfileRejected = false;
    } else if (status === "rejected") {
      profileFilter.isProfileRejected = true;
    }

    const where = {
      NOT: { role: "ADMIN" },
      profile: {
        is: profileFilter,
      },
    };

    // Get total count for pagination
    const total = await prisma.user.count({ where });

    const users = await prisma.user.findMany({
      where,
      include: {
        profile: {
          select: {
            phone: true,
            city: true,
            linkedin: true,
            isProfileApproved: true,
            isProfileRejected: true,
            presentation: true,
            expectedGraduation: true,
            classProjects: true,
            courses: true,
            skills: true,
            languages: true,
            experiences: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    console.error("USER_FETCH_ERROR:", err);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch users",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      },
      { status: 500 }
    );
  }
}