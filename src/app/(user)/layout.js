// app/(protected)/layout.js
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_TOKEN_COOKIE, verifyAccessToken } from "../../lib/auth";
import { SidebarProvider } from "../../components/ui/sidebar";
import AppSidebar from "../../components/sidebar";

export default async function ProtectedLayout({ children }) {
  // Next 16: cookies() is async
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;

  if (!token) {
    redirect("/log-in");
  }

  const payload = verifyAccessToken(token);

  if (!payload) {
    redirect("/log-in");
  }

  // optional role gate for whole protected area:
  // if (payload.role !== "ADMIN") redirect("/dashboard");

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
