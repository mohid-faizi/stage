// app/manage-users/page.js
"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  TableHead,
  TableRow,
  TableCell,
} from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";

const filters = [
  { id: "all", label: "Tous" },
  { id: "pending", label: "En attente" },
  { id: "approved", label: "Approuvés" },
  { id: "rejected", label: "Rejetés" },
];

export default function ManageUsersPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Shared fetch function so we can call it after approve/reject too
  async function fetchUsers() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(pagination.page));
      params.set("limit", String(pagination.limit));
      params.set("status", statusFilter);

      const res = await fetch(`/api/users?${params.toString()}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Failed to load users");
      }

      const apiUsers = json.data || json.users || [];
      const apiPagination = json.pagination || {};

      setUsers(apiUsers);
      setPagination((prev) => ({
        ...prev,
        page: apiPagination.page || prev.page,
        limit: apiPagination.limit || prev.limit,
        total: apiPagination.total || apiUsers.length,
        totalPages: apiPagination.totalPages || 1,
      }));
    } catch (err) {
      console.error("FETCH_USERS_ERROR", err);
      toast.error(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, [statusFilter, pagination.page, pagination.limit]);

  // Derive user status text from flags
  function getUserStatus(user) {
    if (user.isRejected) return "Rejected";
    if (!user.isApproved) return "Pending approval";
    return "Approved";
  }

  const currentPage = pagination.page;
  const total = pagination.total;
  const totalPages = pagination.totalPages;
  const startIndex = total > 0 ? (currentPage - 1) * pagination.limit : 0;

  async function handleApprove(userId) {
    try {
      setApprovingId(userId);

      const res = await fetch(`/api/users/${userId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const json = await res.json();
      console.log("APPROVE_RESPONSE", res.status, json);

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to approve user");
      }

      await fetchUsers();
      toast.success("User approved successfully");
    } catch (err) {
      console.error("APPROVE_USER_ERROR", err);
      toast.error(err.message || "Failed to approve user");
    } finally {
      setApprovingId(null);
    }
  }

  async function handleReject(userId) {
    try {
      setRejectingId(userId);

      const res = await fetch(`/api/users/${userId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const json = await res.json();
      console.log("REJECT_RESPONSE", res.status, json);

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to reject user");
      }

      await fetchUsers();
      toast.success("User rejected successfully");
    } catch (err) {
      console.error("REJECT_USER_ERROR", err);
      toast.error(err.message || "Failed to reject user");
    } finally {
      setRejectingId(null);
    }
  }

  function getBadgeProps(user) {
    const status = getUserStatus(user);

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
        "rounded-full bg-destructive/15 px-3 py-1 text-[11px] font-medium text-destructive " +
        "dark:bg-destructive/20 dark:text-destructive",
    };
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="flex min-h-screen flex-col">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 md:px-8">
          {/* TOP BAR */}
          <header className="flex items-start justify-between gap-4 ">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Manage Users
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

          {/* USERS TABLE CARD */}
          <Card className="mt-2 py-0 overflow-hidden rounded-2xl bg-card shadow-sm">
            <CardContent className="p-0">
              <Table>
                {/* Proper header row */}
                <TableHeader>
                  <TableRow className="text-xs font-semibold bg-blue-600">
                    <TableHead className="w-[32%] pl-6">
                      User
                    </TableHead>
                    <TableHead className="w-[18%]">
                      Identifier
                    </TableHead>
                    <TableHead className="w-[24%]">
                      Created At
                    </TableHead>
                    <TableHead className="w-[14%]">
                      Status
                    </TableHead>
                    <TableHead className="w-[12%] pr-6 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-10 text-center text-sm text-muted-foreground"
                      >
                        Loading users...
                      </TableCell>
                    </TableRow>
                  )}

                  {!loading &&
                    users.map((user) => {
                      const badge = getBadgeProps(user);
                      const status = getUserStatus(user);

                      return (
                        <TableRow
                          key={user.id}
                          className="border-b last:border-0 bg-card hover:bg-muted/60"
                        >
                          {/* User col */}
                          <TableCell className="py-4 pl-6 pr-3 align-middle">
                            <div className="text-sm font-semibold">
                              {user.name || "Unnamed user"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {user.email}
                            </div>
                          </TableCell>

                          {/* Identifier */}
                          <TableCell className="py-4 px-3 align-middle text-sm">
                            {user.id || "—"}
                          </TableCell>

                          {/* Created At */}
                          <TableCell className="py-4 px-3 align-middle text-sm">
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString()
                              : "—"}
                          </TableCell>

                          {/* Status badge */}
                          <TableCell className="py-4 px-3 align-middle">
                            <Badge className={badge.className}>
                              {badge.label}
                            </Badge>
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
                                    onClick={() => handleApprove(user.id)}
                                    disabled={approvingId === user.id}
                                    className="
                                      rounded-full border border-emerald-500/40
                                      bg-background px-4 text-[11px] font-medium
                                    "
                                  >
                                    {approvingId === user.id
                                      ? "Approving..."
                                      : "Approve"}
                                  </Button>

                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleReject(user.id)}
                                    disabled={rejectingId === user.id}
                                    className="
                                      rounded-full border border-rose-500/40
                                      bg-background px-4 text-[11px] font-medium
                                    "
                                  >
                                    {rejectingId === user.id
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

                  {!loading && users.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-10 text-center text-sm text-muted-foreground"
                      >
                        No users in this status.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              {!loading && totalPages > 0 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing{" "}
                    {total > 0 ? startIndex + 1 : 0}
                    -
                    {Math.min(startIndex + pagination.limit, total)}{" "}
                    of {total} users
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: Math.max(1, currentPage - 1),
                        }))
                      }
                      disabled={currentPage <= 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: Math.min(totalPages, currentPage + 1),
                        }))
                      }
                      disabled={currentPage >= totalPages}
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
