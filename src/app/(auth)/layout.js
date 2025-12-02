// app/(auth)/layout.js
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_TOKEN_COOKIE, verifyAccessToken } from "../../lib/auth";

export default async function AuthLayout({ children }) {
  const cookieStore = await cookies(); 
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value || null;

  if (token) {
    const payload = verifyAccessToken(token);

    if (payload) {
      redirect("/");
    }
  }

  return <>{children}</>;
}
