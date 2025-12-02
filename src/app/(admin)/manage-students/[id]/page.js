"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  User,
  GraduationCap,
  Phone,
  MapPin,
  Linkedin,
  Calendar,
  Code2,
  Languages,
  Briefcase,
  FileText,
  Loader2,
} from "lucide-react";

import { ThemeToggle } from "../../../../components/theme-toggle";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Separator } from "../../../../components/ui/separator";

function getStudentStatus(student) {
  const profile = student?.profile;
  if (profile?.isProfileApproved) return "approved";
  if (profile?.isProfileRejected) return "rejected";
  return "pending";
}

function StatusBadge({ status }) {
  const variants = {
    approved: "bg-accent text-accent-foreground",
    rejected: "bg-destructive/10 text-destructive",
    pending: "bg-muted text-muted-foreground",
  };

  const labels = {
    approved: "Approved",
    rejected: "Rejected",
    pending: "Pending approval",
  };

  return (
    <Badge variant="outline" className={`${variants[status]} border-0`}>
      {labels[status]}
    </Badge>
  );
}

function InfoRow({ icon: Icon, label, value, isLink = false }) {
  if (!value) return null;

  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="space-y-0.5">
        <p className="text-xs text-muted-foreground">{label}</p>
        {isLink ? (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-primary underline-offset-2 hover:underline"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm font-medium">{value}</p>
        )}
      </div>
    </div>
  );
}

export default function AdminStudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchStudent() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/students/${id}`);
        const json = await res.json();

        if (!res.ok || !json.success) {
          toast.error(json.message || "Failed to load student profile");
          return;
        }

        setStudent(json.data);
      } catch (err) {
        console.error("ADMIN_FETCH_STUDENT_PROFILE_ERROR", err);
        toast.error("Something went wrong while loading student profile");
      } finally {
        setLoading(false);
      }
    }

    fetchStudent();
  }, [id]);

  const status = student ? getStudentStatus(student) : null;
  const profile = student?.profile;

  const courses = profile?.courses || [];
  const skills = profile?.skills || [];
  const languages = profile?.languages || [];
  const experiences = profile?.experiences || [];

  return (
    <div className="min-h-screen bg-background">
      <main className="flex min-h-screen flex-col">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 md:px-8">
          {/* Header */}
          <header className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => router.push("/manage-students")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to students
              </Button>

              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    Student Profile
                  </h1>
                  {status && <StatusBadge status={status} />}
                </div>
                <p className="text-sm text-muted-foreground">
                  View full profile information submitted by this student.
                </p>
              </div>
            </div>

            <ThemeToggle />
          </header>

          {/* Loading state */}
          {loading && (
            <Card>
              <CardContent className="py-10 flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading student profile...</p>
              </CardContent>
            </Card>
          )}

          {/* Not found state */}
          {!loading && !student && (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-sm text-muted-foreground">Student not found.</p>
              </CardContent>
            </Card>
          )}

          {/* Profile content */}
          {!loading && student && (
            <>
              {/* Basic Information Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base">Basic Information</CardTitle>
                  </div>
                  <CardDescription>
                    Identity and contact details of the student.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Name and email */}
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold">
                      {student.firstName} {student.lastName}
                    </h2>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>

                  <Separator />

                  {/* Info grid */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InfoRow
                      icon={GraduationCap}
                      label="Student Number"
                      value={student.studentNumber}
                    />
                    <InfoRow
                      icon={GraduationCap}
                      label="School"
                      value={student.establishment}
                    />
                    <InfoRow
                      icon={GraduationCap}
                      label="Diploma"
                      value={student.diploma}
                    />
                    <InfoRow
                      icon={Calendar}
                      label="Expected Graduation"
                      value={profile?.expectedGraduation}
                    />
                    <InfoRow
                      icon={Phone}
                      label="Phone"
                      value={profile?.phone}
                    />
                    <InfoRow
                      icon={MapPin}
                      label="City"
                      value={profile?.city}
                    />
                    <InfoRow
                      icon={Linkedin}
                      label="LinkedIn"
                      value={profile?.linkedin}
                      isLink
                    />
                  </div>

                  {/* Availability badge */}
                  {profile?.isAvailableForWork !== undefined && (
                    <div className="pt-2">
                      <Badge variant={profile.isAvailableForWork ? "default" : "secondary"}>
                        {profile.isAvailableForWork ? "Available for work" : "Not available"}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Presentation Card */}
              {profile?.presentation && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-base">Presentation</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      {profile.presentation}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Class Projects Card */}
              {profile?.classProjects && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Code2 className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-base">Class Projects</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      {profile.classProjects}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Skills Card */}
              {skills.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Code2 className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-base">Skills</CardTitle>
                    </div>
                    <CardDescription>Technical skills and competencies.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="gap-1.5">
                          <span>{skill.name}</span>
                          {skill.level && (
                            <span className="text-muted-foreground">• {skill.level}</span>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Courses Card */}
              {courses.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-base">Courses</CardTitle>
                    </div>
                    <CardDescription>Relevant courses completed.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {courses.map((course, idx) => (
                        <Badge key={idx} variant="secondary" className="gap-1.5">
                          <span>{course.name}</span>
                          {course.note && (
                            <span className="text-muted-foreground">• {course.note}</span>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Languages Card */}
              {languages.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-base">Languages</CardTitle>
                    </div>
                    <CardDescription>Spoken languages and proficiency levels.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {languages.map((lang, idx) => (
                        <Badge key={idx} variant="outline" className="gap-1.5">
                          <span>{lang.name}</span>
                          {lang.level && (
                            <span className="text-muted-foreground">• {lang.level}</span>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Experiences Card */}
              {experiences.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-base">Professional Experiences</CardTitle>
                    </div>
                    <CardDescription>Work and internship history.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {experiences.map((exp, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border bg-card p-4 shadow-sm"
                      >
                        <div className="space-y-1">
                          <p className="font-medium">
                            {exp.title}
                            {exp.company && (
                              <span className="text-muted-foreground"> @ {exp.company}</span>
                            )}
                          </p>
                          {exp.period && (
                            <p className="text-sm text-muted-foreground">{exp.period}</p>
                          )}
                          {(exp.supervisorName || exp.supervisorEmail) && (
                            <p className="text-xs text-muted-foreground">
                              Supervisor: {exp.supervisorName}
                              {exp.supervisorEmail && ` (${exp.supervisorEmail})`}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
