"use client";
import TotalTimePieChart from "@/components/graphs/ActivityMetricsPieChart";
import ActivityMetricPieChart from "@/components/graphs/ActivityMetricsPieChart";
import MonthlyDistanceChart from "@/components/graphs/ActivityMetricsPieChart";
import BlurFade from "@/components/ui/blur-fade";

export default function data1() {
  return (
    <div className="flex items-center justify-center p-8 sm:p-20">
      <div className="w-1/2 translate-y-10">
        <BlurFade>
          <ActivityMetricPieChart />
        </BlurFade>
      </div>
    </div>
  );
}
