"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useUser } from "@/context/UserContext";

// Updated color generator with a fixed palette that avoids green and yellow
const colorPalette = [
  "#FF5733", // Reddish
  "#C70039", // Deep red
  "#900C3F", // Dark red
  "#581845", // Purple
  "#0074D9", // Blue
  "#FF4136", // Orange red
  "#B10DC9", // Purple
  "#001f3f", // Navy
];
const getRandomColor = () => {
  return colorPalette[Math.floor(Math.random() * colorPalette.length)];
};

// A helper component that updates the map bounds whenever geoData changes
function AutoBounds({ geoData }: { geoData: any }) {
  const map = useMap();

  useEffect(() => {
    if (geoData) {
      const geojsonLayer = L.geoJSON(geoData);
      map.fitBounds(geojsonLayer.getBounds(), { padding: [20, 20] });
    }
  }, [geoData, map]);

  return null;
}

export default function MapComponent() {
  const { selectedUser } = useUser();
  const athleteId = selectedUser?.StravaId;

  // Always smooth the GeoJSON
  const smooth = true;

  // Our fetched GeoJSON data
  const [geoData, setGeoData] = useState(null);

  // Construct the URL for our combined GeoJSON (all activities)
  const geojsonUrl = `/api/athletes/${athleteId}/geojson?file=all_activities.geojson&smooth=${smooth}`;

  // Fetch the data when athleteId changes
  useEffect(() => {
    if (!athleteId) return;

    fetch(geojsonUrl)
      .then((res) => res.json())
      .then((data) => {
        setGeoData(data);
      })
      .catch((error) => {
        console.error("Error fetching GeoJSON:", error);
      });
  }, [geojsonUrl, athleteId]);

  // Cleanup effect: on unmount, reset the Leaflet ID from the container if present.
  useEffect(() => {
    return () => {
      const container = document.getElementById("map-container");
      if (container && (container as any)._leaflet_id) {
        (container as any)._leaflet_id = null;
      }
    };
  }, []);

  // Style each feature with a random color
  const styleFeature = () => ({
    color: getRandomColor(),
    weight: 3,
  });

  // Show popups for each activity feature:
  const onEachFeature = (feature: any, layer: L.Layer) => {
    const name = feature.properties?.name || "Unnamed Activity";
    layer.bindPopup(`<b>${name}</b>`);
  };

  return (
    <div style={{ width: "100%", height: "600px" }}>
      {athleteId && (
        <MapContainer
          id="map-container" // assign a fixed ID to the container
          style={{ width: "100%", height: "100%" }}
          center={[0, 0]}
          zoom={2}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {geoData && (
            <GeoJSON
              key={JSON.stringify(geoData)}
              data={geoData}
              style={styleFeature}
              onEachFeature={onEachFeature}
            />
          )}

    
        </MapContainer>
      )}
    </div>
  );
}
