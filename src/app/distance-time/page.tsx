"use client";
import MonthlyDistanceChart from "@/components/graphs/monthly-distance-chart";
import BlurFade from "@/components/ui/blur-fade";

export default function data1() {

  return (
    <div className="items-center justify-center p-8 sm:p-20">
      <BlurFade>
        <MonthlyDistanceChart/>
      </BlurFade>
    </div>
  );
}