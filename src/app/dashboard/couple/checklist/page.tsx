"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Check, Plus, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  isCompleted: boolean;
  isDefault: boolean;
  category: string | null;
}

export default function ChecklistPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchTasks = async () => {
    const res = await fetch("/api/checklist");
    const data = await res.json();
    setTasks(data?.tasks ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, []);

  const toggle = async (task: Task) => {
    await fetch(`/api/checklist/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCompleted: !task.isCompleted }),
    });
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t));
  };

  const addTask = async () => {
    if (!newTask.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTask }),
      });
      const task = await res.json();
      setTasks((prev) => [...prev, task]);
      setNewTask("");
    } finally {
      setAdding(false);
    }
  };

  const deleteTask = async (id: string) => {
    await fetch(`/api/checklist/${id}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  const completed = tasks.filter((t) => t.isCompleted).length;
  const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  const byCategory = tasks.reduce<Record<string, Task[]>>((acc, task) => {
    const cat = task.category ?? "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(task);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Wedding Checklist</h1>
        <span className="text-sm text-gray-500">{completed}/{tasks.length} done</span>
      </div>

      <div className="mb-6">
        <Progress value={progress} />
      </div>

      <div className="flex gap-2 mb-6">
        <Input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a task..."
          onKeyDown={(e) => e.key === "Enter" && addTask()}
        />
        <Button onClick={addTask} disabled={adding || !newTask.trim()}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      <div className="space-y-6">
        {Object.entries(byCategory).map(([category, categoryTasks]) => (
          <div key={category}>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{category}</h2>
            <Card>
              <CardContent className="p-0">
                {categoryTasks.map((task, idx) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 px-4 py-3 ${idx !== categoryTasks.length - 1 ? "border-b border-gray-100" : ""}`}
                  >
                    <button
                      onClick={() => toggle(task)}
                      className={`h-5 w-5 rounded flex items-center justify-center border-2 transition-colors shrink-0 ${
                        task.isCompleted
                          ? "bg-pink-600 border-pink-600 text-white"
                          : "border-gray-300 hover:border-pink-400"
                      }`}
                    >
                      {task.isCompleted && <Check className="h-3 w-3" />}
                    </button>
                    <span className={`flex-1 text-sm ${task.isCompleted ? "line-through text-gray-400" : "text-gray-800"}`}>
                      {task.title}
                    </span>
                    {task.dueDate && (
                      <span className="text-xs text-gray-400">{formatDate(task.dueDate)}</span>
                    )}
                    {!task.isDefault && (
                      <button onClick={() => deleteTask(task.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
