import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Total students = users whose profile is completed
    const totalStudents = await prisma.user.count({
      where: {
        profile: { isComplete: true },
      },
    });

    // Approved profiles = completed + approved
    const approvedProfiles = await prisma.user.count({
      where: {
        profile: {
          isComplete: true,
          isProfileApproved: true,
        },
      },
    });

    // Pending profiles = completed but not approved and not rejected
    const pendingProfiles = await prisma.user.count({
      where: {
        profile: {
          isComplete: true,
          isProfileApproved: false,
          isProfileRejected: false,
        },
      },
    });

    // ---- last 24 hours activity ----
    const newStudents24h = await prisma.user.count({
      where: {
        createdAt: { gte: since },
        profile: { isComplete: true },
      },
    });

    const approvedProfiles24h = await prisma.user.count({
      where: {
        createdAt: { gte: since },
        profile: {
          isComplete: true,
          isProfileApproved: true,
        },
      },
    });

    const pendingProfiles24h = await prisma.user.count({
      where: {
        createdAt: { gte: since },
        profile: {
          isComplete: true,
          isProfileApproved: false,
          isProfileRejected: false,
        },
      },
    });

    // For now, AI queue is always 0 (placeholder)
    const aiQueue = 0;

    return NextResponse.json(
      {
        success: true,
        data: {
          totalStudents,
          approvedProfiles,
          pendingProfiles,
          aiQueue,
          last24h: {
            newStudents: newStudents24h,
            approvedProfiles: approvedProfiles24h,
            pendingProfiles: pendingProfiles24h,
            aiQueue: 0,
          },
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("ADMIN_STATS_ERROR", err);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch admin stats",
      },
      { status: 500 }
    );
  }
}
