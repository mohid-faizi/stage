"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      setStatus("error");
      setMessage("Invalid verification link.");
      router.push("/sign-up");
      return;
    }

    async function verify() {
      try {
        const res = await fetch(
          `/api/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(
            email
          )}`
        );

        const data = await res.json();

        if (!res.ok || !data.success) {
          setStatus("error");
          router.push("/sign-up");
          setMessage(data.message || "Verification failed. The link may be expired or invalid.");
          return;
        }

        setStatus("success");
        setMessage("Your email has been verified successfully. You can now log in.");

        // Auto-redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } catch (err) {
        console.error("VERIFY_PAGE_ERROR", err);
        setStatus("error");
        setMessage("Something went wrong while verifying your email.");
      }
    }

    verify();
  }, [searchParams, router]);

  return (
   <></>
  );
}
