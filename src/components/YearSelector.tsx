"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import classNames from "classnames";
import { useYear } from "../context/YearContext";

const YearSelector = () => {
  const { selectedYear, selectYear } = useYear();
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  // Define the range of years you want to allow
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 5; year <= currentYear + 1; year++) {
      years.push(year);
    }
    setAvailableYears(years);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleSelectYear = (year: number) => {
    selectYear(year);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative ml-4" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-300 dark:bg-gray-700 dark:hover:bg-gray-800"
      >
        <span>{selectedYear}</span>
        <ChevronDown
          className={`ml-2 w-4 h-4 transition-transform ${
            isDropdownOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {isDropdownOpen && (
        <div className="absolute top-12 right-0 w-32 bg-white border border-gray-300 dark:border-gray-700 rounded-md shadow-lg z-10 dark:bg-gray-800">
          <ul className="py-1">
            {availableYears.map((year) => (
              <li
                key={year}
                onClick={() => handleSelectYear(year)}
                className={classNames(
                  "px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700",
                  {
                    "bg-gray-100 dark:bg-gray-700": selectedYear === year,
                  }
                )}
              >
                {year}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default YearSelector;
