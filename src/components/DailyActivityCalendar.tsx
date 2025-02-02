// src/components/DailyActivityCalendar.tsx

"use client";

import React, { useState, useEffect } from "react";
import ActivityCalendar from "react-activity-calendar";
import { useUser } from "@/context/UserContext";
import { useYear } from "@/context/YearContext";
import { ThemeInput } from "react-activity-calendar";
import MuiTooltip from "@mui/material/Tooltip";

// Updated interface to match react-activity-calendar's expected format
interface DailyActivity {
  date: string; // "YYYY-MM-DD"
  count: number; // in hours
  level: number; // 0 to 4
}

const DailyActivityCalendarComponent = () => {
  const { selectedUser } = useUser();
  const { selectedYear } = useYear();
  const [data, setData] = useState<DailyActivity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!selectedUser || !selectedYear) return;
    fetchDailyActivity(selectedUser.StravaId, selectedYear);
  }, [selectedUser, selectedYear]);

  async function fetchDailyActivity(athleteId: string, year: number) {
    try {
      setIsLoading(true);
      setError("");

      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      const url = `/api/athletes/${athleteId}/metrics?metric=time&startDate=${startDate}&endDate=${endDate}&groupBy=day`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
      }

      const result = await response.json();
      const transformed = transformAggregatedData(result.aggregatedData, year);

      setData(transformed);
    } catch (error: any) {
      console.error("Error fetching daily activity:", error);
      setError(error.message || "Failed to fetch data.");
    } finally {
      setIsLoading(false);
    }
  }

  function transformAggregatedData(
    aggregatedData: { date: string; totalTime: number }[],
    year: number
  ): DailyActivity[] {
    // Generate all dates for the year to include days with zero activity
    const dateSet = new Set(aggregatedData.map(item => item.date));
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    const allDates: DailyActivity[] = [];

    // Calculate totalTime for each day and assign levels
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      if (dateSet.has(dateStr)) {
        const activity = aggregatedData.find(item => item.date === dateStr);
        const count = activity ? Math.round(activity.totalTime * 100) / 100 : 0; // Retain two decimal places
        const level = calculateLevel(count);
        allDates.push({
          date: dateStr,
          count: count, // in hours
          level: level, // 0 to 4
        });
      } else {
        allDates.push({
          date: dateStr,
          count: 0,
          level: 0,
        });
      }
    }

    return allDates;
  }

  // Helper function to calculate level based on count
  function calculateLevel(count: number): number {
    if (count === 0) return 0;
    if (count <= 1) return 1;
    if (count <= 3) return 2;
    if (count <= 5) return 3;
    return 4;
  }

  // Calculate total hours across all days
  const totalHours = data.reduce((acc, curr) => acc + curr.count, 0);

  // Define a color theme for the calendar
  const minimalTheme: ThemeInput = {
    light: ['white', 'blue'],
    dark: ['lightgrey', 'blue'],
    // for `dark` the default theme will be used
  };

  // Determine if all days have 0 activity hours
  const showWarning = (!isLoading && !error && data.length > 0 && data.every((dp) => dp.count === 0));

  return (
    <div className="flex flex-col items-center my-8">
      <h2 className="text-xl font-semibold mb-4">
        Daily Activity Time ({selectedYear})
      </h2>
      {error && <p className="text-red-500">{error}</p>}
      {isLoading && <p>Loading...</p>}
      {showWarning && (
        <div className="p-4 mb-4 text-sm text-yellow-800 bg-yellow-100 rounded-lg border border-yellow-300" role="alert">
          No data available for {selectedYear}.
        </div>
      )}
      {!isLoading && !error && !showWarning && data.length > 0 && (
        <div className="w-full max-w-4xl">
          <ActivityCalendar
            data={data}
            theme={minimalTheme}
            showWeekdayLabels={['mon', 'fri']}
            weekStart={1}
            blockRadius={10}
            hideTotalCount={true}
            renderBlock={(block, activity) => (
              <MuiTooltip title={`${activity.count} hours on ${activity.date}`}>
                {block}
              </MuiTooltip>
            )}
          />
          {/* Display total hours */}
          <div className="mt-4 text-center">
            <p className="text-lg font-semibold">Total Hours: {Math.round(totalHours)}h</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyActivityCalendarComponent;
