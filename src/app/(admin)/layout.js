// app/(protected)/(admin)/layout.js
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_TOKEN_COOKIE, verifyAccessToken } from "../../lib/auth";
import { SidebarProvider } from "../../components/ui/sidebar";
import Sidebar from "../../components/sidebar";

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value || null;

  if (!token) {
    redirect("/log-in");
  }

  const payload = verifyAccessToken(token);

  if (!payload) {
    redirect("/log-in");
  }

  // role check
  if (payload.role !== "ADMIN") {
    // normal logged-in user -> kick to dashboard
    redirect("/dashboard");
  }

  return (
     <>
      <SidebarProvider>
          <div className="flex h-full w-full">
            <Sidebar />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </SidebarProvider>
    </>
  )
}
