// src/app/api/activities/[activityId]/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { loadAllAthleteActivities } from '../../../../lib/dataLoader';
import { Activity } from '../../../../types/activity';

export async function GET(request: Request, { params }: { params: Promise<{ activityId: string }> }) {
  const { activityId } = await params;

  // Load all activities across all athletes
  const allActivities: Activity[] = loadAllAthleteActivities();

  // Find the activity by ID
  const activity = allActivities.find(act => act.activityId === activityId);

  if (!activity) {
    return NextResponse.json(
      { error: `Activity with ID ${activityId} not found.` },
      { status: 404 }
    );
  }

  // Prepare response data
  const transformedActivity = {
    activityId: activity.activityId,
    activityDate: activity.activityDate,
    activityName: activity.activityName,
    activityType: activity.activityType,
    distance: activity.distance,
    elevationGain: activity.elevationGain,
    averageSpeed: activity.averageSpeed,
    calories: activity.calories,
    maxHeartRate: activity.maxHeartRate,
    averageHeartRate: activity.averageHeartRate,
    maxGrade: activity.maxGrade,
    averageGrade: activity.averageGrade,
    athleteId: activity.athleteId || 'Unknown',
  };

  return NextResponse.json(transformedActivity);
}
