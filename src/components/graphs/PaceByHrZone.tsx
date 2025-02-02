"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useUser } from "@/context/UserContext";
import { useYear } from "@/context/YearContext";

export default function PaceByHRZone() {
  const { selectedUser } = useUser();
  const { selectedYear } = useYear();

  // Separate state variables for minimum and maximum HR.
  const [hrMin, setHrMin] = useState(120);
  const [hrMax, setHrMax] = useState(130);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState("");

  // Formatter to display pace (in minutes) as mm:ss.
  const formatPaceTick = (value: number) => {
    const totalSeconds = Math.round(value * 60);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  async function fetchDailyPace() {
    if (!selectedUser || !selectedYear) return;
    setError("");

    try {
      // Use the API endpoint with hrMin and hrMax.
      const url = `/api/athletes/${selectedUser.StravaId}/hr-pace-daily?year=${selectedYear}&hrMin=${hrMin}&hrMax=${hrMax}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch daily pace data");
      }
      const result = await res.json();

      // Convert pace values from seconds to minutes and compute the std deviation band.
      const convertedData = result.map((item: any) => {
        const movingAvgPace = item.movingAvgPace / 60;
        const dailyStdPace = item.dailyStdPace / 60;
        const lowerBound = movingAvgPace - dailyStdPace;
        const upperBound = movingAvgPace + dailyStdPace;
        return {
          ...item,
          dailyMeanPace: item.dailyMeanPace / 60,
          movingAvgPace,
          dailyStdPace,
          lowerBound,
          // stdBand is an array with [mean - std, mean + std]
          bandDelta: upperBound - lowerBound,
        };
      });
      setData(convertedData);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    }
  }

  // Re-fetch whenever the selected user, year, or HR values change.
  useEffect(() => {
    fetchDailyPace();
  }, [selectedUser, selectedYear, hrMin, hrMax]);

  // Compute the Y-axis domain with fixed defaults (7.5 to 4) unless data extends beyond.
  let yDomain: [number, number] = [7.5, 4]; // default upper and lower bounds
  if (data.length > 0) {
    // Determine the highest and lowest points considering the std deviation band.
    const upperValues = data.map((item) => item.movingAvgPace + item.dailyStdPace);
    const lowerValues = data.map((item) => item.movingAvgPace - item.dailyStdPace);
    const computedUpper = Math.max(...upperValues);
    const computedLower = Math.min(...lowerValues);
    const padding = 0.2;
    // Use the default bounds unless the data exceeds them.
    yDomain = [
      Math.max(7.5, computedUpper + padding),
      Math.min(4, computedLower - padding),
    ];
  }

  if (!selectedUser || !selectedYear) {
    return <p>Please select a user and a year.</p>;
  }

  return (
    <div >
      <h2 style={{ marginBottom: "1rem", display: "flex", justifyContent: "center", gap: "2rem" }}>
        Daily Pace (7-Day Moving Average) for HR Range ({hrMin} – {hrMax} bpm)
      </h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Updated container style */}
      <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "center", gap: "2rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Minimum HR: {hrMin} bpm
          </label>
          <input
            type="range"
            min="60"
            max="220"
            value={hrMin}
            onChange={(e) => {
              const value = Number(e.target.value);
              setHrMin(value);
              // Ensure the minimum does not exceed the maximum.
              if (value > hrMax) {
                setHrMax(value);
              }
            }}
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Maximum HR: {hrMax} bpm
          </label>
          <input
            type="range"
            min="60"
            max="220"
            value={hrMax}
            onChange={(e) => {
              const value = Number(e.target.value);
              setHrMax(value);
              // Ensure the maximum is not lower than the minimum.
              if (value < hrMin) {
                setHrMin(value);
              }
            }}
          />
        </div>
      </div>

      {data.length === 0 && (
        <div className="p-4 mb-4 text-sm text-yellow-800 bg-yellow-100 rounded-lg border border-yellow-300" role="alert">
          No data available for {selectedYear}.
        </div>
      )}

      {data.length > 0 && (
        // New container to center the chart
        <div style={{ display: "flex", justifyContent: "center" }}>
          <ResponsiveContainer width="70%" height={400}>
            <LineChart
              data={data}
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis
                domain={yDomain}
                tickFormatter={formatPaceTick}
                label={{
                  value: "Pace (min/km)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Legend />
              
              {/* Invisible area to set the base (lower bound) */}
              <Area
                type="monotone"
                dataKey="lowerBound"
                stackId="1"
                stroke="none"
                fill="transparent"
                isAnimationActive={false}
              />
              
              {/* Shaded area representing the band between lower and upper bounds */}
              <Area
            type="monotone"
            dataKey="lowerBound"
            stackId="1"
            stroke="none"
            fill="rgba(0,0,0,0)"  // Use a zero-opacity color instead of "transparent"
            isAnimationActive={false}
          />

          <Area
            type="monotone"
            dataKey="bandDelta"
            stackId="1"
            stroke="none"
            fill="#8884d8"
            fillOpacity={0.2}
            isAnimationActive={false}
          />

              
              {/* Line for the 7-day moving average pace */}
              <Line
                type="monotone"
                dataKey="movingAvgPace"
                stroke="#8884d8"
                dot={false}
                name="7-Day Moving Avg Pace"
                strokeWidth={3} // thicker line
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
