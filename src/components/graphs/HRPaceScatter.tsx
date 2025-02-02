"use client";

import React, { useState, useEffect } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useUser } from "@/context/UserContext";
import { useYear } from "@/context/YearContext";

interface HRPacePoint {
  timestamp: string;
  hr: number;
  pace: number; // originally in seconds/km
}

const HRPaceScatter = () => {
  const { selectedUser } = useUser();
  const { selectedYear } = useYear();

  const [data, setData] = useState<HRPacePoint[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Generate tick values for the x-axis in 10-second increments.
  // With reversed x-axis, we now want ticks starting at 4:00 (4.0 minutes) up to 7:30 (7.5 minutes)
  const paceTicks: number[] = [];
  const startSeconds = 4 * 60;     // 240 seconds (4:00)
  const endSeconds = 7.5 * 60;     // 450 seconds (7:30)
  for (let s = startSeconds; s <= endSeconds; s += 10) {
    paceTicks.push(s / 60);
  }

  // Generate tick values for the y-axis in 10 bpm increments.
  const hrTicks: number[] = [];
  for (let hr = 80; hr <= 200; hr += 10) {
    hrTicks.push(hr);
  }

  useEffect(() => {
    if (selectedUser && selectedYear) {
      fetchData(selectedUser.StravaId);
    }
  }, [selectedUser, selectedYear]);

  async function fetchData(athleteId: string) {
    setIsLoading(true);
    setError("");

    try {
      const url = `/api/athletes/${athleteId}/hr-pace-scatter?year=${selectedYear}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch scatter data.");
      }
      const result = await res.json();
      // Convert each pace value from seconds to minutes.
      const convertedData = result.map((item: HRPacePoint) => ({
        ...item,
        pace: item.pace / 60,
      }));
      setData(convertedData);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }

  // Tick formatter for the x-axis: converts a minute value into mm:ss format.
  const formatPaceTick = (value: number) => {
    const totalSeconds = Math.round(value * 60);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!selectedUser || !selectedYear) {
    return <p>Please select a user and a year to view the chart.</p>;
  }

  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!isLoading && data.length === 0 && (
        <div className="p-4 mb-4 text-sm text-yellow-800 bg-yellow-100 rounded-lg border border-yellow-300 max-w-56 mx-auto" role="alert">
          No data available for {selectedYear}.
        </div>
      )}

      {!isLoading && data.length > 0 && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <ResponsiveContainer width="70%" height={500}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              {/* X axis: pace in minutes per km, reversed so that 4:00 is on the left and 7:30 on the right */}
              <XAxis
                type="number"
                dataKey="pace"
                name="Pace"
                unit=" min/km"
                domain={[4, 7.5]}
                ticks={paceTicks}
                tickFormatter={formatPaceTick}
              />
              {/* Y axis: heart rate in bpm, ticks every 10 bpm (ascending order) */}
              <YAxis
                type="number"
                dataKey="hr"
                name="Heart Rate"
                unit=" bpm"
                domain={[120, 200]}
                ticks={hrTicks}
              />
              <Scatter name="HR vs. Pace" data={data} fill="#8884d8" isAnimationActive={false} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default HRPaceScatter;
