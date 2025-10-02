"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Scatter
} from "recharts";
import { useUser } from "@/context/UserContext";
import { useYear } from "@/context/YearContext";

interface CorrelationRecord {
  filename: string;
  start_time: string; // ISO
  end_time: string;   // ISO
  correlation_rolling_30s: number;
  slope_threshold: number;
  rolling_window_sec: number;
}

const HeartRatePaceCorrelationTrend = () => {
  const { selectedUser } = useUser();
  const { selectedYear } = useYear();

  const [data, setData] = useState<CorrelationRecord[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedUser) return;
    fetchCorrelationData(selectedUser.StravaId);
  }, [selectedUser]);

  async function fetchCorrelationData(athleteId: string) {
    try {
      setError("");
      const response = await fetch(`/api/athletes/${athleteId}/correlation`);
      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    }
  }

  // Transform data for chart
  // For example, use the run's start_time as the x-axis
  const chartData = data.map((item) => {
    const startDate = new Date(item.start_time);
    return {
      date: startDate.toLocaleDateString(),   // or toLocaleString() if you prefer
      correlation: item.correlation_rolling_30s
    };
  });

  return (
    <div className="my-4">
      <h2 className="text-xl font-semibold">HR vs. Pace Correlation Over Time</h2>
      {error && <p className="text-red-500">{error}</p>}
      {data.length === 0 && !error && (
        <p>No correlation data found for this athlete.</p>
      )}
      {data.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" angle={-20} textAnchor="end" />
            <YAxis 
              domain={[-1, 1]} 
              label={{ value: "Pearson R", angle: -90, position: "insideLeft" }}
            />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="correlation"
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Scatter dataKey="correlation" fill="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default HeartRatePaceCorrelationTrend;
