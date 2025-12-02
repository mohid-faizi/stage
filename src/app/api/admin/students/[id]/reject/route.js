import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAccountRejectedEmail } from "@/lib/mail";

export async function POST(req, { params }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { success: false, message: "User id is missing" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
           profile: {
          update: {
            isProfileRejected: true, // Approve the user's profile
          },
        },
        isApproved: false,
        isRejected: true,
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

    // Send rejection email, but don't break if it fails
    try {
      await sendAccountRejectedEmail({ to: user.email, name: user.name });
    } catch (mailErr) {
      console.error("REJECTION_EMAIL_ERROR", mailErr);
    }

    return NextResponse.json({
      success: true,
      message: "User rejected successfully",
      data: { user },
    });
  } catch (err) {
    console.error("REJECT_USER_ERROR", err);
    return NextResponse.json(
      { success: false, message: "Failed to reject user" },
      { status: 500 }
    );
  }
}
