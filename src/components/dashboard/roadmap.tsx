"use client";

import { Check, Lock } from "lucide-react";

// Duolingo-style roadmap data based on Striver A2Z structure
const ROADMAP_TOPICS = [
  { id: "basics", name: "Basics", icon: "🌱", problems: 10, unlocked: true },
  { id: "sorting", name: "Sorting", icon: "🔄", problems: 8, unlocked: true },
  { id: "arrays", name: "Arrays", icon: "📊", problems: 35, unlocked: true },
  {
    id: "binary-search",
    name: "Binary Search",
    icon: "🔍",
    problems: 15,
    unlocked: true,
  },
  { id: "strings", name: "Strings", icon: "📝", problems: 20, unlocked: false },
  {
    id: "linked-lists",
    name: "Linked Lists",
    icon: "🔗",
    problems: 18,
    unlocked: false,
  },
  {
    id: "recursion",
    name: "Recursion",
    icon: "🔁",
    problems: 12,
    unlocked: false,
  },
  {
    id: "stacks-queues",
    name: "Stacks & Queues",
    icon: "📚",
    problems: 16,
    unlocked: false,
  },
  {
    id: "binary-trees",
    name: "Binary Trees",
    icon: "🌳",
    problems: 25,
    unlocked: false,
  },
  { id: "graphs", name: "Graphs", icon: "🕸️", problems: 30, unlocked: false },
  {
    id: "dp",
    name: "Dynamic Programming",
    icon: "🧩",
    problems: 40,
    unlocked: false,
  },
  { id: "greedy", name: "Greedy", icon: "💰", problems: 12, unlocked: false },
];

interface RoadmapProps {
  completedTopics?: string[];
  currentTopic?: string;
}

export function Roadmap({
  completedTopics = [],
  currentTopic = "basics",
}: RoadmapProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-muted-foreground">
        Your Journey
      </h2>

      <div className="relative">
        {/* Connector line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/50 to-transparent -translate-x-1/2 z-0" />

        {/* Nodes */}
        <div className="relative z-10 space-y-3">
          {ROADMAP_TOPICS.map((topic, index) => {
            const isCompleted = completedTopics.includes(topic.id);
            const isCurrent = topic.id === currentTopic;
            const isLocked = !topic.unlocked && !isCompleted;

            // Alternate left and right
            const isLeft = index % 2 === 0;

            return (
              <div
                key={topic.id}
                className={`flex items-center gap-3 ${
                  isLeft ? "flex-row" : "flex-row-reverse"
                }`}
              >
                {/* Content card */}
                <div
                  className={`flex-1 sheet-card card-hover rounded-xl p-3 ${
                    isCurrent ? "border-purple-500 border" : ""
                  } ${isLocked ? "opacity-50" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{topic.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">
                        {topic.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {topic.problems} problems
                      </p>
                    </div>
                    {isCompleted && (
                      <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                    {isLocked && (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Center node */}
                <div
                  className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? "bg-green-500"
                      : isCurrent
                      ? "bg-purple-500 ring-4 ring-purple-500/30"
                      : isLocked
                      ? "bg-muted"
                      : "bg-card border border-border"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 text-white" />
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}
                </div>

                {/* Empty spacer for alignment */}
                <div className="flex-1" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
