"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";

const MapComponent: React.FC = () => {
  const mapRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (mapRef.current) {
      const svg = d3.select(mapRef.current);
      const width = 800;
      const height = 600;

      // Clear previous content
      svg.selectAll("*").remove();

      // Append a group element to hold the map
      const g = svg.append("g");

      // Define projection and path generator
      const projection = d3
        .geoMercator()
        .scale(width / (2 * Math.PI))
        .translate([width / 2, height / 2]);

      const path = d3.geoPath().projection(projection);

      // Define zoom behavior
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([1, 8]) // Minimum and maximum zoom levels
        .on("zoom", (event) => {
          g.attr("transform", event.transform);
        });

      // Apply zoom behavior to the SVG
      svg.call(zoom as any); // Type casting due to TypeScript

      // Disable the default double-click zoom behavior
      svg.on("dblclick.zoom", null);

      // Function to handle click events on countries
      const handleCountryClick = (event: any, d: any) => {
        const [[x0, y0], [x1, y1]] = path.bounds(d);
        const dx = x1 - x0;
        const dy = y1 - y0;
        const x = (x0 + x1) / 2;
        const y = (y0 + y1) / 2;
        const scale = Math.min(8, 0.9 / Math.max(dx / width, dy / height));
        const translate: [number, number] = [width / 2 - scale * x, height / 2 - scale * y];

        svg.transition()
          .duration(750)
          .call(
            zoom.transform,
            d3.zoomIdentity
              .translate(translate[0], translate[1])
              .scale(scale),
            d3.pointer(event, svg.node())
          );
      };

      // Function to handle double-click events for zooming out
      const handleDoubleClick = (event: any) => {
        svg.transition()
          .duration(750)
          .call(
            zoom.transform,
            d3.zoomIdentity, // Reset to initial zoom
            d3.pointer(event, svg.node())
          );
      };

      // Attach double-click handler to the SVG
      svg.on("dblclick", handleDoubleClick);

      // Load and display the world map
      d3.json("https://d3js.org/world-50m.v1.json").then((worldData: any) => {
        const geojson = topojson.feature(
          worldData,
          worldData.objects.countries
        ) as unknown as GeoJSON.FeatureCollection;
        
        const countries = geojson.features;

        g.selectAll("path")
          .data(countries)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("fill", "#ccc")
          .attr("stroke", "#333")
          .on("mouseover", function () {
            d3.select(this).attr("fill", "#aaa");
          })
          .on("mouseout", function () {
            d3.select(this).attr("fill", "#ccc");
          })
          .on("click", handleCountryClick); // Add click handler
      }).catch(error => {
        console.error("Error loading the map data:", error);
      });
    }
  }, []);

  return (
    <svg
      ref={mapRef}
      width="800"
      height="600"
      style={{ border: "1px solid black", cursor: "grab" }}
    ></svg>
  );
};

export default MapComponent;
