// src/app/api/athletes/[athleteId]/metrics/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { loadActivities } from '../../../../../lib/dataLoader';
import { Activity } from '../../../../../types/activity';
import { isValidDate } from '../../../../../lib/validators';

export async function GET(request: NextRequest, { params }: { params: Promise<{ athleteId: string }> }) {
  const { athleteId } = await params;

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const metric = searchParams.get('metric'); // e.g., "distance", "elevation"
  const activityType = searchParams.get('activityType'); // optional
  const startDateStr = searchParams.get('startDate'); // optional
  const endDateStr = searchParams.get('endDate'); // optional

  // Validate metric
  const allowedMetrics = ['distance', 'elevation'];
  if (!metric || !allowedMetrics.includes(metric)) {
    return NextResponse.json(
      { error: `Invalid metric specified. Allowed values: ${allowedMetrics.join(', ')}.` },
      { status: 400 }
    );
  }

  // Validate date formats if provided
  if ((startDateStr && !isValidDate(startDateStr)) || (endDateStr && !isValidDate(endDateStr))) {
    return NextResponse.json({ error: 'Invalid date format. Expected YYYY-MM-DD.' }, { status: 400 });
  }

  let activities: Activity[];

  try {
    // Load activities for the athlete
    activities = loadActivities(athleteId);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  // Filter by activityType if provided
  if (activityType) {
    activities = activities.filter(activity => {
      // Case-insensitive comparison
      return activity.activityType.toLowerCase() === activityType.toLowerCase();
    });
  }

  // Filter by date range if provided
  if (startDateStr) {
    const startDate = new Date(startDateStr);
    activities = activities.filter(activity => new Date(activity.activityDate) >= startDate);
  }

  if (endDateStr) {
    const endDate = new Date(endDateStr);
    activities = activities.filter(activity => new Date(activity.activityDate) <= endDate);
  }

  // Aggregate data by month
  const aggregation: { [key: string]: number } = {}; // e.g., { "2023-09": 5000, ... }

  activities.forEach(activity => {
    const date = new Date(activity.activityDate);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // "YYYY-MM"

    let value = 0;
    if (metric === 'distance') {
      value = activity.distance;
    } else if (metric === 'elevation') {
      value = activity.elevationGain;
    }

    if (aggregation[month]) {
      aggregation[month] += value;
    } else {
      aggregation[month] = value;
    }
  });

  // Convert aggregation to array and sort by month
  const aggregatedData = Object.keys(aggregation)
    .sort()
    .map(month => ({
      month,
      [`total${metric.charAt(0).toUpperCase() + metric.slice(1)}`]: aggregation[month],
    }));

  // Response
  return NextResponse.json({
    metric,
    activityType: activityType || 'All',
    aggregatedData,
  });
}
