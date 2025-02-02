"use client";
import MonthlyDistanceChart from "@/components/graphs/monthly-distance-chart";
import BlurFade from "@/components/ui/blur-fade";
import Link from "next/link"; 
import { ArrowLeft } from "lucide-react";

export default function data1() {

  return (
    <div className="flex items-center justify-center p-8 sm:p-20">
      <div className= "w-3/4 -translate-y-36">
      <div className="flex justify-center items-center mb-4">
        <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="mr-1" /> Back
        </Link>
      </div>
      <BlurFade>
        <MonthlyDistanceChart/>
      </BlurFade>
      </div>
    </div>
  );
}