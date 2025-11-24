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
  School,
  Settings,
  Users,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useState } from "react";
import { toast } from "sonner";

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

  // Routes visible to all authenticated users
  const commonItems = [
    { title: "Dashboard", url: "/dashboard", icon: School },
    { title: "Manage Students", url: "/manage-students", icon: GraduationCap },
    { title: "AI Verification", url: "/ai-verification", icon: Bot },
    { title: "Reports", url: "/reports", icon: FileText },
  ];

  // Admin-only routes
  const adminItems = [
    { title: "Manage Users", url: "/manage-users", icon: Users },
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

        {/* Logout at bottom */}
        <SidebarGroup className="mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="px-2 py-6 gap-3"
                onClick={handleLogout}
              >
                <LogOut
                  strokeWidth={1.8}
                  className="icon-size text-sidebar-foreground"
                />
                <span className="text-[17px] font-light text-sidebar-foreground">
             Logout
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
