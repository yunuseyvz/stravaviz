'use client';
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const D3Graph = () => {
  const svgRef = useRef();

  useEffect(() => {
    const data = [12, 36, 45, 60, 20, 65, 75];

    const svg = d3.select(svgRef.current)
      .attr('width', 400)
      .attr('height', 200)
      .style('margin-top', '50')
      .style('overflow', 'visible');

    const xScale = d3.scaleBand()
      .domain(data.map((val, index) => index))
      .range([0, 400])
      .padding(0.5);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([200, 0]);

    const xAxis = d3.axisBottom(xScale).ticks(data.length);
    const yAxis = d3.axisLeft(yScale).ticks(5);

    svg.append('g')
      .call(xAxis)
      .attr('transform', 'translate(0, 200)');

    svg.append('g')
      .call(yAxis);

    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d, i) => xScale(i))
      .attr('y', yScale)
      .attr('width', xScale.bandwidth())
      .attr('height', val => 200 - yScale(val))
      .attr('fill', '#D33766');
  }, []);

  return <svg ref={svgRef}></svg>;
};

export default D3Graph;