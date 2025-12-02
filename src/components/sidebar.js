"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "./ui/sidebar";
import {
  Bot,
  FileText,
  GraduationCap,
  LogOut,
  LogIn,
  School,
  Settings,
  Users,
  Search,  
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";

export default function AppSidebar() {
  const { user, loading } = useCurrentUser();
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  // While loading user, you can show nothing or a tiny skeleton
  if (loading) {
    return (
      <Sidebar
        className="bg-sidebar border-sidebar p-2 items-center justify-center"
        side="left"
        variant="sidebar"
        collapsible="icon"
      >
        <SidebarHeader className="px-4 py-5" />
      </Sidebar>
    );
  }

  const role = user?.role; // "ADMIN" | "USER" | undefined

  const displayName = user?.name || user?.email || "";
  const avatarLetter = displayName.charAt(0)?.toUpperCase() || "?";

  // Routes visible to all authenticated users
  const commonItems = [
    { 
      title: "Dashboard", 
      url: role === "USER" ? "/" : "/dashboard", 
      icon: School 
    },
    { title: "AI Verification", url: "/ai-verification", icon: Bot },
    { title: "Reports", url: "/reports", icon: FileText },
  ];

  // Admin-only routes
  const adminItems = [
    { title: "Talent Search", url: "/", icon: Search },
    { title: "Manage Users", url: "/manage-users", icon: Users },
    { title: "Manage Students", url: "/manage-students", icon: GraduationCap },
    { title: "Manage Components", url: "/manage-components", icon: Settings },
  ];

  // If you ever want user-only routes, add here
  const userOnlyItems = [
    // { title: "My Classes", url: "/my-classes", icon: ... },
  ];

  // Final nav items (without logout)
  const items = [
    ...commonItems,
    ...(role === "ADMIN" ? adminItems : []),
    ...(role === "USER" ? userOnlyItems : []),
  ];

  async function handleLogout() {
    try {
      setLoggingOut(true);
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!res.ok) {
        toast.error("Failed to log out. Please try again.");
        return;
      }

      toast.success("Logged out successfully.");
      router.push("/log-in");
      router.refresh();
    } catch (err) {
      console.error("LOGOUT_ERROR", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <Sidebar
      className="bg-sidebar border-sidebar p-2 items-center justify-center"
      side="left"
      variant="sidebar"
      collapsible="icon"
    >
      <SidebarHeader className="px-4 py-5">
        <Link href="/">
          {/* Light logo */}
          <Image
            src="/logo-light.png"
            alt="School logo"
            width={180}
            height={24}
            className="block h-6 cursor-pointer dark:hidden"
          />
          {/* Dark logo */}
          <Image
            src="/logo-dark.png"
            alt="School logo"
            width={180}
            height={24}
            className="hidden h-6 cursor-pointer dark:block"
          />
        </Link>
      </SidebarHeader>

      <SidebarContent className="flex flex-col h-full">
        {/* Top navigation items */}
        <SidebarGroup>
          <SidebarMenu className="gap-3">
            {items.map((item) => {
              const isActive = pathname === item.url;

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton className="px-2 py-6 gap-3" asChild>
                    <Link
                      href={item.url}
                      className="flex items-center px-4 py-2"
                    >
                      <item.icon
                        strokeWidth={isActive ? 2 : 1.6}
                        className={
                          "icon-size " +
                          (isActive
                            ? "text-black dark:text-white"
                            : "text-sidebar-foreground")
                        }
                      />
                      <span
                        className={
                          "text-[17px] " +
                          (isActive
                            ? "font-medium text-black dark:text-white"
                            : "font-light text-sidebar-foreground")
                        }
                      >
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
        {user ? (
          /* Authenticated user: avatar + profile/logout menu (shadcn dropdown) */
          <SidebarGroup className="mt-auto border-t border-sidebar-border pt-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu >
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      type="button"
                      className="px-3 py-7 gap-3 w-full hover:bg-sidebar-accent/50 transition-colors rounded-lg"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary ring-2 ring-primary/20">
                        {avatarLetter}
                      </div>
                      <div className="flex flex-col items-start overflow-hidden flex-1">
                        <span className="max-w-[140px] truncate text-sm font-semibold text-sidebar-foreground">
                          {displayName || "User"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {role === "ADMIN" ? "Administrator" : "Member"}
                        </span>
                      </div>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" side="top" className="min-w-40 p-2 bg-background">
                    <DropdownMenuLabel className="flex items-center gap-3 px-2 py-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary ring-2 ring-primary/20">
                        {avatarLetter}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="truncate text-sm font-semibold text-foreground">
                          {displayName || "User"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {user?.email || ""}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-2 bg-sidebar-border" />
                    <DropdownMenuItem
                      className="flex items-center gap-2 px-3 py-2.5 cursor-pointer rounded-md"
                      onClick={() => router.push("/me")}
                    >
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>View Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center gap-2 px-3 py-2.5 cursor-pointer rounded-md"
                      onClick={() => router.push("/settings")}
                    >
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem
                      variant="destructive"
                      className="flex items-center gap-2 px-3 py-2.5 cursor-pointer rounded-md text-destructive focus:text-destructive"
                      onClick={handleLogout}
                      disabled={loggingOut}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{loggingOut ? "Logging out..." : "Log out"}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        ) : (
          /* Show login when user is not logged in */
          <SidebarGroup className="mt-auto">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="px-2 py-6 gap-3" asChild>
                  <Link href="/log-in" className="flex items-center px-4 py-2">
                    <LogIn
                      strokeWidth={1.8}
                      className="icon-size text-sidebar-foreground"
                    />
                    <span className="text-[17px] font-light text-sidebar-foreground">
                      Login
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
