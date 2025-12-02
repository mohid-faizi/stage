// app/api/profile/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ACCESS_TOKEN_COOKIE, verifyAccessToken } from "@/lib/auth";

// ---------------- helpers ----------------

async function getUserIdFromRequest() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value || null;

  if (!token) return null;

  const payload = verifyAccessToken(token);
  if (!payload || !payload.sub) return null;

  return payload.sub; // user.id from JWT "sub"
}

const normalize = (val) => {
  if (typeof val !== "string") return null;
  const trimmed = val.trim();
  return trimmed === "" ? null : trimmed;
};

const normalizeArray = (val) => (Array.isArray(val) ? val : []);

// Basic server-side validation (same logic as before)
function validateProfile(body) {
  const errors = {};

  const phone = (body.phone || "").toString().trim();
  const city = (body.city || "").toString().trim();
  const presentation = (body.presentation || "").toString().trim();
  const firstName = (body.firstName || "").toString().trim();
  const lastName = (body.lastName || "").toString().trim();
  const studentNumber = (body.studentNumber || "").toString().trim();
  const establishment = (body.establishment || "").toString().trim();
  const diploma = (body.diploma || "").toString().trim();

  if (!firstName) errors.firstName = "First name is required";
  if (!lastName) errors.lastName = "Last name is required";
  if (!studentNumber) errors.studentNumber = "Student number is required";
  if (!establishment) errors.establishment = "Establishment is required";
  if (!diploma) errors.diploma = "Diploma is required";
  if (!phone) errors.phone = "Phone is required";
  if (!city) errors.city = "City is required";

  if (phone && phone.length < 6) {
    errors.phone = "Phone number looks too short";
  }

  if (!presentation) {
    errors.presentation = "Presentation is required";
  } else if (presentation.length < 30) {
    errors.presentation = "Presentation should be at least 30 characters";
  }

  return errors;
}

// ---------------- GET /api/profile ----------------

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
            id: true,
            phone: true,
            city: true,
            linkedin: true,
            presentation: true,
            expectedGraduation: true,
            classProjects: true,
            isComplete: true,
            isAvailableForWork: true,
            courses: {
              select: { id: true, name: true, note: true },
            },
            skills: {
              select: {
                id: true,
                name: true,
                level: true,
                certificateUrl: true,
                isCertificateValid: true,
              },
            },
            languages: {
              select: { id: true, name: true, level: true },
            },
            experiences: {
              select: {
                id: true,
                title: true,
                company: true,
                period: true,
                supervisorName: true,
                supervisorEmail: true,
              },
            },
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
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email,
      role: user.role,
      studentNumber: user.studentNumber || "",
      establishment: user.establishment || "",
      diploma: user.diploma || "",

      phone: profile?.phone || "",
      city: profile?.city || "",
      linkedin: profile?.linkedin || "",
      presentation: profile?.presentation || "",
      expectedGraduation: profile?.expectedGraduation || "",
      classProjects: profile?.classProjects || "",

      // map to the simple shapes your frontend expects
      courses: (profile?.courses || []).map((c) => ({
        id: c.id,
        name: c.name,
        note: c.note || "",
      })),
      skills: (profile?.skills || []).map((s) => ({
        id: s.id,
        name: s.name,
        level: s.level || "",
        certificateUrl: s.certificateUrl || "",
        isCertificateValid: s.isCertificateValid ?? false,
      })),
      languages: (profile?.languages || []).map((l) => ({
        id: l.id,
        name: l.name,
        level: l.level || "",
      })),
      experiences: (profile?.experiences || []).map((ex) => ({
        id: ex.id,
        title: ex.title,
        company: ex.company || "",
        period: ex.period || "",
        supervisorName: ex.supervisorName || "",
        supervisorEmail: ex.supervisorEmail || "",
      })),

      isProfileComplete: profile?.isComplete ?? false,
      isAvailableForWork: profile?.isAvailableForWork ?? true,
      isApproved: user.isApproved,
      isRejected: user.isRejected,
    };

    return NextResponse.json({
      success: true,
      message: "Profile fetched successfully",
      data,
    });
  } catch (err) {
    console.error("PROFILE_GET_ERROR", err);
    return NextResponse.json(
      { success: false, message: "Internal server error", data: null },
      { status: 500 }
    );
  }
}

