"use client";
import ActivityMetricPieChart from "@/components/graphs/ActivityMetricsPieChart";
import BlurFade from "@/components/ui/blur-fade";
import Link from "next/link"; 
import { ArrowLeft } from "lucide-react"; 

export default function data1() {
  return (
    <div className="flex flex-col items-center w-full p-8 sm:p-20 space-y-8">
      <div className="text-center max-w-2xl">
        <div className="flex justify-center items-center mb-4">
          <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="mr-1" /> Back
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-4">Total Activity Time</h1>
        <p className="text-gray-600 dark:text-gray-300">
          View your activity distribution across different types of exercises. 
          This pie chart breaks down the total time spent on each activity type, 
          helping you understand your workout preferences and balance.
        </p>
      </div>
      <div className="w-full max-w-2xl">
        <BlurFade>
          <ActivityMetricPieChart />
        </BlurFade>
      </div>
    </div>
  );
}