"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { useUser } from "@/context/UserContext";

/**
 * MapComponent
 * ------------
 * 1. Loads a world map (countries) from world-atlas.
 * 2. Overlays user's aggregated GeoJSON activities (all_activities.geojson).
 * 3. Supports zooming, dragging, and double-click reset.
 */
const MapComponent: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { selectedUser } = useUser(); // From your context

  useEffect(() => {
    // If no user selected or no SVG ref, skip
    if (!selectedUser || !svgRef.current) return;

    // Basic dimensions
    const width = 900;
    const height = 600;

    // Select the SVG and clear any previous content
    const svg = d3.select(svgRef.current).attr("viewBox", `0 0 ${width} ${height}`);
    svg.selectAll("*").remove();

    // Append a background rectangle (optional, for a consistent background color)
    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#181818"); // a dark background

    // Append a group for all map/paths
    const g = svg.append("g");

    // Define a projection and path generator
    const projection = d3
      .geoMercator()
      // scale tuned for a typical 900x600 viewport
      .scale(140)
      .translate([width / 2, height / 1.5]); // shift the map center

    const pathGenerator = d3.geoPath().projection(projection);

    // Define a zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    // Apply zoom behavior and disable double-click for zoom
    svg.call(zoom as any);
    svg.on("dblclick.zoom", null);

    // Double-click to reset
    svg.on("dblclick", () => {
      svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity);
    });

    // 1) Load the world map
    //    Using a fairly detailed "countries-110m" from world-atlas
    const worldMapUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

    d3.json(worldMapUrl).then((worldData: any) => {
      // Convert TopoJSON to GeoJSON
      const countries = topojson.feature(worldData, worldData.objects.countries) as unknown as GeoJSON.FeatureCollection;

      // Draw countries
      g.selectAll("path.country")
        .data(countries.features)
        .enter()
        .append("path")
        .attr("class", "country")
        .attr("d", pathGenerator as any)
        .attr("fill", "#333") // dark fill
        .attr("stroke", "#444") // slightly lighter stroke
        .attr("stroke-width", 0.5);

      // 2) Build URL for the aggregated user data
      const athleteId = selectedUser.StravaId;
      const geojsonUrl = `/api/athletes/${athleteId}/geojson?file=all_activities.geojson&smooth=false`;

      // 3) Fetch and overlay aggregated user activities
      d3.json(geojsonUrl).then((activitiesData: any) => {
        if (activitiesData && activitiesData.type === "FeatureCollection") {
          g.selectAll("path.activity")
            .data(activitiesData.features)
            .enter()
            .append("path")
            .attr("class", "activity")
            .attr("d", pathGenerator as any)
            .attr("fill", "none")
            .attr("stroke", "#ef476f") // bright pink/red
            .attr("stroke-width", 2)
            .attr("stroke-opacity", 0.7);
        }
      });
    });
  }, [selectedUser]);

  return (
    <svg
      ref={svgRef}
      // Style is optional; you can remove the fixed size if you'd prefer a responsive parent container
      style={{
        width: "100%",
        maxWidth: "900px",
        height: "600px",
        border: "1px solid #ccc",
        cursor: "grab"
      }}
    />
  );
};

export default MapComponent;
