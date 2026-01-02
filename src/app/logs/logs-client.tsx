"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, isSameDay, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { ProblemList } from "@/components/dashboard/problem-list";
import { ProblemLogger, ProblemData } from "@/components/dashboard/problem-logger";

interface Problem {
  id: string;
  name: string;
  topic: string;
  difficulty: string;
  externalUrl?: string | null;
  notes?: string | null;
  tags?: string[];
}

interface Log {
  id: string;
  date: string;
  completed: boolean;
  problems: Problem[];
}

interface LogsClientProps {
  logs: Log[];
}

export function LogsClient({ logs }: LogsClientProps) {
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);

  // Derived state
  const selectedLog = logs.find(
    (log) => date && isSameDay(parseISO(log.date), date)
  );

  const datesWithLogs = logs
    .filter((l) => l.problems.length > 0)
    .map((l) => parseISO(l.date));

  const handleDeleteProblem = async (problemId: string) => {
    // Note: ProblemList handles the confirmation dialog now
    try {
      const res = await fetch(`/api/problems?id=${problemId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Problem deleted");
        router.refresh();
      } else {
        toast.error("Failed to delete");
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleUpdateProblem = async (data: ProblemData) => {
    if (!editingProblem)
      return { success: false, error: { message: "No problem selected" } };

    try {
      const res = await fetch(`/api/problems`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          id: editingProblem.id,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Problem updated");
        setEditingProblem(null);
        router.refresh();
        return { success: true };
      } else {
        return {
          success: false,
          error: { message: result.error || "Failed to update" },
        };
      }
    } catch {
      return { success: false, error: { message: "Failed to update" } };
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="font-semibold">Coding Journey</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid md:grid-cols-[auto_1fr] gap-8">
          {/* Left: Calendar */}
          <div className="space-y-4">
            <Card className="bg-card/50">
              <CardContent className="p-3">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  modifiers={{
                    booked: datesWithLogs,
                  }}
                  modifiersStyles={{
                    booked: {
                      fontWeight: "bold",
                      textDecoration: "underline",
                      color: "var(--primary)",
                    },
                  }}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>
            <div className="text-sm text-muted-foreground text-center">
              Select a date to view or edit logs
            </div>
          </div>

          {/* Right: Details */}
          <div className="space-y-6">
            {date ? (
              <>
                <h2 className="text-2xl font-bold">
                  {format(date, "MMMM d, yyyy")}
                </h2>

                {!selectedLog || selectedLog.problems.length === 0 ? (
                  <div className="p-8 border border-dashed border-border rounded-xl text-center text-muted-foreground">
                    No problems solved on this day.
                  </div>
                ) : (
                  <ProblemList
                    problems={
                      selectedLog.problems.map((p) => ({
                        ...p,
                        tags: p.tags || [],
                        notes: p.notes || "",
                      }))
                    }
                    onDelete={handleDeleteProblem}
                    onEdit={(p) =>
                      setEditingProblem({
                        ...p,
                        tags: p.tags || [],
                        notes: p.notes || null,
                        externalUrl: p.externalUrl || null,
                      })
                    }
                  />
                )}
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Select a date from the calendar
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit Dialog - Now reusing ProblemLogger */}
      <Dialog
        open={!!editingProblem}
        onOpenChange={(open) => !open && setEditingProblem(null)}
      >
        <DialogContent className="max-w-xl p-0 border-0 bg-transparent shadow-none">
          {/* We render ProblemLogger inside dialog, but it has its own CardSpotlight. 
                We might need to adjust styling or use it without wrapper if possible.
                For now, let it render fully. */}
          <div className="pointer-events-auto">
            {editingProblem && (
              <ProblemLogger
                initialData={{
                  topic: editingProblem.topic,
                  name: editingProblem.name,
                  difficulty: editingProblem.difficulty,
                  externalUrl: editingProblem.externalUrl || undefined,
                  tags: editingProblem.tags,
                  notes: editingProblem.notes || undefined,
                }}
                onCancel={() => setEditingProblem(null)}
                onLogProblem={handleUpdateProblem}
                showCloseButton={false}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
