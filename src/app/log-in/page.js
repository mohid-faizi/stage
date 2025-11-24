"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import Link from "next/link";
import { toast } from "sonner";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }).max(32, { message: "Password must be at most 32 characters long" })
});

export default function LogIn() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  // { email?: string; password?: string }
  const [validationErrors, setValidationErrors] = useState({});

  async function handleLogin(e) {
    e.preventDefault();
    setValidationErrors({});

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Zod validation first
    const result = loginSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;

      setValidationErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });

      toast.error("Please fix the highlighted errors.");
      return;
    }

    const { email, password } = result.data;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();

      if (!json.success) {
        const status = json.data?.status;

        if (status === "PENDING_APPROVAL") {
          toast.error(
            "Your account is pending admin approval. Please wait for approval."
          );
        } else if (status === "REJECTED") {
          toast.error(
            "Your account has been rejected. You cannot log in with this email."
          );
        } else {
          toast.error(json.message || "Invalid email or password.");
        }
        return;
      }

      toast.success("Logged in successfully.");
      router.push("/dashboard");
    } catch (err) {
      console.error("LOGIN_CLIENT_ERROR", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen w-full p-3 flex flex-col gap-5 items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center justify-center">
            Log in
          </CardTitle>
        </CardHeader>

        {/* noValidate disables browser's own validation so Zod can run */}
        <form onSubmit={handleLogin} noValidate>
          <CardContent>
            <div className="flex flex-col gap-6">
              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="mail@example.com"
                />
                {validationErrors.email && (
                  <p className="text-xs text-red-500 mt-1">
                    {validationErrors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  name="password"
                  placeholder="password"
                  type="password"
                />
                {validationErrors.password && (
                  <p className="text-xs text-red-500 mt-1">
                    {validationErrors.password}
                  </p>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex-col py-4 gap-2">
            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log in"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div className="flex items-center justify-center">
        <CardDescription>Don&apos;t have an account?</CardDescription>
        <CardAction>
          <Button variant="link" className="cursor-pointer">
            <Link href="/sign-up">Sign Up</Link>
          </Button>
        </CardAction>
      </div>
    </div>
  );
}
