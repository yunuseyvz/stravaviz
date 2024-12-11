import React, { useState } from "react";
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
import { Checkbox, FormControlLabel } from "@mui/material";
import { monthlyDistanceIn2017 } from "../../data/ts/monthly-distance-in-2017";
import { monthlyDistanceIn2018 } from "../../data/ts/monthly-distance-in-2018";
import { monthlyDistanceIn2019 } from "../../data/ts/monthly-distance-in-2019";
import { monthlyDistanceIn2020 } from "../../data/ts/monthly-distance-in-2020";
import { monthlyDistanceIn2021 } from "../../data/ts/monthly-distance-in-2021";
import { monthlyDistanceIn2022 } from "../../data/ts/monthly-distance-in-2022";
import { monthlyDistanceIn2023 } from "../../data/ts/monthly-distance-in-2023";
import { monthlyDistanceIn2024 } from "../../data/ts/monthly-distance-in-2024";

const MonthlyDistanceChart = () => {
  const monthlyDistancesPerYear = [
    { year: 2017, data: monthlyDistanceIn2017 },
    { year: 2018, data: monthlyDistanceIn2018 },
    { year: 2019, data: monthlyDistanceIn2019 },
    { year: 2020, data: monthlyDistanceIn2020 },
    { year: 2021, data: monthlyDistanceIn2021 },
    { year: 2022, data: monthlyDistanceIn2022 },
    { year: 2023, data: monthlyDistanceIn2023 },
    { year: 2024, data: monthlyDistanceIn2024 },
  ];

  const scatterColorPerYear = [
    { year: 2017, color: "#f43134" },
    { year: 2018, color: "#f26b1f" },
    { year: 2019, color: "#f3a016" },
    { year: 2020, color: "#f5d93f" },
    { year: 2021, color: "#9ad165" },
    { year: 2022, color: "#31ba9b" },
    { year: 2023, color: "#3a7c97" },
    { year: 2024, color: "#5b4791" },
  ];

  const lineColorPerYear = [
    { year: 2017, color: "#fbadae" },
    { year: 2018, color: "#fac4a5" },
    { year: 2019, color: "#fad9a2" },
    { year: 2020, color: "#fbf0b2" },
    { year: 2021, color: "#d7edc1" },
    { year: 2022, color: "#ade3d7" },
    { year: 2023, color: "#b0cbd5" },
    { year: 2024, color: "#bdb5d3" },
  ];

  const [visibleYears, setVisibleYears] = useState(
    monthlyDistancesPerYear.map(({ year }) => year)
  );

  function getMaxMonthlyDistance() {
    const allMonthlyDistances = [
      monthlyDistanceIn2017,
      monthlyDistanceIn2018,
      monthlyDistanceIn2019,
      monthlyDistanceIn2020,
      monthlyDistanceIn2021,
      monthlyDistanceIn2022,
      monthlyDistanceIn2023,
      monthlyDistanceIn2024,
    ].flat();

    return Math.max(...allMonthlyDistances.map((dataPoint) => dataPoint.y));
  }

  const handleCheckboxChange = (year: number) => {
    setVisibleYears((prevVisibleYears) =>
      prevVisibleYears.includes(year)
        ? prevVisibleYears.filter((y) => y !== year)
        : [...prevVisibleYears, year]
    );
  };

  const labelComponent = <VictoryTooltip style={{ fontSize: 7 }} />;
  const pointSize = 2;
  const activePointSize = 3;

  const yTickValues = Array.from(
    { length: Math.ceil(getMaxMonthlyDistance() / 250) + 1 },
    (_, i) => i * 250
  );
  const xTickValues = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const tickStyle = {
    tickLabels: {
      fontSize: 8,
    },
    ticks: {
      stroke: "#757575",
      size: 5,
    },
  };

  return (
    <div className="flex flex-col items-center">
      <VictoryChart containerComponent={<VictoryVoronoiContainer />} theme={VictoryTheme.clean}>
        <VictoryAxis dependentAxis tickValues={yTickValues} style={tickStyle} />
        <VictoryAxis tickValues={xTickValues} style={tickStyle} />
        {monthlyDistancesPerYear.map(({ year, data }) =>
          visibleYears.includes(year) ? (
            <VictoryGroup
              key={year}
              labels={({ datum }) => `${datum.x}: ${datum.y} km`}
              labelComponent={labelComponent}
              data={data}
              color={scatterColorPerYear.find((colorData) => colorData.year === year)?.color}
            >
              <VictoryLine
                style={{
                  data: { stroke: lineColorPerYear.find((colorData) => colorData.year === year)?.color },
                }}
              />
              <VictoryScatter
                size={({ active }) => (active ? activePointSize : pointSize)}
              />
            </VictoryGroup>
          ) : null
        )}
      </VictoryChart>
      <div className="flex justify-center -mt-14 z-40">
        {monthlyDistancesPerYear.map(({ year }) => (
          <div 
            className="mx-2 px-2 rounded-md shadow-sm" 
            style={{ backgroundColor: lineColorPerYear.find((colorData: any) => colorData.year === year)?.color}}  
            key={year}
          >
          <FormControlLabel
            control = {
              <Checkbox
                onChange={() => handleCheckboxChange(year)}
                checked={visibleYears.includes(year)}
                sx = {{
                  color: scatterColorPerYear.find((colorData: any) => colorData.year === year)?.color,
                  '&.Mui-checked': {
                    color: scatterColorPerYear.find((colorData: any) => colorData.year === year)?.color,
                  },
                }}
              />
            }
            label = {year}
          />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthlyDistanceChart;
