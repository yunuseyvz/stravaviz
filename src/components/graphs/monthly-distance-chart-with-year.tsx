// src/components/MonthlyDistanceChartWithYear.tsx

"use client";

import React, { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Scatter,
} from "recharts";
import { TbChartLine, TbChartBar } from "react-icons/tb";
import { useUser } from "@/context/UserContext";
import { useYear } from "@/context/YearContext";

// Month labels for the X-axis.
const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// A simple fetcher function for SWR.
const fetcher = (url: string) => fetch(url).then((res) => res.json());

const MonthlyDistanceChartWithYear = () => {
  const { selectedUser } = useUser();
  const { selectedYear } = useYear();
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  if (!selectedUser || !selectedYear) {
    return <div>Loading...</div>;
  }

  // Helper to build the API URL for a given year.
  const buildUrl = (year: number) => {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    return `/api/athletes/${selectedUser.StravaId}/metrics?metric=distance&startDate=${startDate}&endDate=${endDate}&groupBy=month`;
  };

  // URL for the current year.
  const url = buildUrl(selectedYear);

  // Prefetch data for the neighboring years (selectedYear - 1 and selectedYear + 1).
  useEffect(() => {
    const yearsToPrefetch = [selectedYear - 1, selectedYear + 1];
    yearsToPrefetch.forEach((year) => {
      const prefetchUrl = buildUrl(year);
      // This will load the data into SWR's cache without forcing a revalidation.
      mutate(prefetchUrl, fetcher(prefetchUrl), false);
    });
  }, [selectedUser, selectedYear]);

  // Use SWR to fetch and cache the monthly distance data.
  const { data: result, error } = useSWR(url, fetcher);

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }
  if (!result) {
    return <div>Loading...</div>;
  }

  // Transform the aggregated data into an array of data points.
  function transformAggregatedData(
    aggregatedData: { month: string; totalDistance: number }[]
  ) {
    const dataPoints: { month: string; distance: number }[] = [];

    aggregatedData.forEach((item) => {
      // Expecting the month in the format "YYYY-MM"
      const [, monStr] = item.month.split("-");
      const monthIndex = parseInt(monStr, 10) - 1;
      const monthLabel = monthNames[monthIndex] || "???";
      dataPoints.push({
        month: monthLabel,
        distance: item.totalDistance,
      });
    });

    // Ensure that every month is represented—even if its distance is 0.
    monthNames.forEach((month) => {
      if (!dataPoints.find((dp) => dp.month === month)) {
        dataPoints.push({ month, distance: 0 });
      }
    });

    // Sort the data in calendar order.
    dataPoints.sort((a, b) => monthNames.indexOf(a.month) - monthNames.indexOf(b.month));
    return dataPoints;
  }

  const data = transformAggregatedData(result.aggregatedData);

  // Determine the maximum distance to help set Y-axis ticks.
  const getMaxMonthlyDistance = () => {
    return data.reduce((max, dp) => (dp.distance > max ? dp.distance : max), 0);
  };
  const maxY = getMaxMonthlyDistance();
  const increment = 250;
  const yTickValues = Array.from({ length: Math.ceil(maxY / increment) + 1 }, (_, i) => i * increment);

  // Determine whether to show a warning if all data values are 0.
  const showWarning = data.length === 0 || data.every((dp) => dp.distance === 0);

  // Custom tooltip for the chart.
  const renderCustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="bg-white p-2 border rounded shadow dark:bg-gray-800">
        {payload[0].payload.month} <br />
        {`${payload[0].value} km`}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center">
      {error && <p className="text-red-500">{error}</p>}
      {showWarning && (
        <div
          className="p-4 mb-4 text-sm text-yellow-800 bg-yellow-100 rounded-lg border border-yellow-300"
          role="alert"
        >
          No data available for {selectedYear}.
        </div>
      )}
      {!showWarning && (
        <>
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              <button
                onClick={() => setChartType("line")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  chartType === "line"
                    ? "bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400"
                    : "hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-300"
                }`}
              >
                <TbChartLine className="text-xl" />
                <span>Line</span>
              </button>
              <button
                onClick={() => setChartType("bar")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  chartType === "bar"
                    ? "bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400"
                    : "hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-300"
                }`}
              >
                <TbChartBar className="text-xl" />
                <span>Bar</span>
              </button>
            </div>
          </div>
          <ResponsiveContainer width="70%" height={500}>
            {chartType === 'line' ? (
              <LineChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  label={{ value: "Month", position: "insideBottomRight", offset: -5 }}
                />
                <YAxis
                  ticks={yTickValues}
                  label={{ value: "Distance (km)", angle: -90, position: "insideLeft" }}
                />
                <Tooltip content={renderCustomTooltip} />
                <Line type="monotone" dataKey="distance" strokeWidth={3} activeDot={{ r: 8 }} />
                <Scatter dataKey="distance" />
              </LineChart>
            ) : (
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  label={{ value: "Month", position: "insideBottomRight", offset: -5 }}
                />
                <YAxis
                  ticks={yTickValues}
                  label={{ value: "Distance (km)", angle: -90, position: "insideLeft" }}
                />
                <Tooltip content={renderCustomTooltip} />
                <Bar dataKey="distance" fill="#8884d8" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
};

export default MonthlyDistanceChartWithYear;
