"use client";
import HeartRatePaceCorrelationTrend from "@/components/graphs/HeartRatePaceCorrelationTrend";
import BlurFade from "@/components/ui/blur-fade";

export default function Data2() {
  return (
    <div className="flex flex-col items-center w-full p-8 sm:p-20 space-y-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-3xl font-bold mb-4">Distance Over Time</h1>
        <p className="text-gray-600 dark:text-gray-300">
          See how to relationship between heart rate and your running pace changes as you continue getting fitter
        </p>
      </div>
      <div className="w-full">
        <BlurFade>
          <HeartRatePaceCorrelationTrend/>
        </BlurFade>
      </div>
    </div>
  );
}
