"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Plus,
  Loader2,
  Link as LinkIcon,
  X,
  Tag,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { TopicDisplayNames } from "@/lib/validators";
import { cn } from "@/lib/utils";

export interface ProblemData {
  id?: string;
  topic: string;
  name: string;
  difficulty: string;
  externalUrl?: string;
  tags?: string[];
  notes?: string;
}

interface ProblemLoggerProps {
  initialData?: ProblemData | null;
  onCancel?: () => void;
  onLogProblem: (
    data: ProblemData
  ) => Promise<{ success: boolean; error?: { message: string } }>;
  showCloseButton?: boolean;
}

export function ProblemLogger({
  initialData,
  onCancel,
  onLogProblem,
  showCloseButton = true,
}: ProblemLoggerProps) {
  // Logger state
  const [isOpen, setIsOpen] = useState(!!initialData);
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState(initialData?.name || "");
  const [difficulty, setDifficulty] = useState<string>(
    initialData?.difficulty || ""
  );
  const [externalUrl, setExternalUrl] = useState(
    initialData?.externalUrl || ""
  );

  // New fields
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialData?.tags || []
  );
  const [customTagInput, setCustomTagInput] = useState("");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [comboboxOpen, setComboboxOpen] = useState(false);

  // Sync state with initialData if it changes (e.g. user clicks Edit on different problem)
  // This is crucial if the component is always mounted
  useEffect(() => {
    setName(initialData?.name || "");
    setDifficulty(initialData?.difficulty || "");
    setExternalUrl(initialData?.externalUrl || "");
    setSelectedTags(initialData?.tags || []);
    setNotes(initialData?.notes || "");
    setIsOpen(!!initialData); // Open if initialData is provided, close otherwise
  }, [initialData]);

  const predefinedTopics = Object.entries(TopicDisplayNames).map(
    ([key, label]) => ({
      value: key,
      label,
    })
  );

  const handleAddTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  const handleCustomTagKeydown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = customTagInput.trim();
      if (tag) {
        handleAddTag(tag);
        setCustomTagInput("");
      }
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (onCancel) {
      onCancel();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !difficulty) {
      toast.error("Please fill in Name and Difficulty");
      return;
    }

    if (selectedTags.length === 0) {
      toast.error("Please select at least one Topic or add a Tag");
      return;
    }

    setIsLoading(true);
    try {
      const result = await onLogProblem({
        topic: selectedTags[0], // Fallback mapping
        name,
        difficulty,
        externalUrl: externalUrl || undefined,
        tags: selectedTags,
        notes: notes || undefined,
      });

      if (result.success) {
        toast.success("Problem logged!");
        setName("");
        setDifficulty("");
        setExternalUrl("");
        setSelectedTags([]);
        setNotes("");
        setIsOpen(false);
      } else if (result.error) {
        toast.error(result.error.message);
      }
    } catch {
      toast.error("Failed to log problem");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <CardSpotlight
        className="p-0 transition-all hover:border-purple-500/50"
        color="rgba(168, 85, 247, 0.15)"
      >
        <button
          onClick={() => setIsOpen(true)}
          className="w-full h-full p-4 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="font-medium">Log a Problem</span>
        </button>
      </CardSpotlight>
    );
  }

  return (
    <CardSpotlight
      className="p-6 animate-in fade-in slide-in-from-bottom-4 transition-all hover:border-purple-500/50"
      color="rgba(168, 85, 247, 0.15)"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg flex items-center gap-2 text-white">
          <Tag className="h-5 w-5 text-purple-400" />
          {initialData ? "Edit Problem" : "Log Solved Problem"}
        </h3>
        {showCloseButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ... (keep existing form fields but ensure text contrast) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="difficulty" className="text-sm text-gray-300">
              Difficulty <span className="text-red-400">*</span>
            </Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger
                id="difficulty"
                className="bg-[#1a1b1e]/50 border-white/10 text-white"
              >
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="EASY"
                  className="text-emerald-500 font-medium"
                >
                  Easy
                </SelectItem>
                <SelectItem
                  value="MEDIUM"
                  className="text-amber-500 font-medium"
                >
                  Medium
                </SelectItem>
                <SelectItem value="HARD" className="text-red-500 font-medium">
                  Hard
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm text-gray-300">
              Problem Name <span className="text-red-400">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Two Sum"
              className="bg-[#1a1b1e]/50 border-white/10 text-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-gray-300">
            Tags <span className="text-red-400">*</span>
          </Label>
          <div className="flex flex-col gap-2">
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="w-full justify-between bg-[#1a1b1e]/50 border-white/10 text-left font-normal text-white"
                >
                  <span
                    className={
                      selectedTags.length === 0 ? "text-muted-foreground" : ""
                    }
                  >
                    Select tags...
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search tag..." />
                  <CommandList>
                    <CommandEmpty>No tag found.</CommandEmpty>
                    <CommandGroup>
                      {predefinedTopics.map((topic) => (
                        <CommandItem
                          key={topic.value}
                          value={topic.label}
                          onSelect={() => {
                            handleAddTag(topic.value);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedTags.includes(topic.value)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {topic.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <Input
              placeholder="Or type custom tag and press Enter..."
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              onKeyDown={handleCustomTagKeydown}
              className="bg-[#1a1b1e]/50 border-white/10 text-white text-sm"
            />

            {/* Selected Tags Display */}
            <div className="flex flex-wrap gap-2 mt-1">
              {selectedTags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center gap-1 bg-purple-500/20 border border-purple-500/30 px-2 py-1 rounded-md text-xs font-medium text-purple-200"
                >
                  {TopicDisplayNames[tag as keyof typeof TopicDisplayNames] ||
                    tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-purple-300 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="url" className="text-sm text-gray-300">
            Problem Link{" "}
            <span className="text-xs text-muted-foreground">(Optional)</span>
          </Label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="url"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://leetcode.com/problems/..."
              className="pl-9 bg-[#1a1b1e]/50 border-white/10 text-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm text-gray-300">
            Notes / Approach
          </Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Time complexity: O(n)..."
            className="bg-[#1a1b1e]/50 border-white/10 text-white min-h-[80px]"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : initialData ? (
            "Update Problem"
          ) : (
            "Log Problem"
          )}
        </Button>
      </form>
    </CardSpotlight>
  );
}
