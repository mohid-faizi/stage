// app/api/interns/search/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const qRaw = searchParams.get("q") || "";
    const cityParam = searchParams.get("city") || "all";
    const diplomaParam = searchParams.get("diploma") || "all";
    const page = parseInt(searchParams.get("page") || "1", 10);
    let limit = parseInt(searchParams.get("limit") || "10", 10);

    // Validate and constrain limit to 5, 10, or 25
    const validLimits = [5, 10, 25];
    if (!validLimits.includes(limit)) {
      limit = 10;
    }

    const q = qRaw.trim();
    const skip = (page - 1) * limit;

    // ---- base filters on User ----
    const where = {
      isApproved: true,
      isRejected: false,
    };

    // text search on User fields
    if (q) {
      where.OR = [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { studentNumber: { contains: q, mode: "insensitive" } },
      ];
    }

    // diploma is stored on User
    if (diplomaParam && diplomaParam !== "all") {
      where.diploma = diplomaParam;
    }

    // ---- profile filter (city + isComplete + isProfileApproved + isAvailableForWork) ----
    const profileFilter = {
      isComplete: true,
      isProfileApproved: true,
      isAvailableForWork: true,
    };

    // city is stored on Profile
    if (cityParam && cityParam !== "all") {
      profileFilter.city = cityParam;
    }

    // attach relation filter for 1-1 Profile
    where.profile = {
      is: profileFilter,
    };

    // total count for pagination
    const total = await prisma.user.count({ where });
    const totalPages = Math.ceil(total / limit) || 1;

    // query users + profile + nested relations
    const users = await prisma.user.findMany({
      where,
      include: {
        profile: {
          include: {
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

    // shape data for frontend
    const data = users.map((u) => {
      const p = u.profile;

      return {
        id: u.id,
        firstName: u.firstName || null,
        lastName: u.lastName || null,
        email: u.email,
        studentNumber: u.studentNumber || null,
        establishment: u.establishment || null,
        diploma: u.diploma || null,

        // from Profile
        city: p?.city || null,
        phone: p?.phone || null,
        linkedin: p?.linkedin || null,
        presentation: p?.presentation || null,
        expectedGraduation: p?.expectedGraduation || null,
        classProjects: p?.classProjects || null,

        // relational arrays (Course/Skill/Language/Experience)
        courses: p?.courses || [],
        skills: p?.skills || [],
        languages: p?.languages || [],
        experiences: p?.experiences || [],
      };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Interns fetched",
        data,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("INTERN_SEARCH_ERROR", err);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        data: [],
      },
      { status: 500 }
    );
  }
}
