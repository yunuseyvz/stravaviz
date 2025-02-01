"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Pizza, Candy, Sandwich} from "lucide-react";
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

const CaloriesFoodChartWithYear = () => {
  const { selectedUser } = useUser();
  const { selectedYear } = useYear();
  const [data, setData] = useState<{ month: string; calories: number }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [chartType, setChartType] = useState<'doener' | 'dubai' | 'pizza'>('doener');

  useEffect(() => {
    if (!selectedUser || !selectedYear) return;
    fetchMonthlyCalories(selectedUser.StravaId, selectedYear);
  }, [selectedUser, selectedYear]);

  async function fetchMonthlyCalories(athleteId: string, year: number) {
    try {
      setIsLoading(true);
      setError("");

      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      const url = `/api/athletes/${athleteId}/metrics?metric=calories&startDate=${startDate}&endDate=${endDate}&groupBy=month`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
      }

      const result = await response.json();
      const transformed = transformAggregatedData(result.aggregatedData);

      setData(transformed);
    } catch (error: any) {
      console.error("Error fetching monthly calories:", error);
      setError(error.message || "Failed to fetch data.");
    } finally {
      setIsLoading(false);
    }
  }

  function transformAggregatedData(
    aggregatedData: { month: string; totalCalories: number }[]
  ) {
    const dataPoints: { month: string; calories: number }[] = [];

    aggregatedData.forEach((item) => {
      const [yearStr, monStr] = item.month.split("-");
      const monthIndex = parseInt(monStr, 10) - 1;
      const monthLabel = monthNames[monthIndex] || "???";
      const calories = item.totalCalories;

      dataPoints.push({
        month: monthLabel,
        calories: calories,
      });
    });

    monthNames.forEach((month) => {
      if (!dataPoints.find((data) => data.month === month)) {
        dataPoints.push({ month, calories: 0 });
      }
    });

    dataPoints.sort((a, b) => monthNames.indexOf(a.month) - monthNames.indexOf(b.month));
    return dataPoints;
  }

  function getMaxMonthlyCalories() {
    let maxVal = 0;
    data.forEach((dp) => {
      if (dp.calories > maxVal) maxVal = dp.calories;
    });
    return maxVal;
  }

  const maxY = getMaxMonthlyCalories();
  const increment = 250;
  const yTickValues = Array.from(
    { length: Math.ceil(maxY / increment) + 1 },
    (_, i) => i * increment
  );

  function divideCaloriesByFood(foodCalories: number) {
    return data.map((dp) => ({
      ...dp,
      foodCalories,
      foodCount: Math.round(dp.calories / foodCalories),
    }));
  }
  
  const doenerCalories = 700
  const dubaiChocolateCalories = 800
  const pizzaCalories = 1500

  const dataWithDoener = divideCaloriesByFood(doenerCalories);
  const dataWithDubaiChocolate = divideCaloriesByFood(dubaiChocolateCalories);
  const dataWithPizza = divideCaloriesByFood(pizzaCalories);

  // Add a variable to get the corresponding food label
  const foodLabel = chartType === 'doener' ? 'Döner' : chartType === 'dubai' ? 'Dubai Chocolate' : 'Pizza';

  // Custom tooltip renderer to display "x {FoodName}"
  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="bg-white p-2 border rounded shadow dark:bg-gray-800">
        {payload[0].payload.month} <br />
        {`${payload[0].value} ${foodLabel}`}
      </div>
    );
  };

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
                onClick={() => setChartType('doener')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${chartType === 'doener'
                    ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-300'
                  }`}
              >
                <Sandwich className="text-xl" />
                <span>Döner</span>
              </button>
              <button
                onClick={() => setChartType('dubai')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${chartType === 'dubai'
                    ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-300'
                  }`}
              >
                <Candy className="text-xl" />
                <span>Dubai Chocolate</span>
              </button>
              <button
                onClick={() => setChartType('pizza')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${chartType === 'pizza'
                    ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-300'
                  }`}
              >
                <Pizza className="text-xl" />
                <span>Pizza</span>
              </button>
            </div>
          </div>
          <ResponsiveContainer width="50%" height={600}>
            {chartType === 'doener' ? (
              <BarChart
                data={dataWithDoener}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" label={{ value: "Month", position: "insideBottomRight", offset: -5 }} />
                <YAxis label={{ value: "Amount of doener (700 kcal)", angle: -90, position: "insideLeft" }} />
                <Tooltip content={renderCustomTooltip} />
                <Bar dataKey="foodCount" fill="#d99c5b" />
              </BarChart>
            ) : chartType === 'dubai' ? (
              <BarChart
                data={dataWithDubaiChocolate}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" label={{ value: "Month", position: "insideBottomRight", offset: -5 }} />
                <YAxis label={{ value: "Amount of dubai chocolate (800 kcal)", angle: -90, position: "insideLeft" }} />
                <Tooltip content={renderCustomTooltip} />
                <Bar dataKey="foodCount" fill="#9aba59" />
              </BarChart>
            ) : (
              <BarChart
                data={dataWithPizza}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" label={{ value: "Month", position: "insideBottomRight", offset: -5 }} />
                <YAxis label={{ value: "Amount of pizza (1500 kcal)", angle: -90, position: "insideLeft" }} />
                <Tooltip content={renderCustomTooltip} />
                <Bar dataKey="foodCount" fill="#d64949" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
};

export default CaloriesFoodChartWithYear;