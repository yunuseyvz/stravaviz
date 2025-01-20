import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useUser } from "@/context/UserContext"; // Adjust import as needed

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

const MonthlyDistanceChart = () => {
  const { selectedUser } = useUser();
  const [dataPerYear, setDataPerYear] = useState<
    { year: number; data: { month: string; distance: number }[] }[]
  >([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!selectedUser) return;
    fetchMonthlyDistances(selectedUser.StravaId);
  }, [selectedUser]);

  async function fetchMonthlyDistances(athleteId: string) {
    try {
      setIsLoading(true);

      const startYear = 2017;
      const endYear = 2024;
      const startDate = `${startYear}-01-01`;
      const endDate = `${endYear}-12-31`;

      const url = `/api/athletes/${athleteId}/metrics?metric=distance&startDate=${startDate}&endDate=${endDate}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
      }

      const result = await response.json();
      console.log("API Response:", result); // Log the raw data from the API
      const transformed = transformAggregatedData(result.aggregatedData);

      setDataPerYear(transformed);
      setSelectedYear(transformed.length > 0 ? transformed[0].year : null);
    } catch (error) {
      console.error("Error fetching monthly distances:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function transformAggregatedData(
    aggregatedData: { month: string; totalDistance: number }[]
  ) {
    const dataMap: Record<string, { month: string; distance: number }[]> = {};

    aggregatedData.forEach((item) => {
      const [yearStr, monStr] = item.month.split("-");
      const monthIndex = parseInt(monStr, 10) - 1;
      const monthLabel = monthNames[monthIndex] || "???";
      const distanceInKm = item.totalDistance / 1000;

      if (!dataMap[yearStr]) {
        dataMap[yearStr] = [];
      }
      dataMap[yearStr].push({
        month: monthLabel,
        distance: distanceInKm,
      });
    });

    // Ensure all months are included
    Object.keys(dataMap).forEach((yearStr) => {
      const yearData = dataMap[yearStr];
      monthNames.forEach((month) => {
        if (!yearData.find((data) => data.month === month)) {
          yearData.push({ month, distance: 0 });
        }
      });
      yearData.sort((a, b) => monthNames.indexOf(a.month) - monthNames.indexOf(b.month));
    });

    return Object.keys(dataMap)
      .sort()
      .map((yearStr) => ({
        year: parseInt(yearStr, 10),
        data: dataMap[yearStr],
      }));
  }

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(event.target.value, 10));
  };

  return (
    <div className="flex flex-col items-center">
      {isLoading && <p>Loading data...</p>}

      <div className="mb-4">
        <label htmlFor="year-select" className="mr-2 text-gray-900 dark:text-gray-100">
          Select Year:
        </label>
        <select
          id="year-select"
          value={selectedYear ?? ""}
          onChange={handleYearChange}
          className="form-select px-3 py-2 border rounded-md shadow-sm dark:bg-gray-800 dark:text-gray-100"
        >
          {dataPerYear.map(({ year }) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <ResponsiveContainer width="60%" height={500}>
        <LineChart
          data={dataPerYear
            .filter(({ year }) => year === selectedYear)
            .flatMap(({ data }) => data)}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis label={{ value: "Distance (km)", angle: -90, position: "insideLeft", offset: -10 }} />
          <Tooltip />
          {dataPerYear
            .filter(({ year }) => year === selectedYear)
            .map(({ year, data }) => (
              <Line
                key={year}
                type="monotone"
                dataKey="distance"
                data={data}
                name={year.toString()}
                stroke={
                  scatterColorPerYear.find((colorData) => colorData.year === year)
                    ?.color
                }
                strokeWidth={3} // Set the stroke width to make the line thicker
                activeDot={{ r: 8 }}
              />
            ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyDistanceChart;