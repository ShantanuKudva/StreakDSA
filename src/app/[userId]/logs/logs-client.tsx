"use client";

import { useState, useMemo } from "react";
import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { format, parseISO, isSameDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  ExternalLink,
  Search,
  X,
  CalendarIcon,
  Flame,
} from "lucide-react";
import { toast } from "sonner";
import {
  ProblemLogger,
  ProblemData,
} from "@/components/dashboard/problem-logger";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RichTextViewer } from "@/components/ui/rich-text-viewer";

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
  userId: string;
}

const ITEMS_PER_PAGE = 10;

const difficultyColors: Record<string, string> = {
  EASY: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  MEDIUM: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  HARD: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function LogsClient({ logs, userId }: LogsClientProps) {
  const router = useRouter();
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingNotes, setViewingNotes] = useState<{ name: string; notes: string } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  // Get all problems flattened with their dates
  const allProblems = useMemo(() => {
    const problems: (Problem & { date: string })[] = [];
    logs.forEach((log) => {
      log.problems.forEach((p) => {
        problems.push({ ...p, date: log.date });
      });
    });
    return problems.sort(
      (a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()
    );
  }, [logs]);

  // Get unique topics for filter
  const allTopics = useMemo(() => {
    const topics = new Set<string>();
    allProblems.forEach((p) => {
      if (p.tags && p.tags.length > 0) {
        p.tags.forEach((t) => topics.add(t));
      } else {
        topics.add(p.topic);
      }
    });
    return Array.from(topics).sort();
  }, [allProblems]);

  // Filter problems
  const filteredProblems = useMemo(() => {
    return allProblems.filter((p) => {
      // Date filter
      if (dateFilter && !isSameDay(parseISO(p.date), dateFilter)) {
        return false;
      }
      // Search filter
      if (
        searchQuery &&
        !p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !p.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      // Difficulty filter
      if (difficultyFilter !== "all" && p.difficulty !== difficultyFilter) {
        return false;
      }
      // Topic filter
      if (topicFilter !== "all") {
        const tags = p.tags && p.tags.length > 0 ? p.tags : [p.topic];
        if (!tags.includes(topicFilter)) {
          return false;
        }
      }
      return true;
    });
  }, [allProblems, searchQuery, difficultyFilter, topicFilter, dateFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredProblems.length / ITEMS_PER_PAGE);
  const paginatedProblems = filteredProblems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handleDeleteProblem = async (problemId: string) => {
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

  const handleEdit = (problem: Problem & { date: string }) => {
    setEditingProblem({
      ...problem,
      tags: problem.tags || [],
      notes: problem.notes || null,
      externalUrl: problem.externalUrl || null,
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDifficultyFilter("all");
    setTopicFilter("all");
    setDateFilter(undefined);
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery ||
    difficultyFilter !== "all" ||
    topicFilter !== "all" ||
    dateFilter;

  // Get tags display
  const getTagsDisplay = (problem: Problem) => {
    const tags =
      problem.tags && problem.tags.length > 0 ? problem.tags : [problem.topic];
    return tags.map((t) => t.replace(/_/g, " ")).join(", ");
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }
    return pages;
  };

  // Mobile card component
  const ProblemCard = ({
    problem,
  }: {
    problem: Problem & { date: string };
  }) => (
    <Card className="bg-card/50 border-white/5">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate">{problem.name}</h3>
              {problem.externalUrl && (
                <a
                  href={problem.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary shrink-0"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {format(parseISO(problem.date), "MMM d, yyyy")}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300"
              onClick={() => handleEdit(problem)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Problem?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete &quot;{problem.name}&quot;.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeleteProblem(problem.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">
            {getTagsDisplay(problem)}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded border ${difficultyColors[problem.difficulty] ||
              "bg-zinc-500/10 text-zinc-400"
              }`}
          >
            {problem.difficulty}
          </span>
        </div>

        {problem.notes && (
          <div className="pt-2 border-t border-white/5">
            <RichTextViewer content={problem.notes} />
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen">
      <main className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-6 sm:py-8">
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search problems or notes..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleFilterChange();
                }}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={topicFilter}
                onValueChange={(v) => {
                  setTopicFilter(v);
                  handleFilterChange();
                }}
              >
                <SelectTrigger className="w-[140px] sm:w-[160px]">
                  <SelectValue placeholder="Topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {allTopics.map((topic) => (
                    <SelectItem key={topic} value={topic}>
                      {topic.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={difficultyFilter}
                onValueChange={(v) => {
                  setDifficultyFilter(v);
                  handleFilterChange();
                }}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="EASY">Easy</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HARD">Hard</SelectItem>
                </SelectContent>
              </Select>
              <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-[130px] justify-center font-normal ${!dateFilter ? "text-muted-foreground" : ""
                      }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFilter ? format(dateFilter, "MMM d") : "Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    mode="single"
                    selected={dateFilter}
                    onSelect={(d) => {
                      setDateFilter(d);
                      setDatePopoverOpen(false);
                      handleFilterChange();
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {hasActiveFilters && (
                <Button variant="ghost" size="icon" onClick={clearFilters}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {filteredProblems.length} problem
              {filteredProblems.length !== 1 ? "s" : ""}
              {hasActiveFilters && " (filtered)"}
            </span>
          </div>

          {filteredProblems.length === 0 ? (
            <div className="p-8 border border-dashed border-border rounded-xl text-center text-muted-foreground">
              No problems found.
            </div>
          ) : (
            <>
              {/* Mobile: Card layout */}
              <div className="md:hidden space-y-3">
                {paginatedProblems.map((problem) => (
                  <ProblemCard key={problem.id} problem={problem} />
                ))}
              </div>

              {/* Desktop: Table layout */}
              <Card className="hidden md:block bg-card/50 border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/5 hover:bg-transparent">
                        <TableHead className="w-[80px]">Date</TableHead>
                        <TableHead>Problem</TableHead>
                        <TableHead className="w-[150px]">Topics</TableHead>
                        <TableHead className="w-[80px]">Difficulty</TableHead>
                        <TableHead className="w-[80px] text-center">Notes</TableHead>
                        <TableHead className="w-[80px] text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedProblems.map((problem) => (
                        <TableRow
                          key={problem.id}
                          className="border-white/5 hover:bg-white/5"
                        >
                          <TableCell className="text-xs text-muted-foreground font-mono">
                            {format(parseISO(problem.date), "MMM d")}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {problem.name}
                              </span>
                              {problem.externalUrl && (
                                <a
                                  href={problem.externalUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-muted-foreground hover:text-primary"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground">
                              {getTagsDisplay(problem)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`text-xs px-2 py-0.5 rounded border ${difficultyColors[problem.difficulty] ||
                                "bg-zinc-500/10 text-zinc-400"
                                }`}
                            >
                              {problem.difficulty}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {problem.notes ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                                onClick={() => setViewingNotes({ name: problem.name, notes: problem.notes! })}
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            ) : (
                              <span className="text-muted-foreground italic">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300"
                                onClick={() => handleEdit(problem)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete Problem?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete &quot;
                                      {problem.name}&quot;.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteProblem(problem.id)
                                      }
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>

              {/* Pagination with page numbers */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 sm:gap-2 pt-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {getPageNumbers().map((page, idx) =>
                    typeof page === "number" ? (
                      <Button
                        key={idx}
                        variant={currentPage === page ? "default" : "outline"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ) : (
                      <span key={idx} className="px-2 text-muted-foreground">
                        {page}
                      </span>
                    )
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingProblem}
        onOpenChange={(open) => !open && setEditingProblem(null)}
      >
        <DialogContent className="max-w-xl p-0 border-0 bg-transparent shadow-none">
          <DialogTitle className="sr-only">Edit Problem</DialogTitle>
          <DialogDescription className="sr-only">
            Edit your logged problem details
          </DialogDescription>
          <div className="pointer-events-auto">
            {editingProblem && (
              <ProblemLogger
                initialData={{
                  id: editingProblem.id,
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

      {/* Notes Viewing Modal */}
      <Dialog open={!!viewingNotes} onOpenChange={(open) => !open && setViewingNotes(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0 bg-[#1a1b1e] border-white/10">
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#1a1b1e]">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-400" />
              {viewingNotes?.name}
            </DialogTitle>
            <DialogDescription className="sr-only">
              View problem notes
            </DialogDescription>
          </div>

          <div
            className="flex-1 min-h-0 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent overscroll-contain"
            onWheel={(e) => e.stopPropagation()}
          >
            {viewingNotes?.notes && (
              <div className="prose prose-invert prose-sm max-w-none prose-headings:text-purple-300 prose-a:text-purple-400">
                <RichTextViewer content={viewingNotes.notes} />
              </div>
            )}
          </div>

          <div className="p-4 border-t border-white/5 bg-[#1a1b1e]/50 flex justify-end">
            <Button variant="outline" onClick={() => setViewingNotes(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
