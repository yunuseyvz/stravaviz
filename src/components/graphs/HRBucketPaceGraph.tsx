"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useUser } from "@/context/UserContext";
import { useYear } from "@/context/YearContext";

interface PaceData {
  date: string;
  movingAveragePace: number;
}

const HRBucketPaceGraph = () => {
  const { selectedUser } = useUser();
  const { selectedYear } = useYear();

  // Ensure we have a user and a year.
  if (!selectedUser || !selectedYear) {
    return <p>No user or year selected.</p>;
  }

  // States for HR min and HR max, moving average window and fetched data.
  const [hrMin, setHrMin] = useState<number>(120);
  const [hrMax, setHrMax] = useState<number>(140);
  const [windowDays, setWindowDays] = useState<number>(3);
  const [data, setData] = useState<PaceData[]>([]);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch data whenever the dependencies change.
  useEffect(() => {
    fetchData(selectedUser.StravaId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser, selectedYear, hrMin, hrMax, windowDays]);

  async function fetchData(selectedUser :string) {
    try {
      setIsLoading(true);
      setError("");

      // Construct the URL with query parameters.
      const url = `/api/athletes/${selectedUser}/correlation?hr_min=${hrMin}&hr_max=${hrMax}&window=${windowDays}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Request failed with status: ${res.status}`);
      }
      const result: PaceData[] = await res.json();

      // Filter on the client for the selected year.
      const filtered = result.filter((d) => {
        const year = new Date(d.date).getFullYear();
        return year === selectedYear;
      });
      setData(filtered);
    } catch (err: any) {
      console.error("Error fetching HR bucket pace data:", err);
      setError(err.message || "Failed to fetch data.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">
        HR Bucket Average Pace (Moving Average)
      </h2>
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label htmlFor="hrMin" className="block font-medium">
            Heart Rate Minimum: {hrMin}
          </label>
          <input
            id="hrMin"
            type="range"
            min="100"
            max="200"
            step="5"
            value={hrMin}
            onChange={(e) => setHrMin(parseInt(e.target.value, 10))}
          />
        </div>

        <div>
          <label htmlFor="hrMax" className="block font-medium">
            Heart Rate Maximum: {hrMax}
          </label>
          <input
            id="hrMax"
            type="range"
            min="100"
            max="200"
            step="5"
            value={hrMax}
            onChange={(e) => setHrMax(parseInt(e.target.value, 10))}
          />
        </div>

        <div>
          <label htmlFor="windowDays" className="block font-medium">
            Moving Average Window (days): {windowDays}
          </label>
          <input
            id="windowDays"
            type="number"
            min="1"
            max="30"
            value={windowDays}
            onChange={(e) => setWindowDays(parseInt(e.target.value, 10))}
            className="border rounded p-1 w-20"
          />
        </div>
      </div>

      {!isLoading && data.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(tick) => new Date(tick).toLocaleDateString()}
            />
            <YAxis
              label={{
                value: "Moving Avg Pace (min/km)",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="movingAveragePace"
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default HRBucketPaceGraph;
