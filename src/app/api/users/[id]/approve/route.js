// app/api/users/[id]/approve/route.js
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { sendAccountApprovedEmail } from "../../../../../lib/mail";

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
        isApproved: true,
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

    // send email, but don't break endpoint if mail fails
    try {
      await sendAccountApprovedEmail({
        to: user.email,
        name: user.name,
      });
    } catch (mailErr) {
      console.error("APPROVAL_EMAIL_ERROR", mailErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "User approved successfully",
        data: { user },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("APPROVE_USER_ERROR", err);
    return NextResponse.json(
      { success: false, message: "Could not approve user", data: null },
      { status: 500 }
    );
  }
}
