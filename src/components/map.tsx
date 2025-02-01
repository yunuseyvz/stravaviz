"use client";

import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useUser } from "@/context/UserContext";

// --- Helper Functions & Components ---

// Returns a random color
const getRandomColor = () => {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
};

// Adjusts map bounds when geoData changes
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

// Listens to map events and calls onUpdate with the current view (center and zoom)
function MapEvents({
  onUpdate,
}: {
  onUpdate: (center: [number, number], zoom: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const updateView = () => {
      const center = map.getCenter();
      onUpdate([center.lat, center.lng], map.getZoom());
    };
    map.on("moveend zoomend", updateView);
    // Update immediately on mount
    updateView();
    return () => {
      map.off("moveend zoomend", updateView);
    };
  }, [map, onUpdate]);

  return null;
}

// --- Main Map Component ---

export default function MapComponent() {
  const { selectedUser } = useUser();
  const athleteId = selectedUser?.StravaId;

  // State for toggling the "smooth" parameter
  const [smooth, setSmooth] = useState(false);

  // Fetched GeoJSON data
  const [geoData, setGeoData] = useState<any>(null);

  // Persist the map view (center and zoom) across MapContainer remounts.
  // Using a ref ensures that its value survives re-renders/remounts of the MapContainer.
  const mapViewRef = useRef<{ center: [number, number]; zoom: number }>({
    center: [0, 0],
    zoom: 2,
  });

  // Build URL for fetching GeoJSON data
  const geojsonUrl = `/api/athletes/${athleteId}/geojson?file=all_activities.geojson&smooth=${smooth}`;

  // Fetch GeoJSON when athleteId or smooth changes
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

  // Create a unique key for the MapContainer using athleteId and smooth.
  // This forces a remount of MapContainer on user or mode change.
  const mapKey = `map-${athleteId}-${smooth}`;

  // Optional cleanup: reset Leaflet's internal container on unmount.
  useEffect(() => {
    return () => {
      const container = document.getElementById("map-container");
      if (container && (container as any)._leaflet_id) {
        (container as any)._leaflet_id = null;
      }
    };
  }, [mapKey]);

  // Style function for GeoJSON features
  const styleFeature = () => ({
    color: getRandomColor(),
    weight: 3,
  });

  // Attach popups to each GeoJSON feature
  const onEachFeature = (feature: any, layer: L.Layer) => {
    const name = feature.properties?.name || "Unnamed Activity";
    layer.bindPopup(`<b>${name}</b>`);
  };

  return (
    <div style={{ width: "100%", height: "600px" }}>
      {/* Toggle Button */}
      <button
        onClick={() => setSmooth((prev) => !prev)}
        style={{ marginBottom: "10px", padding: "8px 16px", cursor: "pointer" }}
      >
        Toggle Smooth = {smooth ? "ON" : "OFF"}
      </button>

      {athleteId && (
        <MapContainer
          key={mapKey} // Forces remount on user or mode change.
          id="map-container" // For cleanup purposes.
          center={mapViewRef.current.center}
          zoom={mapViewRef.current.zoom}
          scrollWheelZoom={true}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {geoData && (
            <GeoJSON
              data={geoData}
              style={styleFeature}
              onEachFeature={onEachFeature}
            />
          )}

          {geoData && <AutoBounds geoData={geoData} />}

          {/* Listen to map events to update the persistent view */}
          <MapEvents
            onUpdate={(center, zoom) => {
              mapViewRef.current = { center, zoom };
            }}
          />
        </MapContainer>
      )}
    </div>
  );
}
