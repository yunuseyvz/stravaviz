import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

// Returns the day of the year (1-indexed)
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0); // December 31 of previous year
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

// Returns true if the given year is a leap year.
function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { athleteId: string } }
) {
  const { athleteId } = await params;
  const { searchParams } = request.nextUrl;
  const yearParam = searchParams.get("year");
  const hrMinParam = searchParams.get("hrMin");
  const hrMaxParam = searchParams.get("hrMax");

  // If year is not provided, default to current year.
  const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();
  const hrMin = hrMinParam ? parseInt(hrMinParam, 10) : null;
  const hrMax = hrMaxParam ? parseInt(hrMaxParam, 10) : null;

  // Path to the correlation file
  const correlationDir = path.join(
    process.cwd(),
    "src",
    "data",
    "users",
    "processed",
    athleteId,
    "corr"
  );
  const allCorrPath = path.join(correlationDir, "all_correlations.json");

  try {
    if (!fs.existsSync(allCorrPath)) {
      throw new Error("Correlation file not found.");
    }

    const rawData = fs.readFileSync(allCorrPath, "utf-8");
    const correlations = JSON.parse(rawData); // array of activities

    // Flatten out all hr_pace_points from each activity.
    let allPoints: { timestamp: string; hr: number; pace: number }[] = [];
    for (const activity of correlations) {
      if (Array.isArray(activity.hr_pace_points)) {
        allPoints.push(...activity.hr_pace_points);
      }
    }

    // Filter points by the requested year.
    allPoints = allPoints.filter(
      (p) => new Date(p.timestamp).getFullYear() === year
    );

    // If an HR range is provided, filter accordingly.
    if (hrMin !== null && hrMax !== null) {
      allPoints = allPoints.filter((p) => p.hr >= hrMin && p.hr <= hrMax);
    }

    // Group the points by day-of-year.
    // Here our key is the day number (1–365 or 1–366).
    const dailyData: Record<number, { paceArray: number[] }> = {};
    for (const point of allPoints) {
      const date = new Date(point.timestamp);
      const dayOfYear = getDayOfYear(date);
      if (!dailyData[dayOfYear]) {
        dailyData[dayOfYear] = { paceArray: [] };
      }
      dailyData[dayOfYear].paceArray.push(point.pace);
    }

    // For each day that has data, compute the trimmed mean and standard deviation.
    const computedDailyData: Record<number, {
      dailyMeanPace: number;
      dailyStdPace: number;
      rawCount: number;
      trimmedCount: number;
    }> = {};

    for (const dayStr of Object.keys(dailyData)) {
      const day = parseInt(dayStr, 10);
      const paceArray = dailyData[day].paceArray;
      const sortedPaces = [...paceArray].sort((a, b) => a - b);
      const n = sortedPaces.length;
      // Remove 10% of the values from each end if possible.
      const trimCount = Math.floor(n * 0.1);
      const trimmedPaces =
        n - 2 * trimCount > 0
          ? sortedPaces.slice(trimCount, n - trimCount)
          : sortedPaces;
      const sum = trimmedPaces.reduce((acc, val) => acc + val, 0);
      const dailyMeanPace = sum / trimmedPaces.length;
      const variance =
        trimmedPaces.reduce((acc, val) => acc + Math.pow(val - dailyMeanPace, 2), 0) /
        trimmedPaces.length;
      const dailyStdPace = Math.sqrt(variance);

      computedDailyData[day] = {
        dailyMeanPace,
        dailyStdPace,
        rawCount: n,
        trimmedCount: trimmedPaces.length,
      };
    }

    // Determine how many days the year has.
    const totalDays = isLeapYear(year) ? 366 : 365;

    // Build a complete array of daily data for every day in the year.
    // If a day is missing, use the previous day’s value if available,
    // or if not, “look ahead” to the next available day.
    const completeDailyData: Array<{
      day: number;
      dailyMeanPace: number;
      dailyStdPace: number;
      rawCount: number;
      trimmedCount: number;
    }> = [];

    let lastKnownData: {
      dailyMeanPace: number;
      dailyStdPace: number;
      rawCount: number;
      trimmedCount: number;
    } | null = null;
    for (let d = 1; d <= totalDays; d++) {
      if (computedDailyData[d]) {
        lastKnownData = computedDailyData[d];
        completeDailyData.push({
          day: d,
          dailyMeanPace: computedDailyData[d].dailyMeanPace,
          dailyStdPace: computedDailyData[d].dailyStdPace,
          rawCount: computedDailyData[d].rawCount,
          trimmedCount: computedDailyData[d].trimmedCount,
        });
      } else {
        if (lastKnownData) {
          // Use the prior day's computed value.
          completeDailyData.push({
            day: d,
            dailyMeanPace: lastKnownData.dailyMeanPace,
            dailyStdPace: lastKnownData.dailyStdPace,
            rawCount: 0,
            trimmedCount: 0,
          });
        } else {
          // No prior data – look ahead for the next available day.
          let nextData = null;
          for (let future = d + 1; future <= totalDays; future++) {
            if (computedDailyData[future]) {
              nextData = computedDailyData[future];
              break;
            }
          }
          if (nextData) {
            lastKnownData = nextData;
            completeDailyData.push({
              day: d,
              dailyMeanPace: nextData.dailyMeanPace,
              dailyStdPace: nextData.dailyStdPace,
              rawCount: 0,
              trimmedCount: 0,
            });
          } else {
            // If no data exists anywhere in the year, fill with zero.
            completeDailyData.push({
              day: d,
              dailyMeanPace: 0,
              dailyStdPace: 0,
              rawCount: 0,
              trimmedCount: 0,
            });
          }
        }
      }
    }

    // Compute a 7-day moving average of the dailyMeanPace.
    // For each day, the moving average is computed over the current day and the previous 6 days.
    const result = completeDailyData.map((data, index, array) => {
      const windowStart = Math.max(0, index - 6);
      const windowData = array.slice(windowStart, index + 1);
      const sum = windowData.reduce((acc, cur) => acc + cur.dailyMeanPace, 0);
      const movingAvgPace = sum / windowData.length;
      return {
        day: data.day, // day number in the year (1–365/366)
        dailyMeanPace: data.dailyMeanPace,
        dailyStdPace: data.dailyStdPace,
        rawCount: data.rawCount,
        trimmedCount: data.trimmedCount,
        movingAvgPace,
      };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 404 });
  }
}
