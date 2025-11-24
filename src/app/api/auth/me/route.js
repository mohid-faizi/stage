// app/api/auth/me/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE, verifyAccessToken } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value || null;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated", data: null },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(token);

    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Invalid token", data: null },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found", data: null },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: { user } },
      { status: 200 }
    );
  } catch (err) {
    console.error("ME_ERROR", err);
    return NextResponse.json(
      { success: false, message: "Internal server error", data: null },
      { status: 500 }
    );
  }
}
