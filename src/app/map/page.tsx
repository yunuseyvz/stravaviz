// pages/heatmap.tsx

"use client";

import dynamic from "next/dynamic";
import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BlurFade from "@/components/ui/blur-fade";

// Dynamically import the MapComponent, disabling SSR
const MapComponent = dynamic(() => import("@/components/map"), { ssr: false });

const MapPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center w-full p-8 sm:p-20 space-y-8">
    <div className="text-center max-w-2xl">
      <div className="flex justify-center items-center mb-4">
        <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="mr-1" /> Back
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-4">Interactive Map</h1>
      <p className="text-gray-600 dark:text-gray-300">
        Explore your workout routes on an interactive map. 
      </p>
    </div>
    <div className="w-full">
      <BlurFade>
        <MapComponent/>
      </BlurFade>
    </div>
  </div>
  );
};

export default MapPage;
