"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Scatter,
} from "recharts";
import { TbChartLine, TbChartBar } from "react-icons/tb";
import { useUser } from "@/context/UserContext";
import { useYear } from "@/context/YearContext";

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

const MonthlyDistanceChartWithYear = () => {
  const { selectedUser } = useUser();
  const { selectedYear } = useYear();
  const [data, setData] = useState<{ month: string; distance: number }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  useEffect(() => {
    if (!selectedUser || !selectedYear) return;
    fetchMonthlyDistances(selectedUser.StravaId, selectedYear);
  }, [selectedUser, selectedYear]);

  async function fetchMonthlyDistances(athleteId: string, year: number) {
    try {
      setIsLoading(true);
      setError("");

      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      const url = `/api/athletes/${athleteId}/metrics?metric=distance&startDate=${startDate}&endDate=${endDate}&groupBy=month`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
      }

      const result = await response.json();
      const transformed = transformAggregatedData(result.aggregatedData);

      setData(transformed);
    } catch (error: any) {
      console.error("Error fetching monthly distances:", error);
      setError(error.message || "Failed to fetch data.");
    } finally {
      setIsLoading(false);
    }
  }

  function transformAggregatedData(
    aggregatedData: { month: string; totalDistance: number }[]
  ) {
    const dataPoints: { month: string; distance: number }[] = [];

    aggregatedData.forEach((item) => {
      const [yearStr, monStr] = item.month.split("-");
      const monthIndex = parseInt(monStr, 10) - 1;
      const monthLabel = monthNames[monthIndex] || "???";
      const distanceInKm = item.totalDistance;

      dataPoints.push({
        month: monthLabel,
        distance: distanceInKm,
      });
    });

    monthNames.forEach((month) => {
      if (!dataPoints.find((data) => data.month === month)) {
        dataPoints.push({ month, distance: 0 });
      }
    });

    dataPoints.sort((a, b) => monthNames.indexOf(a.month) - monthNames.indexOf(b.month));

    return dataPoints;
  }

  function getMaxMonthlyDistance() {
    let maxVal = 0;
    data.forEach((dp) => {
      if (dp.distance > maxVal) maxVal = dp.distance;
    });
    return maxVal;
  }

  const maxY = getMaxMonthlyDistance();
  const increment = 250;
  const yTickValues = Array.from(
    { length: Math.ceil(maxY / increment) + 1 },
    (_, i) => i * increment
  );

  return (
    <div className="flex flex-col items-center">
      {error && <p className="text-red-500">{error}</p>}
      {!isLoading && !error && data.length === 0 && (
        <p>No data available for {selectedYear}.</p>
      )}
      {!isLoading && !error && data.length > 0 && (
        <>
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              <button
                onClick={() => setChartType('line')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${chartType === 'line'
                    ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-300'
                  }`}
              >
                <TbChartLine className="text-xl" />
                <span>Line</span>
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${chartType === 'bar'
                    ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-300'
                  }`}
              >
                <TbChartBar className="text-xl" />
                <span>Bar</span>
              </button>
            </div>
          </div>
          <ResponsiveContainer width="50%" height={600}>
            {chartType === 'line' ? (
              <LineChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" label={{ value: "Month", position: "insideBottomRight", offset: -5 }} />
                <YAxis label={{ value: "Distance (km)", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="distance"
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                />
                <Scatter dataKey="distance" />
              </LineChart>
            ) : (
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" label={{ value: "Month", position: "insideBottomRight", offset: -5 }} />
                <YAxis label={{ value: "Distance (km)", angle: -90, position: "insideLeft" }} />
                <Tooltip />
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