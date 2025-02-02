"use client";
import Link from "next/link"; 
import { ArrowLeft } from "lucide-react";
import CaloriesFoodChartWithYear from "@/components/graphs/calories-food-chart-with-year";
import BlurFade from "@/components/ui/blur-fade";
import YearSelector from "@/components/YearSelector";

export default function Data2() {
  return (
    <div className="flex flex-col items-center w-full p-8 sm:p-20 space-y-8">
      <div className="w-full max-w-2xl">
        <div className="flex justify-center items-center mb-4">
          <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="mr-1" /> Back
          </Link>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Calorie expenditure vs. food</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Compare the calories you burn from sports to the amount of food you could eat while maintaining your weight.
          </p>
        </div>
      </div>
      <YearSelector />
      <div className="w-full">
        <BlurFade>
          <CaloriesFoodChartWithYear/>
        </BlurFade>
      </div>
    </div>
  );
}
