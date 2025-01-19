// src/lib/validators.ts

/**
 * Validates if a string is in YYYY-MM-DD format and represents a valid date.
 * @param dateStr - Date string to validate
 * @returns boolean indicating if the date is valid
 */
export const isValidDate = (dateStr: string | null): boolean => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return !isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
  };
  
  /**
   * Validates if a string represents a positive integer.
   * @param str - String to validate
   * @returns boolean indicating if the string is a positive integer
   */
  export const isPositiveInteger = (str: string): boolean => {
    const num = Number(str);
    return Number.isInteger(num) && num > 0;
  };
  