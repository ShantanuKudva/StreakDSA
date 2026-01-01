"use client";

import { ExternalLink } from "lucide-react";
import { CardSpotlight } from "@/components/ui/card-spotlight";

interface DSASheet {
  id: string;
  name: string;
  description: string;
  url: string;
  problemCount: number;
  color: string;
}

const DSA_SHEETS: DSASheet[] = [
  {
    id: "striver-a2z",
    name: "Striver A2Z",
    description: "450+ Problems",
    url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2",
    problemCount: 455,
    color: "from-orange-500 to-red-500",
  },
  {
    id: "striver-sde",
    name: "Striver SDE",
    description: "191 Problems",
    url: "https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems",
    problemCount: 191,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "neetcode-150",
    name: "NeetCode 150",
    description: "150 Problems",
    url: "https://neetcode.io/practice",
    problemCount: 150,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "blind-75",
    name: "Blind 75",
    description: "75 Must-Do",
    url: "https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions",
    problemCount: 75,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "grind-75",
    name: "Grind 75",
    description: "75 Problems",
    url: "https://www.techinterviewhandbook.org/grind75",
    problemCount: 75,
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: "leetcode-top",
    name: "LC Top 100",
    description: "100 Liked",
    url: "https://leetcode.com/studyplan/top-100-liked/",
    problemCount: 100,
    color: "from-indigo-500 to-purple-500",
  },
];

export function DSASheets() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-muted-foreground">
          DSA Sheets
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {DSA_SHEETS.map((sheet) => (
          <a
            key={sheet.id}
            href={sheet.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <CardSpotlight
              className="h-full p-4 transition-all hover:border-purple-500/50"
              color="rgba(168, 85, 247, 0.15)"
            >
              <div className="flex items-start justify-between mb-2">
                <div
                  className={`w-2 h-2 rounded-full bg-gradient-to-r ${sheet.color}`}
                />
                <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="font-semibold text-sm text-foreground mb-1">
                {sheet.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {sheet.description}
              </p>
            </CardSpotlight>
          </a>
        ))}
      </div>
    </div>
  );
}
