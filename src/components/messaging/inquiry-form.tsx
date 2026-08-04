"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CreateInquirySchema, type CreateInquiryInput } from "@/schemas/inquiry";

interface InquiryFormProps {
  vendorId: string;
  vendorName: string;
  onSuccess?: () => void;
}

export function InquiryForm({ vendorId, vendorName, onSuccess }: InquiryFormProps) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateInquiryInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(CreateInquirySchema) as any,
    defaultValues: { vendorId },
  });

  const onSubmit = async (data: CreateInquiryInput) => {
    setError("");
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "Failed to send inquiry");
        return;
      }

      setSuccess(true);
      onSuccess?.();
    } catch {
      setError("Something went wrong");
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="text-green-600 text-2xl mb-2">✓</div>
        <h3 className="font-semibold text-gray-900">Inquiry sent!</h3>
        <p className="text-sm text-gray-500 mt-1">
          {vendorName} will get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Wedding Date</Label>
          <Input type="date" {...register("eventDate")} className="mt-1" />
        </div>
        <div>
          <Label>Guest Count</Label>
          <Input type="number" placeholder="100" {...register("guestCount")} className="mt-1" />
          {errors.guestCount && <p className="text-xs text-red-500 mt-1">{errors.guestCount.message}</p>}
        </div>
      </div>

      <div>
        <Label>Approximate Budget</Label>
        <Input type="number" placeholder="5000" {...register("budget")} className="mt-1" />
      </div>

      <div>
        <Label>Message</Label>
        <Textarea
          {...register("message")}
          placeholder={`Hi, I'm interested in booking ${vendorName} for my wedding...`}
          rows={4}
          className="mt-1"
        />
        {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Sending..." : "Send Inquiry"}
      </Button>
    </form>
  );
}