// ---------------- POST /api/profile ----------------
export async function POST(req) {
  try {
    const userId = await getUserIdFromRequest();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized", data: null },
        { status: 401 }
      );
    }

    const body = await req.json();

    // 1) validate
    const fieldErrors = validateProfile(body);
    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: fieldErrors,
          data: null,
        },
        { status: 400 }
      );
    }

    const firstNameNorm = normalize(body.firstName);
    const lastNameNorm = normalize(body.lastName);

    // normalize arrays -> simple objects
    const courses = normalizeArray(body.courses)
      .map((c) => ({
        name: (c?.name || "").trim(),
        note: c?.note ? c.note.trim() : null,
      }))
      .filter((c) => c.name);

    const skills = normalizeArray(body.skills)
      .map((s) => {
        const rawUrl = (s?.certificateUrl || "").trim();
        const hasUrl = !!rawUrl;
        const looksLikeUrl = hasUrl
          ? rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
          : false;

        return {
          name: (s?.name || "").trim(),
          level: s?.level ? s.level.trim() : "",
          certificateUrl: hasUrl ? rawUrl : null,
          isCertificateValid: looksLikeUrl,
        };
      })
      .filter((s) => s.name);

    const languages = normalizeArray(body.languages)
      .map((l) => ({
        name: (l?.name || "").trim(),
        level: l?.level ? l.level.trim() : "",
      }))
      .filter((l) => l.name);

    const experiences = normalizeArray(body.experiences)
      .map((ex) => ({
        title: (ex?.title || "").trim(),
        company: ex?.company ? ex.company.trim() : "",
        period: ex?.period ? ex.period.trim() : "",
        supervisorName: ex?.supervisorName ? ex.supervisorName.trim() : null,
        supervisorEmail: ex?.supervisorEmail ? ex.supervisorEmail.trim() : null,
      }))
      .filter((ex) => ex.title);

    // 2) write user + profile in a transaction
    await prisma.$transaction(async (tx) => {
      // update basic stuff on User
      await tx.user.update({
        where: { id: userId },
        data: {
          firstName: firstNameNorm,
          lastName: lastNameNorm,
          name:
            [firstNameNorm, lastNameNorm].filter(Boolean).join(" ") || null,
          studentNumber: normalize(body.studentNumber),
          establishment: normalize(body.establishment),
          diploma: normalize(body.diploma),
        },
      });

      // upsert Profile + its children
      const profileUpdate = await tx.profile.upsert({
        where: { userId },
        create: {
          userId,
          phone: normalize(body.phone),
          city: normalize(body.city),
          linkedin: normalize(body.linkedin),
          presentation: normalize(body.presentation),
          expectedGraduation: normalize(body.expectedGraduation),
          classProjects: normalize(body.classProjects),
          isComplete: true,
          isAvailableForWork:
            typeof body.isAvailableForWork === "boolean"
              ? body.isAvailableForWork
              : true,
          courses: {
            create: courses,
          },
          skills: {
            create: skills,
          },
          languages: {
            create: languages,
          },
          experiences: {
            create: experiences,
          },
        },
        update: {
          phone: normalize(body.phone),
          city: normalize(body.city),
          linkedin: normalize(body.linkedin),
          presentation: normalize(body.presentation),
          expectedGraduation: normalize(body.expectedGraduation),
          classProjects: normalize(body.classProjects),
          isComplete: true,
          isAvailableForWork:
            typeof body.isAvailableForWork === "boolean"
              ? body.isAvailableForWork
              : true,
          // blow away old children + recreate from current form state
          courses: {
            deleteMany: {},
            create: courses,
          },
          skills: {
            deleteMany: {},
            create: skills,
          },
          languages: {
            deleteMany: {},
            create: languages,
          },
          experiences: {
            deleteMany: {},
            create: experiences,
          },
        },
      });

      // Automatically approve the user if the profile is complete and not rejected
      if (profileUpdate.isComplete && !profileUpdate.isRejected) {
        await tx.user.update({
          where: { id: userId },
          data: {
            isApproved: true,
            isRejected: false,
          },
        });
      }
    });

    // 3) refetch to return fresh data in the same shape as GET
    const updated = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
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
            phone: true,
            city: true,
            linkedin: true,
            presentation: true,
            expectedGraduation: true,
            classProjects: true,
            isComplete: true,
            isAvailableForWork: true,
            courses: { select: { id: true, name: true, note: true } },
            skills: {
              select: {
                id: true,
                name: true,
                level: true,
                certificateUrl: true,
                isCertificateValid: true,
              },
            },
            languages: { select: { id: true, name: true, level: true } },
            experiences: {
              select: {
                id: true,
                title: true,
                company: true,
                period: true,
                supervisorName: true,
                supervisorEmail: true,
              },
            },
          },
        },
      },
    });

    const profile = updated.profile;

    const data = {
      id: updated.id,
      firstName: updated.firstName || "",
      lastName: updated.lastName || "",
      email: updated.email,
      role: updated.role,
      studentNumber: updated.studentNumber || "",
      establishment: updated.establishment || "",
      diploma: updated.diploma || "",
      phone: profile?.phone || "",
      city: profile?.city || "",
      linkedin: profile?.linkedin || "",
      presentation: profile?.presentation || "",
      expectedGraduation: profile?.expectedGraduation || "",
      classProjects: profile?.classProjects || "",
      courses: (profile?.courses || []).map((c) => ({
        id: c.id,
        name: c.name,
        note: c.note || "",
      })),
      skills: (profile?.skills || []).map((s) => ({
        id: s.id,
        name: s.name,
        level: s.level || "",
        certificateUrl: s.certificateUrl || "",
        isCertificateValid: s.isCertificateValid ?? false,
      })),
      languages: (profile?.languages || []).map((l) => ({
        id: l.id,
        name: l.name,
        level: l.level || "",
      })),
      experiences: (profile?.experiences || []).map((ex) => ({
        id: ex.id,
        title: ex.title,
        company: ex.company || "",
        period: ex.period || "",
        supervisorName: ex.supervisorName || "",
        supervisorEmail: ex.supervisorEmail || "",
      })),
      isProfileComplete: profile?.isComplete ?? false,
      isAvailableForWork: profile?.isAvailableForWork ?? true,
      isApproved: updated.isApproved,
      isRejected: updated.isRejected,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully",
        data,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("PROFILE_UPDATE_ERROR", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Internal server error",
        data: null,
      },
      { status: 500 }
    );
  }
}
