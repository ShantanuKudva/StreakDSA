"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, ExternalLink, Edit2 } from "lucide-react";
import { toast } from "sonner";

interface Problem {
  id: string;
  topic: string;
  name: string;
  difficulty: string;
  externalUrl?: string | null;
  tags?: string[];
  notes?: string | null;
}

interface ProblemListProps {
  problems: Problem[];
  onDelete: (id: string) => Promise<void>;
  onEdit: (problem: Problem) => void;
}

export function ProblemList({ problems, onDelete, onEdit }: ProblemListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!problems || problems.length === 0) {
    return null;
  }

  const handleDelete = (id: string) => {
    toast("Are you sure you want to delete this problem?", {
      action: {
        label: "Delete",
        onClick: async () => {
          setDeletingId(id);
          try {
            await onDelete(id);
            toast.success("Problem deleted");
          } catch {
            toast.error("Failed to delete");
          } finally {
            setDeletingId(null);
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  const difficultyColors: Record<string, string> = {
    EASY: "text-green-400",
    MEDIUM: "text-yellow-400",
    HARD: "text-red-400",
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">
        Today&apos;s Problems
      </h3>
      <div className="space-y-2">
        {problems.map((problem) => (
          <Card key={problem.id} className="bg-card/50">
            <CardContent className="p-3 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">
                    {problem.name}
                  </span>
                  {problem.externalUrl && (
                    <a
                      href={problem.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-purple-400"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{problem.topic.replace("_", " ")}</span>
                  <span>•</span>
                  <span className={difficultyColors[problem.difficulty] || ""}>
                    {problem.difficulty}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(problem)}
                  className="text-muted-foreground hover:text-blue-400"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(problem.id)}
                  disabled={deletingId === problem.id}
                  className="text-muted-foreground hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
