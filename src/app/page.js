"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import {
  Search,
  MapPin,
  GraduationCap,
  Users,
  MoreHorizontal,
  ExternalLink,
  Loader2,
} from "lucide-react";
import Sidebar from "@/components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import LanguageSwitcher from "@/components/language-switcher";
import { StudentProfileDialog } from "@/components/admin/student-profile-dialog";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const CITY_OPTIONS = [
  { value: "all", label: "All cities" },
  { value: "Casablanca", label: "Casablanca" },
  { value: "Fès", label: "Fès" },
  { value: "Marrakech", label: "Marrakech" },
  { value: "Rabat", label: "Rabat" },
];

const DIPLOMA_OPTIONS = [
  { value: "all", label: "All diplomas" },
  { value: "DUT", label: "DUT" },
  { value: "Licence professionnelle", label: "Licence professionnelle" },
  { value: "Master", label: "Master" },
  { value: "Engineering", label: "Engineering" },
  { value: "Other", label: "Other" },
];

export default function HomePage() {
  const router = useRouter();
  const { user: currentUser, loading: authLoading } = useCurrentUser();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("all");
  const [diploma, setDiploma] = useState("all");

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  });

  const [activeLang, setActiveLang] = useState("fr");
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  function openStudentProfile(studentId) {
    if (authLoading) return;

    if (!currentUser) {
      setShowLoginPrompt(true);
      return;
    }

    setSelectedStudentId(studentId);
    setShowProfile(true);
  }

  // Google Translate
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.google && window.google.translate) return;

    window.googleTranslateElementInit = () => {
      // eslint-disable-next-line no-undef
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "fr",
          includedLanguages: "fr,en,ar",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    const script = document.createElement("script");
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
  // This will run whenever pagination.currentPage changes
  if (pagination.currentPage > 0) {  // Only run if we have a valid page
    runSearch();
  }
}, [pagination.currentPage]);  // Only re-run when currentPage changes



  async function runSearch(options = { page: pagination.currentPage, limit: pagination.limit }) {
  try {
    setLoading(true);
    setHasSearched(true);

    const pageToUse = options?.page ?? pagination.currentPage;
    const limitToUse = options?.limit ?? pagination.limit;

    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (city !== "all") params.set("city", city);
    if (diploma !== "all") params.set("diploma", diploma);
    params.set("page", String(pageToUse));
    params.set("limit", String(limitToUse));

    const res = await fetch(
      `/api/interns/search${params.toString() ? `?${params.toString()}` : ""}`,
      { cache: "no-store" }
    );
    const json = await res.json();

    if (!res.ok || !json.success) {
      toast.error(json.message || "Failed to search interns");
      return;
    }

    setResults(Array.isArray(json.data) ? json.data : []);

    if (json.pagination) {
      setPagination(prev => ({
        ...prev,
        total: json.pagination.total,
        totalPages: json.pagination.totalPages,
        currentPage: json.pagination.currentPage,
        hasNextPage: json.pagination.hasNextPage,
        hasPreviousPage: json.pagination.hasPreviousPage,
        // keep whatever limit we used for this request
        limit: limitToUse,
      }));
    } else {
      // fallback if backend doesn't send pagination
      setPagination(prev => ({
        ...prev,    
        currentPage: pageToUse,
        limit: limitToUse,
        total: Array.isArray(json.data) ? json.data.length : 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      }));
    }
  } catch (err) {
    console.error("SEARCH_ERROR", err);
    toast.error("Network error. Ensure API is running.");
    setResults([]);
  } finally {
    setLoading(false);
  }
}


