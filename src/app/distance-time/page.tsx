"use client";
import React from "react";
import {
  VictoryAxis,
  VictoryChart,
  VictoryGroup,
  VictoryLine,
  VictoryScatter,
  VictoryTheme,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from "victory";

export default function data1() {

  const labelFontSize = 10;
  const labelComponent = <VictoryTooltip style={{ fontSize: labelFontSize }}/>;
  
  const pointSize = 3;
  const activePointSize = 5;

  const yTickValues = [0, 1, 2, 3];
  const xTickValues = [0, 1, 2, 3, 4, 5, 6, 7];

  const tickStyle = {
    tickLabels: {
      fontSize: 8,
    },
    ticks: {
      stroke: "#757575",
      size: 5,
    },
  };

  const data = [
    { x: 0, y: 0 },
    { x: 1, y: 3 },
    { x: 2, y: 1 },
    { x: 3, y: 2 },
    { x: 4, y: 0 },
    { x: 5, y: 0 },
    { x: 6, y: 2 },
    { x: 7, y: 3 }
  ];

  return (
    <div className="flex items-center justify-center p-8 sm:p-20">
      <div className="w-1/2">
      <VictoryChart 
        containerComponent={<VictoryVoronoiContainer/>}
        theme={VictoryTheme.clean}
      >
        <VictoryAxis
          dependentAxis 
          tickValues={yTickValues}
          style={tickStyle}
        />
        <VictoryAxis
          tickValues={xTickValues}
          style={tickStyle}
        />

        <VictoryGroup
          labels={({ datum }) => `y: ${datum.y}`}
          labelComponent={labelComponent}
          data={data}
        >
          <VictoryLine/>
          <VictoryScatter
            size={({ active }) => active ? activePointSize : pointSize}
          />
        </VictoryGroup>
      </VictoryChart>
      </div>
    </div>
  );
}