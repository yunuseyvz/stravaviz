// src/components/ActivityMetricPieChart.tsx

"use client";

import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useUser } from "@/context/UserContext";
import { useYear } from "@/context/YearContext";
import { Clock, MapPin, Ruler } from "lucide-react"; // added import for icons

// Define a set of colors for the pie slices
const COLORS = [
  "#4e79a7", // Dark blue
  "#f28e2c", // Orange
  "#e15759", // Red
  "#76b7b2", // Teal
  "#59a14f", // Green
  "#edc949", // Yellow
  "#af7aa1", // Purple
  "#ff9da7", // Pink
  "#9c755f", // Brown
  "#2e5c8a", // Navy
  "#4c9b82", // Forest green
  "#b07aa1", // Mauve
  "#ff7c43", // Coral
  "#386cb0", // Royal blue
  "#7a5195", // Deep purple
  "#48a461", // Emerald
  "#e45756", // Crimson
  "#f1a340", // Golden
  "#6d4c41", // Coffee
];

type Metric = "time" | "distance";

const ActivityMetricPieChart = () => {
  const { selectedUser } = useUser();
  const { selectedYear } = useYear();
  const [metric, setMetric] = useState<Metric>("time"); // Default to 'time'
  const [data, setData] = useState<{ activityType: string; totalMetric: number }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!selectedUser || !selectedYear) return;
    fetchActivityMetrics(selectedUser.StravaId, selectedYear, metric);
  }, [selectedUser, selectedYear, metric]);

  async function fetchActivityMetrics(
    athleteId: string,
    year: number,
    selectedMetric: Metric
  ) {
    try {
      setIsLoading(true);
      setError("");

      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      const url = `/api/athletes/${athleteId}/metrics?metric=${selectedMetric}&startDate=${startDate}&endDate=${endDate}&groupBy=activityType`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
      }

      const result = await response.json();
      const transformed = transformAggregatedData(result.aggregatedData, selectedMetric);

      setData(transformed);
    } catch (error: any) {
      console.error("Error fetching activity metrics:", error);
      setError(error.message || "Failed to fetch data.");
    } finally {
      setIsLoading(false);
    }
  }

  function transformAggregatedData(
    aggregatedData: { activityType: string; totalTime?: number; totalDistance?: number }[],
    selectedMetric: Metric
  ) {
    return aggregatedData.map((item) => ({
      activityType: item.activityType,
      totalMetric: item[`total${capitalize(selectedMetric)}` as 'totalTime' | 'totalDistance'] || 0,
    }));
  }

  function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const renderColors = (index: number) => COLORS[index % COLORS.length];

  const totalMetric = data.reduce((acc, curr) => acc + curr.totalMetric, 0);

  const labelTitle = metric === "time" ? "Total Hours" : "Total Distance (km)";
  const tooltipFormatter = (value: number) =>
    metric === "time" ? `${Math.round(value)} hours` : `${Math.round(value)} km`;

  return (
    <div className="flex flex-col items-center my-8">
      <h2 className="text-xl font-semibold mb-4">
        {capitalize(metric)} by Activity Type ({selectedYear})
      </h2>

      <div className="mb-4">
        <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          <button
            onClick={() => setMetric("time")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${metric === "time"
              ? "bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400"
              : "hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-300"
              }`}
          >
            <Clock className="text-xl" />
            <span>Time</span>
          </button>
          <button
            onClick={() => setMetric("distance")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${metric === "distance"
              ? "bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400"
              : "hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-300"
              }`}
          >
            <Ruler className="text-xl" />
            <span>Distance</span>
          </button>
        </div>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {isLoading && <p>Loading...</p>}
      {!isLoading && !error && data.length === 0 && (
        <p>No data available for {selectedYear}.</p>
      )}
      {!isLoading && !error && data.length > 0 && (
        <div className="relative w-full max-w-4xl">
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                dataKey="totalMetric"
                nameKey="activityType"
                cx="50%"
                cy="50%"
                outerRadius={150}
                fill="#8884d8"
                label={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={renderColors(index)} />
                ))}
              </Pie>
              <Tooltip
                formatter={tooltipFormatter}
                contentStyle={{ backgroundColor: "#f5f5f5", borderRadius: "5px" }}
              />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                wrapperStyle={{
                  backgroundColor: "rgb(var(--background-rgb))",
                  borderRadius: "8px",
                  padding: "10px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  marginLeft: "20px",
                  color: "rgb(var(--foreground-rgb))",
                  border: "1px solid rgb(var(--border-rgb))",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Display total metric below the legend */}
          <div className="mt-4 text-center">
            <p className="text-lg font-semibold">{labelTitle}</p>
            <p className="text-2xl font-bold">
              {Math.round(totalMetric)} {metric === "time" ? "h" : "km"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityMetricPieChart;
