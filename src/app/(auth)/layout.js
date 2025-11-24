// app/(auth)/layout.js
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_TOKEN_COOKIE, verifyAccessToken } from "../../lib/auth";

export default async function AuthLayout({ children }) {
  const cookieStore = await cookies(); // Next 16 => async
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value || null;

  if (token) {
    const payload = verifyAccessToken(token);

    if (payload) {
      // user already logged in → no access to auth pages
      redirect("/dashboard"); // or "/" if you prefer
    }
  }

  // not logged in → show login / signup normally
  return <>{children}</>;
}
