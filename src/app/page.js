// app/page.js
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE, verifyAccessToken } from "../lib/auth";

export default async function HomePage() {
  // Next 16: cookies() is async
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value || null;

  if (!token) {
    redirect("/log-in");
  }

  const payload = verifyAccessToken(token);

  if (!payload) {
    redirect("/log-in");
  }

  // User is logged in → go to dashboard
  redirect("/dashboard");
}
