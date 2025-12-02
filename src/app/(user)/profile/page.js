"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UserRound,
  GraduationCap,
  Code2,
  Languages,
  BriefcaseBusiness,
  Plus,
} from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// Keep these in sync with your sign-up page options
const ESTABLISHMENT_OPTIONS = [
  { value: "EST Casablanca", label: "EST Casablanca" },
  { value: "EST Fès", label: "EST Fès" },
  { value: "EST Safi", label: "EST Safi" },
  { value: "EST Oujda", label: "EST Oujda" },
  { value: "OTHER", label: "Other establishment" },
];

const DIPLOMA_OPTIONS = [
  { value: "BTS", label: "BTS" },
  { value: "DUT", label: "DUT" },
  { value: "Licence Pro", label: "Licence professionnelle" },
  { value: "Master", label: "Master" },
  { value: "Ingenieur", label: "Ingénieur" },
  { value: "OTHER", label: "Other" },
];

export default function ProfilePage() {
  const [saving, setSaving] = useState(false);

  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({ name: "", note: "" });

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState({ name: "", level: "" });

  const [languages, setLanguages] = useState([]);
  const [newLanguage, setNewLanguage] = useState({ name: "", level: "" });

  const [experiences, setExperiences] = useState([]);
  const [newExperience, setNewExperience] = useState({
    title: "",
    company: "",
    period: "",
    supervisorName: "",
    supervisorEmail: "",
  });

  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    studentNumber: "",
    establishment: "",
    diploma: "",
    phone: "",
    city: "",
    linkedin: "",
    presentation: "",
    expectedGraduation: "",
    classProjects: "",
    isAvailableForWork: true,
  });

  const [errors, setErrors] = useState({}); // { fieldName: "msg" }

  const router = useRouter();

  function handleFieldChange(field, value) {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  // load existing profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) return;

        const json = await res.json();
        if (!json.success || !json.data) return;

        const d = json.data;
        setFormValues({
          firstName: d.firstName || "",
          lastName: d.lastName || "",
          studentNumber: d.studentNumber || "",
          establishment: d.establishment || "",
          diploma: d.diploma || "",
          phone: d.phone || "",
          city: d.city || "",
          linkedin: d.linkedin || "",
          presentation: d.presentation || "",
          expectedGraduation: d.expectedGraduation || "",
          classProjects: d.classProjects || "",
          isAvailableForWork:
            typeof d.isAvailableForWork === "boolean"
              ? d.isAvailableForWork
              : true,
        });

        setCourses(Array.isArray(d.courses) ? d.courses : []);
        setSkills(Array.isArray(d.skills) ? d.skills : []);
        setLanguages(Array.isArray(d.languages) ? d.languages : []);
        setExperiences(Array.isArray(d.experiences) ? d.experiences : []);
      } catch (err) {
        console.error("PROFILE_FETCH_ERROR", err);
      }
    }

    fetchProfile();
  }, []);

  function addCourse() {
    if (!newCourse.name.trim()) return;
    setCourses((prev) => [...prev, newCourse]);
    setNewCourse({ name: "", note: "" });
  }

  function removeCourse(index) {
    setCourses((prev) => prev.filter((_, i) => i !== index));
  }

  function addSkill() {
    if (!newSkill.name.trim()) return;
    setSkills((prev) => [...prev, newSkill]);
    setNewSkill({ name: "", level: "", certificateUrl: "" });
  }

  function removeSkill(index) {
    setSkills((prev) => prev.filter((_, i) => i !== index));
  }

  function addLanguage() {
    if (!newLanguage.name.trim()) return;
    setLanguages((prev) => [...prev, newLanguage]);
    setNewLanguage({ name: "", level: "" });
  }

  function removeLanguage(index) {
    setLanguages((prev) => prev.filter((_, i) => i !== index));
  }

  function addExperience() {
    if (!newExperience.title.trim()) return;
    setExperiences((prev) => [...prev, newExperience]);
    setNewExperience({
      title: "",
      company: "",
      period: "",
      supervisorName: "",
      supervisorEmail: "",
    });
  }

  function removeExperience(index) {
    setExperiences((prev) => prev.filter((_, i) => i !== index));
  }

  function validateClient(values) {
    const e = {};
    const firstName = (values.firstName || "").trim();
    const lastName = (values.lastName || "").trim();
    const studentNumber = (values.studentNumber || "").trim();
    const establishment = (values.establishment || "").trim();
    const diploma = (values.diploma || "").trim();
    const phone = (values.phone || "").trim();
    const city = (values.city || "").trim();
    const presentation = (values.presentation || "").trim();

    if (!firstName) e.firstName = "First name is required";
    if (!lastName) e.lastName = "Last name is required";
    if (!studentNumber) e.studentNumber = "Student number is required";
    if (!establishment) e.establishment = "Establishment is required";
    if (!diploma) e.diploma = "Diploma is required";

    if (!phone) {
      e.phone = "Phone is required";
    } else if (phone.length < 6) {
      e.phone = "Phone number looks too short";
    }

    if (!city) {
      e.city = "City is required";
    }

    if (!presentation) {
      e.presentation = "Presentation is required";
    } else if (presentation.length < 30) {
      e.presentation = "Presentation should be at least 30 characters";
    }

    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      const clientErrors = validateClient(formValues);
      if (Object.keys(clientErrors).length > 0) {
        setErrors(clientErrors);
        setSaving(false);
        toast.error("Please fix the highlighted errors.");
        return;
      }

      const payload = {
        firstName: formValues.firstName || null,
        lastName: formValues.lastName || null,
        studentNumber: formValues.studentNumber || null,
        establishment: formValues.establishment || null,
        diploma: formValues.diploma || null,
        phone: formValues.phone || null,
        city: formValues.city || null,
        linkedin: formValues.linkedin || null,
        presentation: formValues.presentation || null,
        expectedGraduation: formValues.expectedGraduation || null,
        classProjects: formValues.classProjects || null,
        isAvailableForWork: formValues.isAvailableForWork,
        courses,
        skills,
        languages,
        experiences,
      };

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        if (json.errors && typeof json.errors === "object") {
          setErrors(json.errors);
        }
        toast.error(json.message || "Failed to save profile");
        return;
      }

      toast.success("Profile saved successfully");
      router.push("/");
    } catch (err) {
      console.error("PROFILE_SAVE_ERROR", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.14)_0,_transparent_55%)] flex justify-center px-4 py-8">
      <form onSubmit={handleSubmit} className="w-full max-w-8xl space-y-6">
        {/* Page heading */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit Profile
          </h1>
          <p className="text-sm text-muted-foreground">
            Complete your profile to be visible to businesses.
          </p>
        </div>

        {/* Personal information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserRound className="h-4 w-4 text-sky-600" />
              Personal information
            </CardTitle>
            <CardDescription>
              <div className="mt-2 rounded-md border border-foreground/10 p-4">
                <p className="mb-1 font-medium">Tips:</p>
                <ul className="list-inside list-disc space-y-1">
                  <li>Use a professional photo.</li>
                  <li>
                    Write a concise bio that outlines your skills and goals.
                  </li>
                  <li>Include your LinkedIn profile if available.</li>
                </ul>
              </div>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* First / Last name */}
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={formValues.firstName}
                  onChange={(e) =>
                    handleFieldChange("firstName", e.target.value)
                  }
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={formValues.lastName}
                  onChange={(e) =>
                    handleFieldChange("lastName", e.target.value)
                  }
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">
                    {errors.lastName}
                  </p>
                )}
              </div>

              {/* Student number */}
              <div className="space-y-2">
                <Label htmlFor="studentNumber">Student Number *</Label>
                <Input
                  id="studentNumber"
                  placeholder="e.g., 12345"
                  value={formValues.studentNumber}
                  onChange={(e) =>
                    handleFieldChange("studentNumber", e.target.value)
                  }
                  className={errors.studentNumber ? "border-red-500" : ""}
                />
                {errors.studentNumber && (
                  <p className="text-sm text-red-500">
                    {errors.studentNumber}
                  </p>
                )}
              </div>

              {/* Establishment (Select) */}
              <div className="space-y-2 ">
                <Label htmlFor="establishment">Establishment *</Label>
                <Select
                  value={formValues.establishment || undefined}
                  onValueChange={(val) =>
                    handleFieldChange("establishment", val)
                  }
                >
                  <SelectTrigger
                    className={errors.establishment ? "border-red-500 w-full" : "w-full"}
                  >
                    <SelectValue placeholder="Select establishment" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTABLISHMENT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.establishment && (
                  <p className="text-sm text-red-500">
                    {errors.establishment}
                  </p>
                )}
              </div>

              {/* Diploma (Select) */}
              <div className="space-y-2">
                <Label htmlFor="diploma">Diploma *</Label>
                <Select
                  value={formValues.diploma || undefined}
                  onValueChange={(val) =>
                    handleFieldChange("diploma", val)
                  }
                >
                  <SelectTrigger
                    className={errors.diploma ? "border-red-500 w-full" : "w-full"}
                  >
                    <SelectValue placeholder="Select diploma" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIPLOMA_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.diploma && (
                  <p className="text-sm text-red-500">
                    {errors.diploma}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  placeholder="+212 6..."
                  value={formValues.phone}
                  onChange={(e) =>
                    handleFieldChange("phone", e.target.value)
                  }
                  className={errors.phone ? "border-red-500 w-full" : "w-full"}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone}</p>
                )}
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="e.g., Casablanca"
                  value={formValues.city}
                  onChange={(e) =>
                    handleFieldChange("city", e.target.value)
                  }
                  className={errors.city ? "border-red-500 w-full" : "w-full"}
                />
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city}</p>
                )}
              </div>

              {/* LinkedIn */}
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn Profile</Label>
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/in/your-profile"
                  value={formValues.linkedin}
                  onChange={(e) =>
                    handleFieldChange("linkedin", e.target.value)
                  }
                />
              </div>

              {/* Expected graduation */}
              <div className="space-y-2">
                <Label htmlFor="expectedGraduation">
                  Expected Graduation
                </Label>
                <Input
                  id="expectedGraduation"
                  placeholder="e.g., 2025"
                  value={formValues.expectedGraduation}
                  onChange={(e) =>
                    handleFieldChange("expectedGraduation", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="isAvailableForWork">Availability</Label>
              <div className="flex items-center gap-3 text-sm">
                <button
                  type="button"
                  id="isAvailableForWork"
                  onClick={() =>
                    handleFieldChange(
                      "isAvailableForWork",
                      !formValues.isAvailableForWork
                    )
                  }
                  className="inline-flex h-9 items-center rounded-md border bg-background px-3 text-xs font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {formValues.isAvailableForWork
                    ? "Available for work"
                    : "Not available for work"}
                </button>
                <p className="text-xs text-muted-foreground">
                  Toggle this off if you are currently not looking for an
                  internship or job.
                </p>
              </div>
            </div>

            {/* Presentation */}
            <div className="space-y-2">
              <Label htmlFor="presentation">Presentation *</Label>
              <Textarea
                id="presentation"
                placeholder="Tell us about yourself..."
                value={formValues.presentation}
                onChange={(e) =>
                  handleFieldChange("presentation", e.target.value)
                }
                className={errors.presentation ? "border-red-500 w-full" : "w-full"}
                rows={4}
              />
              {errors.presentation && (
                <p className="text-sm text-red-500">
                  {errors.presentation}
                </p>
              )}
            </div>

            {/* Class projects */}
            <div className="space-y-2">
              <Label htmlFor="classProjects">Class Projects</Label>
              <Textarea
                id="classProjects"
                placeholder="Describe your class projects..."
                value={formValues.classProjects}
                onChange={(e) =>
                  handleFieldChange("classProjects", e.target.value)
                }
                rows={3}
              />
            </div>

            {/* Photo (client-only for now) */}
            <div className="space-y-2">
              <Label htmlFor="photo">Profile picture</Label>
              <Input id="photo" name="photo" type="file" />
              <p className="text-[11px] text-muted-foreground">
                You can keep this only on client for now, or handle upload
                later.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Courses */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Code2 className="h-4 w-4 text-sky-600" />
              Courses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {courses.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {courses.map((course, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <span className="font-medium">{course.name}</span>
                    {course.note && (
                      <span className="text-xs text-muted-foreground">
                        ({course.note})
                      </span>
                    )}
                    <button
                      type="button"
                      className="ml-1 text-xs"
                      onClick={() => removeCourse(idx)}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr,2fr,auto]">
              <Input
                placeholder="Course name (e.g. Web Development)"
                value={newCourse.name}
                onChange={(e) =>
                  setNewCourse((c) => ({ ...c, name: e.target.value }))
                }
                className="w-full"
              />
              <Input
                placeholder="Note / detail (optional)"
                value={newCourse.note}
                onChange={(e) =>
                  setNewCourse((c) => ({ ...c, note: e.target.value }))
                }
                className="w-full"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addCourse}
                className="whitespace-nowrap"
              >
                <Plus className="mr-2 h-4 w-4" />
                <span>Add course</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="h-4 w-4 text-sky-600" />
              Training
            </CardTitle>
            <CardDescription>
              <div className="mt-2 rounded-md border border-foreground/10 p-4">
                <p className="mb-1 font-medium">Tips:</p>
                <ul className="list-inside list-disc space-y-1">
                  <li>List your mastered programming languages.</li>
                  <li>Mention frameworks and tools you know.</li>
                  <li>Include your database / networking skills.</li>
                </ul>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {skills.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <span className="font-medium">{skill.name}</span>
                    {skill.level && (
                      <span className="text-xs text-muted-foreground">
                        ({skill.level})
                      </span>
                    )}
                    {skill.certificateUrl && (
                      <span className="text-[11px] text-muted-foreground underline underline-offset-2">
                        Cert
                      </span>
                    )}
                    <button
                      type="button"
                      className="ml-1 text-xs"
                      onClick={() => removeSkill(idx)}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr,1fr,2fr,auto]">
              <Input
                placeholder="Technical skill (e.g. React, Node.js)"
                value={newSkill.name}
                onChange={(e) =>
                  setNewSkill((s) => ({ ...s, name: e.target.value }))
                }
              />
              <Input
                placeholder="Level (e.g. beginner, intermediate, expert)"
                value={newSkill.level}
                onChange={(e) =>
                  setNewSkill((s) => ({ ...s, level: e.target.value }))
                }
              />
              <Input
                placeholder="Certificate URL (optional)"
                value={newSkill.certificateUrl || ""}
                onChange={(e) =>
                  setNewSkill((s) => ({
                    ...s,
                    certificateUrl: e.target.value,
                  }))
                }
              />
              <Button
                type="button"
                variant="outline"
                onClick={addSkill}
                className="whitespace-nowrap"
              >
                <Plus className="mr-2 h-4 w-4" />
                <span>Add a skill</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Languages */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Languages className="h-4 w-4 text-sky-600" />
              Languages
            </CardTitle>
            <CardDescription>
              <div className="mt-2 rounded-md border border-foreground/10 p-4">
                <p className="mb-1 font-medium">Tips:</p>
                <ul className="list-inside list-disc space-y-1">
                  <li>
                    Indicate your level according to the European framework
                    (A1, A2, B1, B2, C1, C2).
                  </li>
                  <li>Be honest about your language skills.</li>
                </ul>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {languages.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {languages.map((lang, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <span className="font-medium">{lang.name}</span>
                    {lang.level && (
                      <span className="text-xs text-muted-foreground">
                        ({lang.level})
                      </span>
                    )}
                    <button
                      type="button"
                      className="ml-1 text-xs"
                      onClick={() => removeLanguage(idx)}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr,1fr,auto]">
              <Input
                placeholder="Language (e.g. English)"
                value={newLanguage.name}
                onChange={(e) =>
                  setNewLanguage((l) => ({ ...l, name: e.target.value }))
                }
              />
              <Input
                placeholder="Level (e.g. B2, C1)"
                value={newLanguage.level}
                onChange={(e) =>
                  setNewLanguage((l) => ({ ...l, level: e.target.value }))
                }
              />
              <Button
                type="button"
                variant="outline"
                onClick={addLanguage}
                className="whitespace-nowrap"
              >
                <Plus className="mr-2 h-4 w-4" />
                <span>Add a language</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Professional experiences */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BriefcaseBusiness className="h-4 w-4 text-sky-600" />
              Professional experiences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {experiences.length > 0 && (
              <div className="mb-2 space-y-2">
                {experiences.map((exp, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between gap-4 rounded-md border bg-muted/40 px-3 py-2 text-xs"
                  >
                    <div>
                      <div className="font-medium">
                        {exp.title} {exp.company && `@ ${exp.company}`}
                      </div>
                      {exp.period && (
                        <div className="text-muted-foreground">
                          {exp.period}
                        </div>
                      )}
                      {(exp.supervisorName || exp.supervisorEmail) && (
                        <div className="mt-0.5 text-[11px] text-muted-foreground">
                          {exp.supervisorName && <span>{exp.supervisorName}</span>}
                          {exp.supervisorName && exp.supervisorEmail && (
                            <span>  b7 </span>
                          )}
                          {exp.supervisorEmail && <span>{exp.supervisorEmail}</span>}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      className="text-xs text-muted-foreground"
                      onClick={() => removeExperience(idx)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Job title</Label>
                <Input
                  placeholder="Intern, Web Developer"
                  value={newExperience.title}
                  onChange={(e) =>
                    setNewExperience((ex) => ({
                      ...ex,
                      title: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Company</Label>
                <Input
                  placeholder="Company name"
                  value={newExperience.company}
                  onChange={(e) =>
                    setNewExperience((ex) => ({
                      ...ex,
                      company: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Period</Label>
              <Input
                placeholder="e.g. Jun 2024 – Aug 2024"
                value={newExperience.period}
                onChange={(e) =>
                  setNewExperience((ex) => ({
                    ...ex,
                    period: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label>Supervisor name</Label>
              <Input
                placeholder="Internship supervisor name"
                value={newExperience.supervisorName}
                onChange={(e) =>
                  setNewExperience((ex) => ({
                    ...ex,
                    supervisorName: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label>Supervisor email</Label>
              <Input
                placeholder="Supervisor email"
                type="email"
                value={newExperience.supervisorEmail}
                onChange={(e) =>
                  setNewExperience((ex) => ({
                    ...ex,
                    supervisorEmail: e.target.value,
                  }))
                }
              />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={addExperience}
              className="mt-1 w-fit"
            >
              <Plus className="mr-2 h-4 w-4" />
              <span>Add an experience</span>
            </Button>
          </CardContent>
        </Card>

        {/* Save button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}
