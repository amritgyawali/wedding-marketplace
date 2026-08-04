"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RegisterSchema, type RegisterInput } from "@/schemas/auth";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [role, setRole] = useState<"COUPLE" | "VENDOR">("COUPLE");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { role: "COUPLE" },
  });

  const onSubmit = async (data: RegisterInput) => {
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, role }),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "Registration failed");
        return;
      }

      await signIn("credentials", {
        email: data.email,
        password: data.password,
        callbackUrl: role === "VENDOR" ? "/dashboard/vendor" : "/dashboard/couple",
      });
    } catch {
      setError("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-pink-600 mb-4">
            <Heart className="h-6 w-6 fill-pink-500" />
            <span className="text-2xl font-bold">WedMarket</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-1">Join thousands of couples and vendors</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("COUPLE")}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                role === "COUPLE"
                  ? "border-pink-500 bg-pink-50 text-pink-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              <div className="text-2xl mb-1">💑</div>
              <div className="font-medium text-sm">I&apos;m a Couple</div>
              <div className="text-xs opacity-70">Planning a wedding</div>
            </button>
            <button
              type="button"
              onClick={() => setRole("VENDOR")}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                role === "VENDOR"
                  ? "border-pink-500 bg-pink-50 text-pink-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              <div className="text-2xl mb-1">🏢</div>
              <div className="font-medium text-sm">I&apos;m a Vendor</div>
              <div className="text-xs opacity-70">Wedding professional</div>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...register("name")} className="mt-1" placeholder="Your name" />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} className="mt-1" placeholder="you@example.com" />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} className="mt-1" placeholder="At least 8 characters" />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="text-xs text-center text-gray-400">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="underline">Terms</Link> and{" "}
            <Link href="/privacy" className="underline">Privacy Policy</Link>.
          </p>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-pink-600 hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
