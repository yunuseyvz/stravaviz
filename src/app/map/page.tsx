// pages/map.tsx

import React from "react";
import MapComponent from "@/components/map"; // Adjust the path if your component is located elsewhere

const MapPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen p-8 pb-20 sm:p-20">
      <MapComponent />
    </div>
  );
};

export default MapPage;
