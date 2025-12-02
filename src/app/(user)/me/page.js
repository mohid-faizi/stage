"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Loader2,
  Mail,
  GraduationCap,
  MapPin,
  Phone,
  Linkedin,
  Pencil,
  BadgeCheck,
  Clock,
  XCircle,
  Briefcase,
  Hash,
} from "lucide-react";

export default function MyProfileOverviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/profile/summary", { cache: "no-store" });
        const json = await res.json();

        if (!res.ok || !json.success) {
          if (!cancelled) {
            toast.error(json.message || "Failed to load profile");
          }
          return;
        }

        if (!cancelled) {
          setProfile(json.data);
        }
      } catch (err) {
        console.error("MY_PROFILE_OVERVIEW_ERROR", err);
        if (!cancelled) {
          toast.error("Something went wrong while loading your profile.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const displayName = profile?.name || profile?.email || "";
  const avatarLetter = displayName.charAt(0)?.toUpperCase() || "?";

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!profile) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Unable to load profile</CardTitle>
            <CardDescription>
              Something went wrong. Please try again later.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button variant="outline" onClick={() => router.refresh()}>
              Retry
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">My Profile</h1>
            <p className="text-sm text-muted-foreground">
              Overview of your account and contact information.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => router.push("/profile")}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>

        {/* Top profile card */}
        <Card className="mb-6">
          <CardContent className="flex gap-4 px-4 py-2 sm:gap-6">
            {/* Avatar */}
            <Avatar className="h-16 w-16 border border-border">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
                {avatarLetter}
              </AvatarFallback>
            </Avatar>

            {/* Name, email, badges */}
            <div className="flex-1 space-y-1">
              <h2 className="text-lg font-semibold leading-tight">
                {displayName || "User"}
              </h2>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {profile.email}
              </p>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {profile.isProfileComplete ? (
                  <Badge className="gap-1 text-xs bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                    <BadgeCheck className="h-3 w-3" />
                    Complete
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Clock className="h-3 w-3" />
                    Incomplete
                  </Badge>
                )}
                {profile.isApproved && !profile.isRejected && (
                  <Badge className="gap-1 text-xs bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                    <BadgeCheck className="h-3 w-3" />
                    Approved
                  </Badge>
                )}
                {profile.isRejected && (
                  <Badge variant="destructive" className="gap-1 text-xs">
                    <XCircle className="h-3 w-3" />
                    Rejected
                  </Badge>
                )}
                {profile.isAvailableForWork && (
                  <Badge className="gap-1 text-xs bg-sky-500/15 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300">
                    <Briefcase className="h-3 w-3" />
                    Available for work
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Details</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Separator />

            {/* Student number */}
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Hash className="h-4 w-4" />
                <span>Student Number</span>
              </div>
              <span className="text-sm font-medium">
                {profile.studentNumber || "—"}
              </span>
            </div>

            <Separator />

            {/* Diploma */}
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <GraduationCap className="h-4 w-4" />
                <span>Diploma</span>
              </div>
              <span className="text-sm font-medium">
                {profile.diploma || "—"}
              </span>
            </div>

            <Separator />

            {/* Establishment */}
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <GraduationCap className="h-4 w-4" />
                <span>Establishment</span>
              </div>
              <span className="text-sm font-medium">
                {profile.establishment || "—"}
              </span>
            </div>

            <Separator />

            {/* City */}
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>City</span>
              </div>
              <span className="text-sm font-medium">
                {profile.city || "—"}
              </span>
            </div>

            <Separator />

            {/* Phone */}
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>Phone</span>
              </div>
              <span className="text-sm font-medium">
                {profile.phone || "—"}
              </span>
            </div>

            <Separator />

            {/* LinkedIn */}
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Linkedin className="h-4 w-4" />
                <span>LinkedIn</span>
              </div>
              <span className="text-sm font-medium max-w-xs truncate text-right">
                {profile.linkedin || "—"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
