"use client";
import CaloriesFoodChartWithYear from "@/components/graphs/calories-food-chart-with-year";
import BlurFade from "@/components/ui/blur-fade";

export default function Data2() {
  return (
    <div className="flex flex-col items-center w-full p-8 sm:p-20 space-y-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-3xl font-bold mb-4">Calorie expenditure vs. food</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Compare the calories you burn from sports to the amount of food you could eat while maintaining your weight.
        </p>
      </div>
      <div className="w-full">
        <BlurFade>
          <CaloriesFoodChartWithYear/>
        </BlurFade>
      </div>
    </div>
  );
}
