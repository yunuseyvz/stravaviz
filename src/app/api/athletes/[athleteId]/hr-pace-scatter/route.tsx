import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: { athleteId: string } }
) {
  const { athleteId } = params;
  const { searchParams } = request.nextUrl;
  const yearParam = searchParams.get("year");

  // Build the path to your correlation directory
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
    const correlations: any[] = JSON.parse(rawData);

    // Flatten out all hr_pace_points from each activity
    let allPoints: { timestamp: string; hr: number; pace: number }[] = [];
    for (const activity of correlations) {
      if (Array.isArray(activity.hr_pace_points)) {
        allPoints.push(...activity.hr_pace_points);
      }
    }

    // If a year is provided, filter the points by that year
    if (yearParam) {
      const year = Number(yearParam);
      allPoints = allPoints.filter((point) => {
        const pointYear = new Date(point.timestamp).getFullYear();
        return pointYear === year;
      });
    }

    return NextResponse.json(allPoints, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 404 });
  }
}
