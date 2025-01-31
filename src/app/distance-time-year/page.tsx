"use client";
import MonthlyDistanceChartWithYear from "@/components/graphs/monthly-distance-chart-with-year";
import BlurFade from "@/components/ui/blur-fade";

export default function Data2() {
  return (
    <div className="flex flex-col items-center w-full p-8 sm:p-20 space-y-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-3xl font-bold mb-4">Distance Over Time</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Track your monthly distance achievements. This graph displays your total 
          distance covered in kilometers for each month, helping you visualize your 
          progress over time.
        </p>
      </div>
      <div className="w-2/3">
        <BlurFade>
          <MonthlyDistanceChartWithYear/>
        </BlurFade>
      </div>
    </div>
  );
}
