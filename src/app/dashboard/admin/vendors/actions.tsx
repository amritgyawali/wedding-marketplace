"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  vendorId: string;
  currentStatus: string;
}

export default function AdminVendorActions({ vendorId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const update = async (newStatus: string) => {
    setLoading(true);
    await fetch(`/api/admin/vendors/${vendorId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verificationStatus: newStatus }),
    });
    setStatus(newStatus);
    setLoading(false);
  };

  return (
    <div className="flex gap-1.5">
      {status !== "VERIFIED" && (
        <Button size="sm" className="h-7 text-xs" onClick={() => update("VERIFIED")} disabled={loading}>
          Verify
        </Button>
      )}
      {status !== "REJECTED" && (
        <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => update("REJECTED")} disabled={loading}>
          Reject
        </Button>
      )}
      {status === "VERIFIED" && (
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => update("SUSPENDED")} disabled={loading}>
          Suspend
        </Button>
      )}
    </div>
  );
}