function handleSubmit(e) {
  e.preventDefault();
  runSearch();
}

  function handleReset() {
    setQuery("");
    setCity("all");
    setDiploma("all");
    setResults([]);
    setHasSearched(false);
    setPagination({
      currentPage: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false
    });
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Toaster theme="dark" position="bottom-right" />

        {currentUser && <Sidebar />}

        <main className="flex-1 relative">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-8 md:py-12">
            {/* header */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Talent Search
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Find and manage pre-approved BTS interns.
                </p>
              </div>

              <LanguageSwitcher />
              
            </div>

            {/* search hero */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  Search BTS Interns
                </CardTitle>
                <CardDescription>
                  Use a name, email or student number to quickly find the right
                  trainee.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-3 md:flex-row"
                >
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                    <Input
                      placeholder="Search candidates…"
                      className="h-12 pl-10"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="h-12 px-8"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Searching…
                      </>
                    ) : (
                      "Search candidates"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* main grid */}
            <div className="grid gap-6 lg:grid-cols-4">
              {/* filters */}
              <div className="lg:col-span-1 lg:sticky lg:top-4 self-start">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">
                        Filters
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="h-6 px-2 text-xs"
                      >
                        Reset
                      </Button>
                    </div>
                    <CardDescription className="text-xs text-muted-foreground">
                      Refine candidates by location and diploma.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider">
                        City
                      </p>
                      <Select value={city} onValueChange={setCity}>
                        <SelectTrigger className="h-10 w-full">
                          <SelectValue placeholder="All cities" />
                        </SelectTrigger>
                        <SelectContent>
                          {CITY_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider">
                        Diploma
                      </p>
                      <Select value={diploma} onValueChange={setDiploma}>
                        <SelectTrigger className="h-10 w-full">
                          <SelectValue placeholder="All diplomas" />
                        </SelectTrigger>
                        <SelectContent>
                          {DIPLOMA_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={runSearch}
                      disabled={loading}
                      variant="outline"
                      className="mt-2 w-full"
                    >
                      Apply filters
                    </Button>
                  </CardContent>
                </Card>
              </div>

    {/* RESULTS */}
<div className="lg:col-span-3">
  <Card className="">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
      <div className="flex items-center gap-2">
        <CardTitle className="text-lg">Results</CardTitle>
        {hasSearched && (
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {pagination.total} found
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
            </div>
          </div>
        )}
      </div>
    </CardHeader>

    <CardContent className="space-y-4">
      {/* Initial state */}
      {!hasSearched && !loading && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-foreground/10">
              <Search className="h-8 w-8 text-slate-500" />
            </div>
            <h4 className="text-lg font-medium">Ready to search</h4>
            <p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">
              Use the search bar or filters to find interns for your team.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {hasSearched && !loading && results.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Users className="mb-3 h-12 w-12 text-muted-foreground" />
            <h4 className="text-lg font-medium">
              No candidates found
            </h4>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or search query.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Result items */}
      {results.map((intern) => (
        <Card
          key={intern.id}
          className="group cursor-pointer"
          onClick={() => openStudentProfile(intern.id)}
        >
          <CardContent className="pt-5">
            <div className="flex flex-col gap-5 sm:flex-row">
              {/* Avatar */}
              <div className="shrink-0">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-xl font-bold">
                  {(intern.firstName?.[0] ||
                    intern.lastName?.[0] ||
                    intern.email[0]
                  ).toUpperCase()}
                </div>
              </div>

              {/* Main content */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <h4 className="truncate text-lg font-semibold">
                      {intern.firstName || intern.lastName
                        ? `${intern.firstName || ""} ${
                            intern.lastName || ""
                          }`.trim()
                        : intern.email}
                    </h4>

                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      {intern.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {intern.city}
                        </span>
                      )}
                      {intern.city && intern.diploma && (
                        <span className="h-1 w-1 rounded-full bg-slate-700" />
                      )}
                      {intern.diploma && (
                        <span className="flex items-center gap-1">
                          <GraduationCap className="h-3.5 w-3.5" />
                          {intern.diploma}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {intern.linkedin && (
                      <Button
                        asChild
                        variant="primary"
                        size="sm"
                        className="h-9 text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a
                          href={intern.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center"
                        >
                          LinkedIn
                          <ExternalLink className="ml-1.5 h-3 w-3" />
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 "
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {intern.presentation && (
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {intern.presentation}
                  </p>
                )}

                {Array.isArray(intern.skills) && intern.skills.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {intern.skills.slice(0, 5).map((skill, idx) => {
                      const skillName =
                        typeof skill === "string" ? skill : skill.name;
                      return (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="px-2 py-1 text-xs font-medium"
                        >
                          {skillName}
                        </Badge>
                      );
                    })}
                    {intern.skills.length > 5 && (
                      <span className="inline-flex items-center px-2 py-1 text-xs text-muted-foreground">
                        +{intern.skills.length - 5}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Pagination Controls - moved to bottom */}
      {hasSearched && results.length > 0 && (
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">Show</p>
            <Select
              value={pagination.limit.toString()}
              onValueChange={(value) => {
                const newLimit = parseInt(value, 10);

                setPagination(prev => ({
                  ...prev,
                  limit: newLimit,
                  currentPage: 1,
                }));

                // search with the NEW values immediately
                runSearch({ page: 1, limit: newLimit });
              }}
            >
              <SelectTrigger className="h-8 w-20">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">per page</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (pagination.currentPage > 1) {
                  setPagination(prev => ({
                    ...prev,
                    currentPage: prev.currentPage - 1,
                  }));
                  // The useEffect will trigger runSearch automatically
                }
              }}
              disabled={!pagination.hasPreviousPage || loading}
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Previous page</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Button>

            <div className="flex items-center justify-center rounded-md border px-3 py-1.5 text-sm bg-muted">
              {pagination.currentPage}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newPage = pagination.currentPage + 1;

                setPagination(prev => ({
                  ...prev,
                  currentPage: newPage,
                }));

                runSearch({ page: newPage });
              }}
              disabled={!pagination.hasNextPage || loading}
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Next page</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Button>
          </div>
        </div>
      )}
    </CardContent>
  </Card>
</div>

            </div>
          </div>

          {/* hidden container for Google Translate */}
          <div id="google_translate_element" className="hidden" />

          <StudentProfileDialog
            open={showProfile}
            onOpenChange={setShowProfile}
            studentId={selectedStudentId}
          />

          <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Login required</DialogTitle>
                <DialogDescription>
                  You need to log in to view full student details.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowLoginPrompt(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setShowLoginPrompt(false);
                    router.push("/log-in");
                  }}
                >
                  Log in
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </SidebarProvider>
  );
}
