"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
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

export function StudentProfileDialog({ open, onOpenChange, studentId }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !studentId) return;

    let cancelled = false;

    async function fetchStudent() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/students/${studentId}`);
        const json = await res.json();

        if (!res.ok || !json.success) {
          if (!cancelled) {
            toast.error(json.message || "Failed to load student profile");
          }
          return;
        }

        if (!cancelled) {
          setStudent(json.data);
        }
      } catch (err) {
        console.error("ADMIN_FETCH_STUDENT_PROFILE_ERROR", err);
        if (!cancelled) {
          toast.error("Something went wrong while loading student profile");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchStudent();

    return () => {
      cancelled = true;
    };
  }, [open, studentId]);

  const status = student ? getStudentStatus(student) : null;
  const profile = student?.profile;

  const courses = profile?.courses || [];
  const skills = profile?.skills || [];
  const languages = profile?.languages || [];
  const experiences = profile?.experiences || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-3xl p-0">
        {/* Accessible dialog title for screen readers */}
        <DialogHeader className="sr-only">
          <DialogTitle>Student Profile</DialogTitle>
        </DialogHeader>
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b px-6 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">Student Profile</CardTitle>
                  {status && <StatusBadge status={status} />}
                </div>
                <CardDescription>
                  View full profile information submitted by this student.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <ScrollArea className="max-h-[70vh]">
            <CardContent className="space-y-6 px-6 py-5">
            {/* Loading & not found */}
            {loading && (
              <div className="py-10 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p className="text-sm">Loading student profile...</p>
              </div>
            )}

            {!loading && !student && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Student not found.
              </p>
            )}

            {!loading && student && (
              <>
                {/* Basic Information */}
                <section className="space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold">
                      {student.firstName} {student.lastName}
                    </h2>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>

                  <Separator />

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

                  {profile?.isAvailableForWork !== undefined && (
                    <div className="pt-1.5">
                      <Badge variant={profile.isAvailableForWork ? "default" : "secondary"}>
                        {profile.isAvailableForWork ? "Available for work" : "Not available"}
                      </Badge>
                    </div>
                  )}
                </section>

                {/* Presentation */}
                {profile?.presentation && (
                  <section className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-sm font-semibold">Presentation</h3>
                    </div>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      {profile.presentation}
                    </p>
                  </section>
                )}

                {/* Class projects */}
                {profile?.classProjects && (
                  <section className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Code2 className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-sm font-semibold">Class Projects</h3>
                    </div>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      {profile.classProjects}
                    </p>
                  </section>
                )}

                {/* Skills */}
                {skills.length > 0 && (
                  <section className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Code2 className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-sm font-semibold">Skills</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <Badge key={skill.id} variant="outline" className="gap-1.5">
                          <span>{skill.name}</span>
                          {skill.level && (
                            <span className="text-muted-foreground">• {skill.level}</span>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </section>
                )}

                {/* Courses */}
                {courses.length > 0 && (
                  <section className="space-y-2">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-sm font-semibold">Courses</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {courses.map((course) => (
                        <Badge key={course.id} variant="secondary" className="gap-1.5">
                          <span>{course.name}</span>
                          {course.note && (
                            <span className="text-muted-foreground">• {course.note}</span>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </section>
                )}

                {/* Languages */}
                {languages.length > 0 && (
                  <section className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-sm font-semibold">Languages</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {languages.map((lang) => (
                        <Badge key={lang.id} variant="outline" className="gap-1.5">
                          <span>{lang.name}</span>
                          {lang.level && (
                            <span className="text-muted-foreground">• {lang.level}</span>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </section>
                )}

                {/* Experiences */}
                {experiences.length > 0 && (
                  <section className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-sm font-semibold">Professional Experiences</h3>
                    </div>
                    <div className="space-y-3">
                      {experiences.map((exp) => (
                        <div
                          key={exp.id}
                          className="rounded-lg border bg-card p-3 text-sm"
                        >
                          <p className="font-medium">
                            {exp.title}
                            {exp.company && (
                              <span className="text-muted-foreground"> @ {exp.company}</span>
                            )}
                          </p>
                          {exp.period && (
                            <p className="text-xs text-muted-foreground">{exp.period}</p>
                          )}
                          {(exp.supervisorName || exp.supervisorEmail) && (
                            <p className="text-xs text-muted-foreground">
                              Supervisor: {exp.supervisorName}
                              {exp.supervisorEmail && ` (${exp.supervisorEmail})`}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </CardContent>
          </ScrollArea>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
