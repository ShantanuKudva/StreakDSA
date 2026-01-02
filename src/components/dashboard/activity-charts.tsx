"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { Activity } from "lucide-react";

interface ActivityData {
  date: string;
  problems: number;
  checkInTime: string | null;
}

interface ActivityChartsProps {
  data: ActivityData[];
}

export function ActivityCharts({ data = [] }: ActivityChartsProps) {
  // Process data for check-in time chart
  const problemsData = (data || []).map((d) => ({
    ...d,
    shortDate: d?.date ? d.date.split("-").slice(1).join("/") : "",
  }));

  return (
    <div className="w-full">
      {/* Problems Solved Line Chart */}
      <CardSpotlight
        className="p-4 transition-all hover:border-purple-500/50"
        color="rgba(168, 85, 247, 0.15)"
      >
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-purple-400" />
          <span className="text-sm font-medium">Problems Solved</span>
        </div>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={problemsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e2e2e" vertical={false} />
              <XAxis 
                dataKey="shortDate" 
                stroke="#666" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#666" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: "#1a1b1e", border: "1px solid #2e2e2e", borderRadius: "8px", fontSize: "12px" }}
                itemStyle={{ color: "#a855f7" }}
              />
              <Line 
                type="monotone" 
                dataKey="problems" 
                stroke="#a855f7" 
                strokeWidth={2} 
                dot={{ fill: "#a855f7", r: 3 }} 
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardSpotlight>
    </div>
  );
}
