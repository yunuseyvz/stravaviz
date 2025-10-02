"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

// Define the shape of the context
type YearContextType = {
  selectedYear: number;
  selectYear: (year: number) => void;
};

// Create the context with default undefined
const YearContext = createContext<YearContextType | undefined>(undefined);

// Create a provider component
export const YearProvider = ({ children }: { children: ReactNode }) => {
  // Initialize with the current year or retrieve from localStorage/session if needed
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const selectYear = (year: number) => {
    setSelectedYear(year);
  };

  return (
    <YearContext.Provider value={{ selectedYear, selectYear }}>
      {children}
    </YearContext.Provider>
  );
};

// Custom hook to use the YearContext
export const useYear = () => {
  const context = useContext(YearContext);
  if (!context) {
    throw new Error("useYear must be used within a YearProvider");
  }
  return context;
};
