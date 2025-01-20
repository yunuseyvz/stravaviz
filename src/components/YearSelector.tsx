"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import classNames from "classnames";
import { useYear } from "../context/YearContext";

const YearSelector = () => {
  const { selectedYear, selectYear } = useYear();
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  const MIN_YEAR = 2019;
  const MAX_YEAR = 2025;
  const INITIAL_YEAR = 2024;

  useEffect(() => {
    // Initialize the selected year to 2024 if not already set
    if (!selectedYear) {
      selectYear(INITIAL_YEAR);
    }

    // Define the available years based on min and max
    const years = [];
    for (let year = MIN_YEAR; year <= MAX_YEAR; year++) {
      years.push(year);
    }
    setAvailableYears(years);
  }, [selectedYear, selectYear]);

  const handlePrevious = () => {
    if (selectedYear > MIN_YEAR) {
      selectYear(selectedYear - 1);
    }
  };

  const handleNext = () => {
    if (selectedYear < MAX_YEAR) {
      selectYear(selectedYear + 1);
    }
  };

  const handleSelectYear = (year: number) => {
    selectYear(year);
  };

  // Determine the years to display
  const leftYear = selectedYear - 1 >= MIN_YEAR ? selectedYear - 1 : null;
  const rightYear = selectedYear + 1 <= MAX_YEAR ? selectedYear + 1 : null;

  return (
    <div className="flex items-center space-x-4">
      {/* Left Arrow */}
      <button
        onClick={handlePrevious}
        disabled={selectedYear <= MIN_YEAR}
        className={classNames(
          "p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-300 dark:bg-gray-700 dark:hover:bg-gray-800",
          {
            "opacity-50 cursor-not-allowed": selectedYear <= MIN_YEAR,
          }
        )}
        aria-label="Previous Year"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Year Display */}
      <div className="flex items-center space-x-4">
        {/* Left Year (if available) */}
        {leftYear && (
          <button
            onClick={() => handleSelectYear(leftYear)}
            className="text-md text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
            aria-label={`Select year ${leftYear}`}
          >
            {leftYear}
          </button>
        )}

        {/* Selected Year */}
        <div
          className="text-lg font-bold text-blue-500 dark:text-blue-400"
          aria-label={`Selected year ${selectedYear}`}
        >
          {selectedYear}
        </div>

        {/* Right Year (if available) */}
        {rightYear && (
          <button
            onClick={() => handleSelectYear(rightYear)}
            className="text-md text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
            aria-label={`Select year ${rightYear}`}
          >
            {rightYear}
          </button>
        )}
      </div>

      {/* Right Arrow */}
      <button
        onClick={handleNext}
        disabled={selectedYear >= MAX_YEAR}
        className={classNames(
          "p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-300 dark:bg-gray-700 dark:hover:bg-gray-800",
          {
            "opacity-50 cursor-not-allowed": selectedYear >= MAX_YEAR,
          }
        )}
        aria-label="Next Year"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default YearSelector;
