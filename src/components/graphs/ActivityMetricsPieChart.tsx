// src/components/ActivityMetricPieChart.tsx

"use client";

import React, { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
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
import { Clock, Ruler } from "lucide-react";

// Fallback color palette for any activity types not defined in the mapping.
const FALLBACK_COLORS = [
  "#4e79a7",
  "#f28e2c",
  "#e15759",
  "#76b7b2",
  "#59a14f",
  "#edc949",
  "#af7aa1",
  "#ff9da7",
  "#9c755f",
  "#2e5c8a",
  "#4c9b82",
  "#b07aa1",
  "#ff7c43",
];

// Fixed colors for specific activity types (both English and German)
const ACTIVITY_COLOR_MAP: Record<string, string> = {
  // English activity types
  "Ride": "#4e79a7",
  "Run": "#f28e2c",
  "Swim": "#e15759",
  "Virtual Ride": "#76b7b2",
  "Walk": "#59a14f",
  "Hike": "#edc949",
  // German activity types
  "Radfahrt": "#4e79a7",          // Ride
  "Lauf": "#f28e2c",              // Run
  "Schwimmen": "#e15759",         // Swim
  "Virtuelle Radfahrt": "#76b7b2", // Virtual Ride
  "Spaziergang": "#59a14f",        // Walk
  "Wandern": "#edc949",           // Hike
  // Additional German activity types
  "Gewichtstraining": "#af7aa1",
  "Klettern": "#ff9da7",
  "Ski Alpin": "#9c755f",
  "Skilanglaufen": "#2e5c8a",
  "Skitouren": "#4c9b82",
  "Training": "#b07aa1",
  "Virtueller Lauf": "#ff7c43",
};

type Metric = "time" | "distance";

// A simple fetcher function for SWR.
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Helper function to capitalize the first letter.
function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// A memoized chart component that uses fixed (or fallback) colors.
interface ChartProps {
  data: { activityType: string; totalMetric: number }[];
  tooltipFormatter: (value: number) => string;
  totalMetric: number;
  metric: Metric;
  labelTitle: string;
}

const Chart = React.memo(
  ({ data, tooltipFormatter, totalMetric, metric, labelTitle }: ChartProps) => {
    const getColor = (activityType: string, index: number) =>
      ACTIVITY_COLOR_MAP[activityType] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];

    return (
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
                <Cell key={`cell-${index}`} fill={getColor(entry.activityType, index)} />
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
        <div className="mt-4 text-center">
          <p className="text-lg font-semibold">{labelTitle}</p>
          <p className="text-2xl font-bold">
            {Math.round(totalMetric)} {metric === "time" ? "h" : "km"}
          </p>
        </div>
      </div>
    );
  }
);

const ActivityMetricPieChart = () => {
  const { selectedUser } = useUser();
  const { selectedYear } = useYear();
  const [metric, setMetric] = useState<Metric>("time"); // Default metric is "time"

  if (!selectedUser || !selectedYear) {
    return <div>Loading...</div>;
  }

  // Helper to build the API URL for a given year and metric.
  const buildUrl = (year: number, metric: Metric) => {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    return `/api/athletes/${selectedUser.StravaId}/metrics?metric=${metric}&startDate=${startDate}&endDate=${endDate}&groupBy=activityType`;
  };

  // Build URLs for both metrics for the current year.
  const timeUrl = buildUrl(selectedYear, "time");
  const distanceUrl = buildUrl(selectedYear, "distance");

  // Fetch data for both metrics concurrently.
  const { data: timeResult, error: timeError } = useSWR(timeUrl, fetcher);
  const { data: distanceResult, error: distanceError } = useSWR(distanceUrl, fetcher);

  // Prefetch data for neighboring years (current year ±1) for both metrics.
  useEffect(() => {
    const yearsToPrefetch = [selectedYear - 1, selectedYear + 1];
    yearsToPrefetch.forEach((year) => {
      const prefetchTimeUrl = buildUrl(year, "time");
      const prefetchDistanceUrl = buildUrl(year, "distance");
      mutate(prefetchTimeUrl, fetcher(prefetchTimeUrl), false);
      mutate(prefetchDistanceUrl, fetcher(prefetchDistanceUrl), false);
    });
  }, [selectedUser, selectedYear]);

  // Choose the data and error based on the selected metric.
  const result = metric === "time" ? timeResult : distanceResult;
  const error = metric === "time" ? timeError : distanceError;

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }
  if (!result) {
    return <div>Loading...</div>;
  }

  // Transform the aggregated data into the format required by the chart.
  const transformAggregatedData = (
    aggregatedData: {
      activityType: string;
      totalTime?: number;
      totalDistance?: number;
    }[],
    selectedMetric: Metric
  ) => {
    return aggregatedData.map((item) => ({
      activityType: item.activityType,
      totalMetric:
        item[`total${capitalize(selectedMetric)}` as "totalTime" | "totalDistance"] || 0,
    }));
  };

  const transformedData = transformAggregatedData(result.aggregatedData, metric);
  const totalMetricValue = transformedData.reduce(
    (acc, curr) => acc + curr.totalMetric,
    0
  );
  const labelTitle = metric === "time" ? "Total Hours" : "Total Distance (km)";
  const tooltipFormatter = (value: number) =>
    metric === "time" ? `${Math.round(value)} hours` : `${Math.round(value)} km`;

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-semibold mb-4">
        {capitalize(metric)} by Activity Type ({selectedYear})
      </h2>
      <div className="mb-4">
        <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          <button
            onClick={() => setMetric("time")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              metric === "time"
                ? "bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400"
                : "hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-300"
            }`}
          >
            <Clock className="text-xl" />
            <span>Time</span>
          </button>
          <button
            onClick={() => setMetric("distance")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              metric === "distance"
                ? "bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400"
                : "hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-300"
            }`}
          >
            <Ruler className="text-xl" />
            <span>Distance</span>
          </button>
        </div>
      </div>
      {transformedData.length === 0 ? (
        <div
          className="p-4 mb-4 text-sm text-yellow-800 bg-yellow-100 rounded-lg border border-yellow-300"
          role="alert"
        >
          No data available for {selectedYear}.
        </div>
      ) : (
        <Chart
          data={transformedData}
          tooltipFormatter={tooltipFormatter}
          totalMetric={totalMetricValue}
          metric={metric}
          labelTitle={labelTitle}
        />
      )}
    </div>
  );
};

export default ActivityMetricPieChart;
