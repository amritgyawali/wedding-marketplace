"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES = [
  { name: "All categories", slug: "" },
  { name: "Photographers", slug: "photographers" },
  { name: "Wedding Venues", slug: "venues" },
  { name: "Caterers", slug: "caterers" },
  { name: "Florists", slug: "florists" },
  { name: "Musicians & DJs", slug: "musicians" },
  { name: "Wedding Planners", slug: "planners" },
  { name: "Hair & Makeup", slug: "beauty" },
  { name: "Officiants", slug: "officiants" },
];

interface SearchBarProps {
  defaultCategory?: string;
  defaultCity?: string;
  size?: "default" | "lg";
}

export function SearchBar({ defaultCategory = "", defaultCity = "", size = "default" }: SearchBarProps) {
  const router = useRouter();
  const [category, setCategory] = useState(defaultCategory);
  const [city, setCity] = useState(defaultCity);

  const handleSearch = () => {
    const cat = category || "photographers";
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    const qs = params.toString();
    router.push(`/vendors/${cat}${qs ? `?${qs}` : ""}`);
  };

  const inputClass = size === "lg" ? "h-12 text-base" : "";

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className={`sm:w-48 ${inputClass}`}>
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          {CATEGORIES.map((c) => (
            <SelectItem key={c.slug} value={c.slug || "all"}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        placeholder="City or suburb..."
        value={city}
        onChange={(e) => setCity(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        className={`flex-1 ${inputClass}`}
      />
      <Button onClick={handleSearch} className={size === "lg" ? "h-12 px-8" : ""}>
        <Search className="h-4 w-4 mr-2" /> Search
      </Button>
    </div>
  );
}
