"use client";
import MonthlyDistanceChartWithYear from "@/components/graphs/monthly-distance-chart-with-year";
import BlurFade from "@/components/ui/blur-fade";

export default function Data2() {
  return (
    <div className="flex items-center justify-center p-8 sm:p-20">
      <div className="w-3/4 -translate-y-36">
        <BlurFade>
          <MonthlyDistanceChartWithYear  />
        </BlurFade>
      </div>
    </div>
  );
}
