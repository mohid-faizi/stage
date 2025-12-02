"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ThemeToggle } from "../../../components/theme-toggle";
import {
  Card,
  CardContent,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
} from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";

const filters = [
  { id: "all", label: "Tous" },
  { id: "pending", label: "En attente" },
  { id: "approved", label: "Approuvés" },
  { id: "rejected", label: "Rejetés" },
];

export default function ManageStudentsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("all");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  // Fetch students from API
  async function fetchStudents() {
    try {
      setLoading(true);

      const res = await fetch(`/api/admin/students?page=${pagination.page}&limit=${pagination.limit}&status=${statusFilter}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Failed to load students");
      }

      const apiStudents = json.data || [];
      const apiPagination = json.pagination || {};
      
      setStudents(apiStudents);
      setPagination({
        page: apiPagination.page || 1,
        limit: apiPagination.limit || 10,
        total: apiPagination.total || 0,
        totalPages: apiPagination.totalPages || 1
      });
    } catch (err) {
      console.error("FETCH_STUDENTS_ERROR", err);
      toast.error(err.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStudents();
  }, [statusFilter, pagination.page, pagination.limit]);

  // Derive status of the student
  function getStudentStatus(student) {
  if (student.profile?.isProfileApproved) return "Approved";
  if (student.profile?.isProfileRejected) return "Rejected";
  return "Pending approval";
}

  function matchesFilter(student) {
    const status = getStudentStatus(student);

    if (statusFilter === "all") return true;
    if (statusFilter === "approved") return status === "Approved";
    if (statusFilter === "pending") return status === "Pending approval";
    if (statusFilter === "rejected") return status === "Rejected";

    return true;
  }

  const filteredStudents = students.filter(matchesFilter);

  function openStudentProfile(studentId) {
    router.push(`/manage-students/${studentId}`);
  }
// Handle approval action
async function handleApprove(studentId) {
  try {
    setApprovingId(studentId);

    const res = await fetch(`/api/admin/students/${studentId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const json = await res.json();

    if (!res.ok || !json.success) {
      toast.error(json.message || "Failed to approve student");
      return;
    }

    toast.success("Student approved successfully");
    await fetchStudents();
  } catch (err) {
    console.error("APPROVE_STUDENT_ERROR", err);
    toast.error("Something went wrong");
  } finally {
    setApprovingId(null);
  }
}

  // Handle rejection action
  async function handleReject(studentId) {
    try {
      setRejectingId(studentId);

      const res = await fetch(`/api/admin/students/${studentId}/reject`, {
        method: "POST",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.message || "Failed to reject student");
        return;
      }

      toast.success("Student rejected successfully");
      // Fetch updated students list after rejection
      await fetchStudents();
    } catch (err) {
      console.error("REJECT_STUDENT_ERROR", err);
      toast.error("Something went wrong");
    } finally {
      setRejectingId(null);
    }
  }

  function getBadgeProps(student) {
    const status = getStudentStatus(student);

    if (status === "Approved") {
      return {
        label: "Approved",
        className:
          "rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-medium text-emerald-700 " +
          "dark:bg-emerald-500/20 dark:text-emerald-300",
      };
    }

    if (status === "Pending approval") {
      return {
        label: "Pending approval",
        className:
          "rounded-full bg-amber-500/15 px-3 py-1 text-[11px] font-medium text-amber-700 " +
          "dark:bg-amber-500/20 dark:text-amber-300",
      };
    }

    // Rejected
    return {
      label: "Rejected",
      className:
        "rounded-full bg-rose-500/15 px-3 py-1 text-[11px] font-medium text-rose-700 " +
        "dark:bg-rose-500/20 dark:text-rose-300",
    };
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="flex min-h-screen flex-col">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 md:px-8">
          {/* TOP BAR */}
          <header className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Manage Students
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Review, approve or reject student accounts.
              </p>
            </div>

            <ThemeToggle />
          </header>

          {/* FILTER BUTTONS */}
          <div className="flex justify-start">
            <div className="inline-flex gap-2 rounded-full bg-background/80 p-1 shadow-sm">
              {filters.map((f) => (
                <Button
                  key={f.id}
                  type="button"
                  size="sm"
                  variant={statusFilter === f.id ? "default" : "outline"}
                  onClick={() => {
                    setStatusFilter(f.id);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className="rounded-full px-4 text-xs font-medium shadow-sm"
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>

          {/* STUDENTS TABLE CARD */}
          <Card className="mt-2 py-0 overflow-hidden rounded-2xl bg-card shadow-sm">
            <CardContent className="p-0">
              <Table>
                {/* Proper header row */}
                <TableHeader>
                  <TableRow className="text-xs font-semibold bg-blue-600">
                    <TableHead className="w-[32%] pl-6">Student</TableHead>
                    <TableHead className="w-[18%]">Student number</TableHead>
                    <TableHead className="w-[24%]">School</TableHead>
                    <TableHead className="w-[14%]">Status</TableHead>
                    <TableHead className="w-[12%] pr-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-10 text-center text-sm text-muted-foreground"
                      >
                        Loading students...
                      </TableCell>
                    </TableRow>
                  )}

                  {!loading &&
                    filteredStudents.map((student) => {
                      const badge = getBadgeProps(student);
                      const status = getStudentStatus(student);

                      return (
                        <TableRow
                          key={student.id}
                          className="border-b last:border-0 bg-card hover:bg-muted/60"
                        >
                          {/* User col */}
                          <TableCell className="py-4 pl-6 pr-3 align-middle">
                            <button
                              type="button"
                              onClick={() => openStudentProfile(student.id)}
                              className="text-left flex flex-col items-start gap-0.5 cursor-pointer focus:outline-none"
                            >
                              <span className="text-sm font-semibold">
                                {student.firstName} {student.lastName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {student.email}
                              </span>
                            </button>
                          </TableCell>

                          {/* Student number (placeholder) */}
                          <TableCell className="py-4 px-3 align-middle text-sm">
                            {student.studentNumber || "—"}
                          </TableCell>

                          {/* School (placeholder) */}
                          <TableCell className="py-4 px-3 align-middle text-sm">
                            {student.establishment || "—"}
                          </TableCell>

                          {/* Status badge */}
                          <TableCell className="py-4 px-3 align-middle">
                            <Badge className={badge.className}>{badge.label}</Badge>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="py-4 pr-6 align-middle text-right">
                            <div className="inline-flex justify-end gap-2">
                              {status === "Approved" && (
                                <span className="text-xs text-muted-foreground">
                                  Approved
                                </span>
                              )}

                              {status === "Rejected" && (
                                <span className="text-xs text-destructive">
                                  Rejected
                                </span>
                              )}

                              {status !== "Approved" && status !== "Rejected" && (
                                <>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleApprove(student.id)}
                                    disabled={approvingId === student.id}
                                    className="
                                      rounded-full border border-emerald-500/40
                                      bg-background px-4 text-[11px] font-medium
                                      hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30
                                    "
                                  >
                                    {approvingId === student.id
                                      ? "Approving..."
                                      : "Approve"}
                                  </Button>

                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleReject(student.id)}
                                    disabled={rejectingId === student.id}
                                    className="
                                      rounded-full border border-rose-500/40
                                      bg-background px-4 text-[11px] font-medium
                                      hover:bg-rose-50/50 dark:hover:bg-rose-900/30
                                      transition-colors duration-150
                                    "
                                  >
                                    {rejectingId === student.id
                                      ? "Rejecting..."
                                      : "Reject"}
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                  {!loading && filteredStudents.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-10 text-center text-sm text-muted-foreground"
                      >
                        No students in this status.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              
          {/* Pagination Controls */}
{!loading && pagination.totalPages > 0 && (
  <div className="flex items-center justify-between px-6 py-4 border-t">
    <div className="text-sm text-muted-foreground">
      Showing{" "}
      {students.length > 0
        ? (pagination.page - 1) * pagination.limit + 1
        : 0}
      -
      {Math.min(
        pagination.page * pagination.limit,
        pagination.total
      )}{" "}
      of {pagination.total} students
    </div>
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setPagination(prev => ({
          ...prev,
          page: Math.max(1, prev.page - 1)
        }))}
        disabled={pagination.page <= 1}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="text-sm">
        Page {pagination.page} of {pagination.totalPages}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setPagination(prev => ({
          ...prev,
          page: Math.min(pagination.totalPages, prev.page + 1)
        }))}
        disabled={pagination.page >= pagination.totalPages}
        className="h-8 w-8 p-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  </div>
)}
            </CardContent>
          </Card>

          
        </div>
      </main>
    </div>
  );
}
