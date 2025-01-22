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
  const metric = searchParams.get('metric'); // e.g., "distance", "elevation", "time"
  const activityTypeFilter = searchParams.get('activityType'); // optional
  const startDateStr = searchParams.get('startDate'); // optional
  const endDateStr = searchParams.get('endDate'); // optional
  const groupBy = searchParams.get('groupBy') || 'month'; // new parameter: "month" or "activityType"

  // Validate metric
  const allowedMetrics = ['distance', 'elevation', 'time'];
  if (!metric || !allowedMetrics.includes(metric)) {
    return NextResponse.json(
      { error: `Invalid metric specified. Allowed values: ${allowedMetrics.join(', ')}.` },
      { status: 400 }
    );
  }

  // Validate groupBy
  const allowedGroupBy = ['month', 'activityType'];
  if (!allowedGroupBy.includes(groupBy)) {
    return NextResponse.json(
      { error: `Invalid groupBy specified. Allowed values: ${allowedGroupBy.join(', ')}.` },
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
  if (activityTypeFilter) {
    activities = activities.filter(activity => {
      // Case-insensitive comparison
      return activity.activityType.toLowerCase() === activityTypeFilter.toLowerCase();
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

  // Aggregate data based on groupBy parameter
  const aggregation: { [key: string]: number } = {}; // e.g., { "2023-09": 5000, ... } or { "Running": 3600, "Cycling": 7200 }

  activities.forEach(activity => {
    let key: string;

    if (groupBy === 'month') {
      const date = new Date(activity.activityDate);
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // "YYYY-MM"
    } else if (groupBy === 'activityType') {
      key = activity.activityType;
    } else {
      // Default to month if somehow groupBy is invalid
      const date = new Date(activity.activityDate);
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    let value = 0;
    if (metric === 'distance') {
      value = activity.distance;
    } else if (metric === 'elevation') {
      value = activity.elevationGain;
    } else if (metric === 'time') {
      // Assuming movingTime is in seconds
      value = activity.movingTime;
    }

    if (aggregation[key]) {
      aggregation[key] += value;
    } else {
      aggregation[key] = value;
    }
  });

  // Convert aggregation to array and sort by key
  const aggregatedData = Object.keys(aggregation)
    .sort()
    .map(key => {
      let formattedValue = aggregation[key];

      if (metric === 'time') {
        if (groupBy === 'month') {
          // Convert seconds to hours (rounded to two decimal places)
          formattedValue = Number((formattedValue / 3600).toFixed(2)); // Example: 1.50 hours
        } else if (groupBy === 'activityType') {
          // Keep time in hours or convert as needed
          formattedValue = Number((formattedValue / 3600).toFixed(2)); // Example: 2.75 hours
        }
      } else if (metric === 'distance') {
        // Convert meters to kilometers
        formattedValue = Number((formattedValue / 1000).toFixed(2)); // Example: 5.25 km
      } else if (metric === 'elevation') {
        // Convert meters to kilometers if needed
        formattedValue = Number((formattedValue / 1000).toFixed(2)); // Example: 1.75 km
      }

      return {
        [groupBy === 'month' ? 'month' : 'activityType']: key,
        [`total${metric.charAt(0).toUpperCase() + metric.slice(1)}`]: formattedValue,
      };
    });

  // Response
  return NextResponse.json({
    metric,
    groupBy,
    aggregatedData,
  });
}
