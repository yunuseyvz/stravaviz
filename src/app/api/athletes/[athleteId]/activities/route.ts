// src/app/api/athletes/[athleteId]/activities/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { loadActivities } from '../../../../../lib/dataLoader';
import { Activity } from '../../../../../types/activity';
import { isValidDate, isPositiveInteger } from '../../../../../lib/validators';

export async function GET(request: NextRequest, { params }: { params: { athleteId: string } }) {
  const { athleteId } = params;

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const startDateStr = searchParams.get('startDate'); // YYYY-MM-DD
  const endDateStr = searchParams.get('endDate'); // YYYY-MM-DD
  const activityType = searchParams.get('activityType'); // e.g., "Run", "Ride", etc.
  const pageStr = searchParams.get('page') || '1';
  const limitStr = searchParams.get('limit') || '20';

  // Validate pagination parameters
  if (!isPositiveInteger(pageStr)) {
    return NextResponse.json({ error: 'Invalid page number. Must be a positive integer.' }, { status: 400 });
  }

  if (!isPositiveInteger(limitStr)) {
    return NextResponse.json({ error: 'Invalid limit. Must be a positive integer.' }, { status: 400 });
  }

  const page = parseInt(pageStr, 10);
  const limit = parseInt(limitStr, 10);

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

  // Sort activities by date descending
  activities.sort((a, b) => new Date(b.activityDate).getTime() - new Date(a.activityDate).getTime());

  // Pagination
  const totalItems = activities.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedActivities = activities.slice(startIndex, endIndex);

  // Prepare response data
  const responseData = paginatedActivities.map(activity => ({
    activityId: activity.activityId,
    activityDate: activity.activityDate,
    activityName: activity.activityName,
    activityType: activity.activityType,
    distance: activity.distance,
    elevationGain: activity.elevationGain,
    averageSpeed: activity.averageSpeed,
    calories: activity.calories,
    // ... include other relevant fields as needed
  }));

  // Pagination metadata
  const pagination = {
    currentPage,
    totalPages,
    totalItems,
  };

  return NextResponse.json({ data: responseData, pagination });
}
