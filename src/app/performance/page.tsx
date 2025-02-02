"use client";
import HeartRatePaceCorrelationTrend from "@/components/graphs/HeartRatePaceCorrelationTrend";
import HRBucketPaceGraph from "@/components/graphs/HRBucketPaceGraph";
import HRPaceScatter from "@/components/graphs/HRPaceScatter";
import PaceByHRZone from "@/components/graphs/PaceByHrZone";
import BlurFade from "@/components/ui/blur-fade";
import YearSelector from "@/components/YearSelector";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Data2() {
  return (
    <div className="flex flex-col items-center w-full p-8 sm:p-20 space-y-8">
      <div className="text-center max-w-2xl">
      <div className="flex justify-center items-center mb-4">
          <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="mr-1" /> Back
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-4">Performance</h1>
        <p className="text-gray-600 dark:text-gray-300">
          See how to relationship between heart rate and your running pace changes as you continue getting fitter
        </p>
      </div>
      <YearSelector />
      <div className="w-full">
        <BlurFade>
          <PaceByHRZone/>
        </BlurFade>
      </div>
    </div>
  );
}
