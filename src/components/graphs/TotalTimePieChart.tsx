// src/components/TotalTimePieChart.tsx

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

// Define a set of colors for the pie slices
const COLORS = [
  "#8884d8",
  "#8dd1e1",
  "#82ca9d",
  "#a4de6c",
  "#d0ed57",
  "#ffc658",
  "#ff8042",
  "#d0ed57",
  "#a4de6c",
  "#82ca9d",
];

const TotalTimePieChart = () => {
  const { selectedUser } = useUser();
  const { selectedYear } = useYear();
  const [data, setData] = useState<{ activityType: string; totalTime: number }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!selectedUser || !selectedYear) return;
    fetchTotalTimeByActivityType(selectedUser.StravaId, selectedYear);
  }, [selectedUser, selectedYear]);

  async function fetchTotalTimeByActivityType(athleteId: string, year: number) {
    try {
      setIsLoading(true);
      setError("");

      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      const url = `/api/athletes/${athleteId}/metrics?metric=time&startDate=${startDate}&endDate=${endDate}&groupBy=activityType`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
      }

      const result = await response.json();
      const transformed = transformAggregatedData(result.aggregatedData);

      setData(transformed);
    } catch (error: any) {
      console.error("Error fetching total time by activity type:", error);
      setError(error.message || "Failed to fetch data.");
    } finally {
      setIsLoading(false);
    }
  }

  function transformAggregatedData(
    aggregatedData: { activityType: string; totalTime: number }[]
  ) {
    // Transform the data to match Recharts' expected format
    return aggregatedData.map((item) => ({
      activityType: item.activityType,
      totalTime: item.totalTime, // in hours
    }));
  }

  // Function to assign colors to each activity type
  const renderColors = (index: number) => COLORS[index % COLORS.length];

  // Calculate total hours across all activity types
  const totalHours = data.reduce((acc, curr) => acc + curr.totalTime, 0);

  return (
    <div className="flex flex-col items-center my-8">
      <h2 className="text-xl font-semibold mb-4">
        Total Activity Time by Activity Type ({selectedYear})
      </h2>
      {error && <p className="text-red-500">{error}</p>}
      {isLoading && <p>Loading...</p>}
      {!isLoading && !error && data.length === 0 && (
        <p>No data available for {selectedYear}.</p>
      )}
      {!isLoading && !error && data.length > 0 && (
        <div className="relative w-full max-w-md">
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                dataKey="totalTime"
                nameKey="activityType"
                cx="50%"
                cy="50%"
                outerRadius={150}
                fill="#8884d8"
                // Remove slice labels
                label={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={renderColors(index)} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `${value} hours`}
                contentStyle={{ backgroundColor: "#f5f5f5", borderRadius: "5px" }}
              />
              {/* Position the legend at the bottom */}
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ marginTop: "20px" }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Display total hours in the center of the pie chart */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-lg font-semibold">Total Hours</p>
              <p className="text-2xl font-bold">{totalHours.toFixed(2)}h</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TotalTimePieChart;
