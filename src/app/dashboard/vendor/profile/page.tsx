"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VendorProfileSchema, type VendorProfileInput } from "@/schemas/vendor";

export default function VendorProfilePage() {
  const [vendor, setVendor] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<VendorProfileInput>({
    resolver: zodResolver(VendorProfileSchema),
  });

  useEffect(() => {
    fetch("/api/vendors?mine=true")
      .then((r) => r.json())
      .then((data) => {
        if (data.results?.[0]) {
          setVendor(data.results[0]);
          reset(data.results[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data: VendorProfileInput) => {
    setError("");
    setSaved(false);
    const endpoint = vendor
      ? `/api/vendors/${vendor.id}`
      : "/api/onboarding/vendor";
    const method = vendor ? "PATCH" : "POST";

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? "Save failed");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Business Name *</Label>
              <Input {...register("businessName")} className="mt-1" />
              {errors.businessName && <p className="text-xs text-red-500 mt-1">{errors.businessName.message}</p>}
            </div>
            <div>
              <Label>Tagline</Label>
              <Input {...register("tagline")} placeholder="A short memorable description" className="mt-1" />
            </div>
            <div>
              <Label>About Your Business</Label>
              <Textarea {...register("description")} rows={6} className="mt-1" placeholder="Tell couples about your business, style, and what makes you special..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Contact & Location</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input {...register("phone")} type="tel" className="mt-1" />
              </div>
              <div>
                <Label>Business Email</Label>
                <Input {...register("email")} type="email" className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Website</Label>
              <Input {...register("website")} type="url" placeholder="https://" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>City</Label>
                <Input {...register("city")} className="mt-1" />
              </div>
              <div>
                <Label>State/Province</Label>
                <Input {...register("state")} className="mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Price Tier</Label>
                <select {...register("priceTier")} className="mt-1 w-full h-10 rounded-md border border-gray-300 px-3 text-sm">
                  <option value="BUDGET">Budget ($)</option>
                  <option value="MID_RANGE">Mid-range ($$)</option>
                  <option value="LUXURY">Luxury ($$$)</option>
                  <option value="ULTRA_LUXURY">Ultra-luxury ($$$$)</option>
                </select>
              </div>
              <div>
                <Label>Starting Price (AUD)</Label>
                <Input {...register("priceFrom", { valueAsNumber: true })} type="number" className="mt-1" />
              </div>
              <div>
                <Label>Max Price (AUD)</Label>
                <Input {...register("priceTo", { valueAsNumber: true })} type="number" className="mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Social Media</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Instagram</Label>
              <Input {...register("instagramUrl")} placeholder="https://instagram.com/youraccount" className="mt-1" />
            </div>
            <div>
              <Label>Facebook</Label>
              <Input {...register("facebookUrl")} placeholder="https://facebook.com/yourbusiness" className="mt-1" />
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && <p className="text-sm text-green-600">Profile saved successfully!</p>}

        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting ? "Saving..." : "Save Profile"}
        </Button>
      </form>
    </div>
  );
}
