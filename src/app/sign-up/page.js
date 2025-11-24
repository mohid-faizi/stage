"use client";

import { useState } from "react";
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

const signupSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }).max(32, { message: "Password must be at most 32 characters" }),
    confirmPassword: z
      .string()
      .min(8, { message: "Confirm Password must be at least 8 characters" }).max(32, { message: "Confirm Password must be at most 32 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export default function SignUp() {
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [validationErrors, setValidationErrors] = useState({}); // { name?, email?, password?, confirmPassword? }

  async function handleSignup(e) {
    e.preventDefault();
    setGlobalError("");
    setValidationErrors({});

    const formData = new FormData(e.currentTarget);
    const rawData = Object.fromEntries(formData.entries());

    // ✅ Zod validation first
    const result = signupSchema.safeParse(rawData);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;

      setValidationErrors({
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0],
      });

      toast.error("Please fix the highlighted errors.");
      return;
    }

    const { name, email, password } = result.data;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const status = data?.data?.status;

        if (status === "REJECTED") {
          toast.error(
            "This email has been rejected by the administrator and cannot be used."
          );
        } else if (data.message) {
          toast.error(data.message);
        } else {
          toast.error("Something went wrong while creating your account.");
        }

        setGlobalError(data.message || "");
        return;
      }

      // ✅ success
      toast.success(
        data.message ||
          "Request for account approval has been sent successfully."
      );
      console.log("Signup success", data);

      // Optional: clear form
      e.target.reset();
    } catch (err) {
      console.error("SIGNUP_CLIENT_ERROR", err);
      setGlobalError("Unexpected error. Please try again.");
      toast.error("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen w-full p-3 flex flex-col gap-5 items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center justify-center">
            Sign Up
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* noValidate so browser doesn't block our Zod validation */}
          <form onSubmit={handleSignup} noValidate className="flex flex-col gap-6">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Your name"
              />
              {validationErrors.name && (
                <p className="text-xs text-red-500 mt-1">
                  {validationErrors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
              />
              {validationErrors.email && (
                <p className="text-xs text-red-500 mt-1">
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
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

            {/* Confirm password */}
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                placeholder="password"
                type="password"
              />
              {validationErrors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">
                  {validationErrors.confirmPassword}
                </p>
              )}
            </div>

            {globalError && (
              <p className="text-sm text-red-500">{globalError}</p>
            )}

            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-1">
        <CardDescription>Already a user?</CardDescription>
        <CardAction>
          <Button variant="link" className="cursor-pointer p-0 h-auto">
            <Link href="/log-in">Login</Link>
          </Button>
        </CardAction>
      </div>
    </div>
  );
}
