// pages/heatmap.tsx
import MapComponent from "@/components/map";
import React from "react";

const MapPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <MapComponent />
    </div>
  );
};

export default MapPage;
