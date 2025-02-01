// pages/heatmap.tsx

"use client";

import dynamic from "next/dynamic";
import React from "react";

// Dynamically import the MapComponent, disabling SSR
const MapComponent = dynamic(() => import("@/components/map"), { ssr: false });

const MapPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <MapComponent />
    </div>
  );
};

export default MapPage;
