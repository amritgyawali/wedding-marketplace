"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  rsvpStatus: string;
  dietaryNeeds: string | null;
  side: string | null;
  plusOne: boolean;
}

const RSVP_COLORS: Record<string, string> = {
  PENDING: "secondary",
  ATTENDING: "success",
  DECLINED: "destructive",
  MAYBE: "outline",
};

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", side: "" });
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch("/api/guests")
      .then((r) => r.json())
      .then((data) => { setGuests(data); setLoading(false); });
  }, []);

  const addGuest = async () => {
    if (!form.firstName || !form.lastName) return;
    const res = await fetch("/api/guests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const guest = await res.json();
    setGuests((prev) => [...prev, guest]);
    setForm({ firstName: "", lastName: "", email: "", side: "" });
    setOpen(false);
  };

  const updateRsvp = async (id: string, rsvpStatus: string) => {
    await fetch(`/api/guests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rsvpStatus }),
    });
    setGuests((prev) => prev.map((g) => g.id === id ? { ...g, rsvpStatus } : g));
  };

  const deleteGuest = async (id: string) => {
    await fetch(`/api/guests/${id}`, { method: "DELETE" });
    setGuests((prev) => prev.filter((g) => g.id !== id));
  };

  const filtered = guests.filter((g) =>
    `${g.firstName} ${g.lastName}`.toLowerCase().includes(filter.toLowerCase())
  );

  const stats = {
    total: guests.length,
    attending: guests.filter((g) => g.rsvpStatus === "ATTENDING").length,
    declined: guests.filter((g) => g.rsvpStatus === "DECLINED").length,
    pending: guests.filter((g) => g.rsvpStatus === "PENDING").length,
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Guest List</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Add Guest</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Guest</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name *</Label>
                  <Input value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <Label>Last Name *</Label>
                  <Input value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label>Side</Label>
                <select value={form.side} onChange={(e) => setForm((p) => ({ ...p, side: e.target.value }))} className="mt-1 w-full h-10 rounded-md border border-gray-300 px-3 text-sm">
                  <option value="">-- Select --</option>
                  <option value="BRIDE">Bride&apos;s side</option>
                  <option value="GROOM">Groom&apos;s side</option>
                  <option value="BOTH">Both</option>
                </select>
              </div>
              <Button className="w-full" onClick={addGuest}>Add Guest</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total },
          { label: "Attending", value: stats.attending },
          { label: "Declined", value: stats.declined },
          { label: "Pending", value: stats.pending },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Input
        placeholder="Search guests..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Side</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">RSVP</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((guest) => (
                  <tr key={guest.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{guest.firstName} {guest.lastName}</td>
                    <td className="px-4 py-3 text-gray-500">{guest.email ?? "-"}</td>
                    <td className="px-4 py-3 text-gray-500">{guest.side ?? "-"}</td>
                    <td className="px-4 py-3">
                      <select
                        value={guest.rsvpStatus}
                        onChange={(e) => updateRsvp(guest.id, e.target.value)}
                        className="text-xs rounded px-2 py-1 border border-gray-200"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="ATTENDING">Attending</option>
                        <option value="DECLINED">Declined</option>
                        <option value="MAYBE">Maybe</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteGuest(guest.id)} className="text-gray-300 hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
