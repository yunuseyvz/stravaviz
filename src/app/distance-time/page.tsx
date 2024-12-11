"use client";
import MonthlyDistanceChart from "@/components/graphs/monthly-distance-chart";

export default function data1() {

  return (
    <div className="flex items-center justify-center p-8 sm:p-20">
      <div className= "w-3/4 -translate-y-36">
        <MonthlyDistanceChart/>
      </div>
    </div>
  );
}