"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { formatPrice } from "@/lib/utils";
import { Plus, Check, X } from "lucide-react";

interface BudgetItem {
  id: string;
  description: string;
  estimatedCost: number;
  actualCost: number | null;
  isPaid: boolean;
  vendorName: string | null;
}

interface BudgetCategory {
  id: string;
  name: string;
  allocatedAmount: number;
  color: string | null;
  items: BudgetItem[];
}

export default function BudgetPage() {
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingItem, setAddingItem] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ description: "", estimatedCost: "" });

  useEffect(() => {
    fetch("/api/budget/categories")
      .then((r) => r.json())
      .then((data) => { setCategories(data); setLoading(false); });
  }, []);

  const addItem = async (categoryId: string) => {
    if (!newItem.description) return;
    const res = await fetch("/api/budget/items/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        budgetCategoryId: categoryId,
        description: newItem.description,
        estimatedCost: parseFloat(newItem.estimatedCost) || 0,
      }),
    });
    const item = await res.json();
    setCategories((prev) =>
      prev.map((c) =>
        c.id === categoryId ? { ...c, items: [...c.items, item] } : c
      )
    );
    setNewItem({ description: "", estimatedCost: "" });
    setAddingItem(null);
  };

  const togglePaid = async (categoryId: string, itemId: string, isPaid: boolean) => {
    await fetch(`/api/budget/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPaid: !isPaid }),
    });
    setCategories((prev) =>
      prev.map((c) =>
        c.id === categoryId
          ? { ...c, items: c.items.map((i) => i.id === itemId ? { ...i, isPaid: !isPaid } : i) }
          : c
      )
    );
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  const totalEstimated = categories.reduce(
    (sum, c) => sum + c.items.reduce((s, i) => s + i.estimatedCost, 0),
    0
  );
  const totalActual = categories.reduce(
    (sum, c) => sum + c.items.reduce((s, i) => s + (i.actualCost ?? i.estimatedCost), 0),
    0
  );
  const totalPaid = categories.reduce(
    (sum, c) => sum + c.items.filter((i) => i.isPaid).reduce((s, i) => s + (i.actualCost ?? i.estimatedCost), 0),
    0
  );

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Budget Tracker</h1>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-gray-500">Total Estimated</p>
            <p className="text-xl font-bold mt-1">{formatPrice(totalEstimated)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-gray-500">Total Actual</p>
            <p className="text-xl font-bold mt-1">{formatPrice(totalActual)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-gray-500">Total Paid</p>
            <p className="text-xl font-bold mt-1 text-green-600">{formatPrice(totalPaid)}</p>
          </CardContent>
        </Card>
      </div>

      {categories.map((cat) => {
        const catTotal = cat.items.reduce((s, i) => s + i.estimatedCost, 0);
        return (
          <Card key={cat.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{cat.name}</CardTitle>
                <span className="text-sm font-medium">{formatPrice(catTotal)}</span>
              </div>
              {cat.allocatedAmount > 0 && (
                <Progress value={(catTotal / cat.allocatedAmount) * 100} className="h-1.5 mt-2" />
              )}
            </CardHeader>
            <CardContent className="pt-0">
              {cat.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0 text-sm">
                  <button
                    onClick={() => togglePaid(cat.id, item.id, item.isPaid)}
                    className={`h-5 w-5 rounded-full flex items-center justify-center border-2 shrink-0 ${
                      item.isPaid ? "bg-green-500 border-green-500 text-white" : "border-gray-300"
                    }`}
                  >
                    {item.isPaid && <Check className="h-3 w-3" />}
                  </button>
                  <span className="flex-1 text-gray-700">{item.description}</span>
                  {item.vendorName && <span className="text-gray-400 text-xs">{item.vendorName}</span>}
                  <span className="font-medium">{formatPrice(item.actualCost ?? item.estimatedCost)}</span>
                </div>
              ))}

              {addingItem === cat.id ? (
                <div className="flex gap-2 mt-3">
                  <Input
                    placeholder="Item description"
                    value={newItem.description}
                    onChange={(e) => setNewItem((p) => ({ ...p, description: e.target.value }))}
                    className="flex-1 h-8 text-sm"
                  />
                  <Input
                    placeholder="Cost"
                    type="number"
                    value={newItem.estimatedCost}
                    onChange={(e) => setNewItem((p) => ({ ...p, estimatedCost: e.target.value }))}
                    className="w-24 h-8 text-sm"
                  />
                  <Button size="sm" className="h-8" onClick={() => addItem(cat.id)}>Add</Button>
                  <Button size="sm" variant="ghost" className="h-8" onClick={() => setAddingItem(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <button
                  className="flex items-center gap-1 text-xs text-pink-600 hover:underline mt-2"
                  onClick={() => setAddingItem(cat.id)}
                >
                  <Plus className="h-3.5 w-3.5" /> Add item
                </button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
