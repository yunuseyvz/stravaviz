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

const MonthlyDistanceChart = () => {
  const labelFontSize = 10;
  const labelComponent = <VictoryTooltip style={{ fontSize: labelFontSize }} />;
  
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
    { "x": 1, "y": 3 },
    { "x": 2, "y": 5 },
  ];

  return (
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
  );
};

export default MonthlyDistanceChart;