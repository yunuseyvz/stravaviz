import React, { useState, useEffect } from "react";
import {
  VictoryAxis,
  VictoryChart,
  VictoryGroup,
  VictoryLine,
  VictoryScatter,
  VictoryTheme,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from "victory";
import { Checkbox, FormControlLabel } from "@mui/material";
import { useUser } from "@/context/UserContext"; // Adjust import as needed

// Your original color arrays
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

const MonthlyDistanceChart = () => {
  const { selectedUser } = useUser(); 
  const [dataPerYear, setDataPerYear] = useState<
    { year: number; data: { x: string; y: number }[] }[]
  >([]);
  const [visibleYears, setVisibleYears] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!selectedUser) return;
    fetchMonthlyDistances(selectedUser.StravaId);
  }, [selectedUser]);

  async function fetchMonthlyDistances(athleteId: string) {
    try {
      setIsLoading(true);

      // For example, we want data from Jan 2017 through Dec 2024
      const startYear = 2017;
      const endYear = 2024;
      const startDate = `${startYear}-01-01`;
      const endDate = `${endYear}-12-31`;

      // GET /api/athletes/:athleteId/metrics?metric=distance&startDate=...&endDate=...
      const url = `/api/athletes/${athleteId}/metrics?metric=distance&startDate=${startDate}&endDate=${endDate}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
      }

      // The shape: { metric: "distance", aggregatedData: [{ month: "YYYY-MM", totalDistance: number }, ...] }
      const result = await response.json();

      // Transform into the shape: 
      // [ { year: 2017, data: [ { x: "Jan", y: 1.23 }, ... ] }, ... ]
      const transformed = transformAggregatedData(result.aggregatedData);

      setDataPerYear(transformed);
      // By default, set all years to visible
      setVisibleYears(transformed.map(({ year }) => year));
    } catch (error) {
      console.error("Error fetching monthly distances:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Convert data from the endpoint into year-based arrays for Victory
  function transformAggregatedData(
    aggregatedData: { month: string; totalDistance: number }[]
  ) {
    // dataMap: { "2017": [{ x: "Jan", y: 123 }, ...], "2018": [...], ... }
    const dataMap: Record<string, { x: string; y: number }[]> = {};

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

    aggregatedData.forEach((item) => {
      // item.month is "YYYY-MM"
      const [yearStr, monStr] = item.month.split("-");
      const monthIndex = parseInt(monStr, 10) - 1;
      const monthLabel = monthNames[monthIndex] || "???";

      // Convert meters to kilometers
      const distanceInKm = item.totalDistance / 1000;

      if (!dataMap[yearStr]) {
        dataMap[yearStr] = [];
      }
      dataMap[yearStr].push({
        x: monthLabel,
        y: distanceInKm,
      });
    });

    // Create a sorted array from the year keys
    return Object.keys(dataMap)
      .sort()
      .map((yearStr) => ({
        year: parseInt(yearStr, 10),
        data: dataMap[yearStr],
      }));
  }

  // Find the highest distance across all data for y-axis maximum
  function getMaxMonthlyDistance() {
    let maxVal = 0;
    dataPerYear.forEach(({ data }) => {
      data.forEach((dp) => {
        if (dp.y > maxVal) maxVal = dp.y;
      });
    });
    return maxVal;
  }

  const handleCheckboxChange = (year: number) => {
    setVisibleYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

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
  const pointSize = 2;
  const activePointSize = 3;

  return (
    <div className="flex flex-col items-center">
      {isLoading && <p>Loading data...</p>}

      <VictoryChart
        containerComponent={<VictoryVoronoiContainer />}
        theme={VictoryTheme.clean}
      >
        <VictoryAxis dependentAxis tickValues={yTickValues} style={tickStyle} />
        <VictoryAxis tickValues={xTickValues} style={tickStyle} />

        {dataPerYear.map(({ year, data }) =>
          visibleYears.includes(year) ? (
            <VictoryGroup
              key={year}
              labels={({ datum }) => `${datum.x}: ${datum.y.toFixed(2)} km`}
              labelComponent={labelComponent}
              data={data}
              color={
                scatterColorPerYear.find((colorData) => colorData.year === year)
                  ?.color
              }
            >
              <VictoryLine
                style={{
                  data: {
                    stroke: lineColorPerYear.find(
                      (colorData) => colorData.year === year
                    )?.color,
                  },
                }}
              />
              <VictoryScatter
                size={({ active }) => (active ? activePointSize : pointSize)}
              />
            </VictoryGroup>
          ) : null
        )}
      </VictoryChart>

      {/* Checkboxes to toggle each year's visibility */}
      <div className="flex justify-center -mt-14 z-40 flex-wrap">
        {dataPerYear.map(({ year }) => (
          <div
            className="mx-2 px-2 rounded-md shadow-sm"
            style={{
              backgroundColor: lineColorPerYear.find(
                (colorData) => colorData.year === year
              )?.color,
            }}
            key={year}
          >
            <FormControlLabel
              control={
                <Checkbox
                  onChange={() => handleCheckboxChange(year)}
                  checked={visibleYears.includes(year)}
                  sx={{
                    color: scatterColorPerYear.find(
                      (colorData) => colorData.year === year
                    )?.color,
                    "&.Mui-checked": {
                      color: scatterColorPerYear.find(
                        (colorData) => colorData.year === year
                      )?.color,
                    },
                  }}
                />
              }
              label={year}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthlyDistanceChart;
