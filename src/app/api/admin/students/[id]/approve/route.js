import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAccountApprovedEmail } from "@/lib/mail";

export async function POST(req, { params }) {
  // Await params before destructuring
  const { id } = await params;  // This fixes the promise issue

  console.log("Approving user with ID:", id);

  if (!id) {
    return NextResponse.json(
      { success: false, message: "User id is missing" },
      { status: 400 }
    );
  }

  try {
    // Update user approval status
    const user = await prisma.user.update({
      where: { id },
      data: {
        profile: {
          update: {
            isProfileApproved: true, // Approve the user's profile
          },
        },
        isApproved: true,  // Optional: mark user as approved
        isRejected: false, // Optional: mark user as not rejected
      },
      select: {
        id: true,
        name: true,
        email: true,
        isApproved: true,
        isRejected: true,
        profile: {
          select: {
            isProfileRejected: true, // Fetch updated profile approval status
          },
        },
      },
    });

    // Send approval email, but don't break if it fails
    try {
      await sendAccountApprovedEmail({ to: user.email, name: user.name });
    } catch (mailErr) {
      console.error("APPROVAL_EMAIL_ERROR", mailErr);
      // It's okay if the email fails, just log the error
    }

    return NextResponse.json({
      success: true,
      message: "User approved successfully",
      data: { user },
    });
  } catch (err) {
    console.error("APPROVE_USER_ERROR", err);
    return NextResponse.json(
      { success: false, message: "Failed to approve user", error: err.message },
      { status: 500 }
    );
  }
}
