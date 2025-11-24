// app/api/users/[id]/reject/route.js
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { sendAccountRejectedEmail } from "../../../../../lib/mail";

export async function POST(req, routeContext) {
  try {
    const { id } = await routeContext.params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "User id is missing", data: null },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        isApproved: false,
        isRejected: true,
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

    // send rejection email
    try {
      await sendAccountRejectedEmail({
        to: user.email,
        name: user.name,
      });
    } catch (mailErr) {
      console.error("REJECTION_EMAIL_ERROR", mailErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "User rejected successfully",
        data: { user },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("REJECT_USER_ERROR", err);
    return NextResponse.json(
      { success: false, message: "Could not reject user", data: null },
      { status: 500 }
    );
  }
}
