"use client";

import React, { useState, useEffect } from "react";
import {
  VictoryAxis,
  VictoryChart,
  VictoryLine,
  VictoryScatter,
  VictoryTheme,
  VictoryTooltip,
  VictoryVoronoiContainer,
  VictoryLabel
} from "victory";
import { useUser } from "@/context/UserContext";
import { useYear } from "@/context/YearContext";

const scatterColorPerYear = [
  { year: 2017, color: "#f43134" },
  { year: 2018, color: "#f26b1f" },
  { year: 2019, color: "#f3a016" },
  { year: 2020, color: "#f5d93f" },
  { year: 2021, color: "#9ad165" },
  { year: 2022, color: "#31ba9b" },
  { year: 2023, color: "#3a7c97" },
  { year: 2024, color: "#5b4791" },
];

const lineColorPerYear = [
  { year: 2017, color: "#fbadae" },
  { year: 2018, color: "#fac4a5" },
  { year: 2019, color: "#fad9a2" },
  { year: 2020, color: "#fbf0b2" },
  { year: 2021, color: "#d7edc1" },
  { year: 2022, color: "#ade3d7" },
  { year: 2023, color: "#b0cbd5" },
  { year: 2024, color: "#bdb5d3" },
];

const MonthlyDistanceChartWithYear = () => {
  const { selectedUser } = useUser();
  const { selectedYear } = useYear();
  const [data, setData] = useState<{ x: string; y: number }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

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

      // GET /api/athletes/:athleteId/metrics?metric=distance&startDate=...&endDate=...
      const url = `/api/athletes/${athleteId}/metrics?metric=distance&startDate=${startDate}&endDate=${endDate}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
      }

      // The shape: { metric: "distance", aggregatedData: [{ month: "YYYY-MM", totalDistance: number }, ...] }
      const result = await response.json();

      // Transform into the shape: [ { x: "Jan", y: 1.23 }, ... ]
      const transformed = transformAggregatedData(result.aggregatedData);

      setData(transformed);
    } catch (error: any) {
      console.error("Error fetching monthly distances:", error);
      setError(error.message || "Failed to fetch data.");
    } finally {
      setIsLoading(false);
    }
  }

  // Convert data from the endpoint into month-based array for Victory
  function transformAggregatedData(
    aggregatedData: { month: string; totalDistance: number }[]
  ) {
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

    const dataPoints: { x: string; y: number }[] = [];

    aggregatedData.forEach((item) => {
      // item.month is "YYYY-MM"
      const [yearStr, monStr] = item.month.split("-");
      const monthIndex = parseInt(monStr, 10) - 1;
      const monthLabel = monthNames[monthIndex] || "???";

      // Convert meters to kilometers
      const distanceInKm = item.totalDistance / 1000;

      dataPoints.push({
        x: monthLabel,
        y: distanceInKm,
      });
    });

    // Sort data points by month
    dataPoints.sort(
      (a, b) =>
        monthNames.indexOf(a.x) - monthNames.indexOf(b.x)
    );

    return dataPoints;
  }

  // Find the highest distance across data for y-axis maximum
  function getMaxMonthlyDistance() {
    let maxVal = 0;
    data.forEach((dp) => {
      if (dp.y > maxVal) maxVal = dp.y;
    });
    return maxVal;
  }

  // Prepare y-axis ticks
  const maxY = getMaxMonthlyDistance();
  const increment = 250; // Adjust based on typical monthly distances
  const yTickValues = Array.from(
    { length: Math.ceil(maxY / increment) + 1 },
    (_, i) => i * increment
  );

  // Standard x-axis months
  const xTickValues = [
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

  const tickStyle = {
    tickLabels: {
      fontSize: 8,
    },
    ticks: {
      stroke: "#757575",
      size: 5,
    },
  };

  // Victory components
  const labelComponent = <VictoryTooltip style={{ fontSize: 7 }} />;
  const pointSize = 4;
  const activePointSize = 6;

  // Determine colors based on selected year
  const scatterColor =
    scatterColorPerYear.find((c) => c.year === selectedYear)?.color ||
    "#000000";
  const lineColor =
    lineColorPerYear.find((c) => c.year === selectedYear)?.color ||
    "#000000";

  return (
    <div className="flex flex-col items-center">
      {/* {isLoading && <p>Loading data...</p>} */}
      {error && <p className="text-red-500">{error}</p>}
      {!isLoading && !error && data.length === 0 && (
        <p>No data available for {selectedYear}.</p>
      )}
      {!isLoading && !error && data.length > 0 && (
        <VictoryChart
          containerComponent={<VictoryVoronoiContainer />}
          theme={VictoryTheme.material}
          domainPadding={{ x: 20, y: [0, 20] }}
        >
          <VictoryAxis
            dependentAxis
            tickValues={yTickValues}
            style={tickStyle}
            label="Distance (km)"
            axisLabelComponent={<VictoryLabel dy={-30} />}
          />
          <VictoryAxis
            tickValues={xTickValues}
            style={tickStyle}
            label="Month"
            axisLabelComponent={<VictoryLabel dy={30} />}
          />

          <VictoryLine
            data={data}
            style={{
              data: { stroke: lineColor },
            }}
          />

          <VictoryScatter
            data={data}
            size={({ active }) => (active ? activePointSize : pointSize)}
            style={{ data: { fill: scatterColor } }}
            labels={({ datum }) => `${datum.x}: ${datum.y.toFixed(2)} km`}
            labelComponent={labelComponent}
          />
        </VictoryChart>
      )}
    </div>
  );
};

export default MonthlyDistanceChartWithYear;
