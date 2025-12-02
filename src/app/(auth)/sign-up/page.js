"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

const ESTABLISHMENTS = [
  "EST Casablanca",
  "EST Fès",
  "EST Marrakech",
  "Other",
];

const DIPLOMAS = [
  "DUT",
  "Licence professionnelle",
  "Master",
  "Engineering",
  "Other",
];

const CITIES_MOROCCO = [
  "Casablanca",
  "Rabat",
  "Fès",
  "Marrakech",
  "Tangier",
  "Agadir",
  "Oujda",
  "Kenitra",
  "Tetouan",
  "Safi",
  "Mohammedia",
  "Laayoune",
  "Beni Mellal",
  "Nador",
  "Settat",
  "Other",
];

export default function SignUp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignup(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      const firstName = formData.get("firstName")?.toString().trim();
      const lastName = formData.get("lastName")?.toString().trim();
      const email = formData.get("email")?.toString().trim();
      const studentNumber = formData.get("studentNumber")?.toString().trim();
      const establishment =
        formData.get("establishment")?.toString().trim() || "";
      const diploma = formData.get("diploma")?.toString().trim() || "";
      const city = formData.get("city")?.toString().trim() || "";
      const password = formData.get("password")?.toString();
      const confirmPassword = formData.get("confirmPassword")?.toString();

      if (!email || !password) {
        toast.error("Email and password are required");
        return;
      }

      if(password.length < 8){
        toast.error("Password must be at least 8 characters long");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }


      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          studentNumber,
          establishment,
          diploma,
          city,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Something went wrong");
        toast.error(data.message || "Something went wrong");
        return;
      }

      toast.success(
        "Request for account approval has been sent successfully."
      );
      // optional: e.currentTarget.reset();
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error");
      setError("Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full px-3 py-6 flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl flex items-center justify-center">
            Registration
          </CardTitle>
          <CardDescription className="text-center">
            The gateway to your professional career
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            {/* First/Last name */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="First name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="studentNumber">Student number</Label>
                <Input
                  id="studentNumber"
                  name="studentNumber"
                  type="text"
                  placeholder="Your student number"
                  required
                />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="establishment">Establishment</Label>
              <select
                id="establishment"
                name="establishment"
                defaultValue=""
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="" disabled>
                  Select your establishment
                </option>
                {ESTABLISHMENTS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <select
                id="city"
                name="city"
                defaultValue=""
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="" disabled>
                  Select your city
                </option>
                {CITIES_MOROCCO.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="diploma">Diploma</Label>
              <select
                id="diploma"
                name="diploma"
                defaultValue=""
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="" disabled>
                  Select your diploma
                </option>
                {DIPLOMAS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="password"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="password"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-500" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={loading}
            >
              {loading ? "Creating..." : "Registration"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center gap-1 text-sm">
          <span>Already an account?</span>
          <Button
            variant="link"
            className="cursor-pointer p-0 h-auto"
            asChild
          >
            <Link href="/log-in">Sign in</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
