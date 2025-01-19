import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { loadActivities } from '../../../../../lib/dataLoader';
import { Activity } from '../../../../../types/activity';

export async function GET(request: NextRequest, { params }: { params: Promise<{ athleteId: string }> }) {
  const { athleteId } = await params;

  // Load all activities for the athlete
  let activities: Activity[];
  try {
    activities = loadActivities(athleteId);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  // If no activities found, return an empty response or a message
  if (!activities || activities.length === 0) {
    return NextResponse.json({
      data: {
        topSpeedActivity: null,
        maxWattActivity: null,
        highestHeartrateActivity: null,
      },
      message: 'No activities found for this athlete.',
    });
  }

  /**
   * Helper function to get the "max" record for a given field.
   * - fieldName is the property in the Activity you want to compare (e.g., "averageSpeed" or "maxWatt").
   * - label is just a friendly name for the record to return in the response.
   */
  function findMaxRecord(fieldName: keyof Activity, label: string) {
    // Filter out any activities that don't have this field set (or are invalid)
    const validActivities = activities.filter(a => a[fieldName] !== undefined && a[fieldName] !== null);

    if (!validActivities.length) {
      return null;
    }

    // Find the activity with the maximum value in `fieldName`
    const recordActivity = validActivities.reduce((prev, current) => {
      return (current[fieldName] as number) > (prev[fieldName] as number) ? current : prev;
    });

    return {
      recordType: label,
      activityId: recordActivity.activityId,
      activityDate: recordActivity.activityDate,
      value: recordActivity[fieldName], // e.g., speed, watt, HR
    };
  }

  // Top speed record (assuming 'averageSpeed' is the relevant field)
  const topSpeedActivity = findMaxRecord('averageSpeed', 'Top Speed');

  // Max watt record (assuming 'maxWatt' is the relevant field)
  const maxWattActivity = findMaxRecord('maxWatts', 'Max Watt');

  // Highest heart rate record (assuming 'maxHeartRate' is the relevant field)
  const highestHeartrateActivity = findMaxRecord('maxHeartRate', 'Highest Heart Rate');

  return NextResponse.json({
    data: {
      topSpeedActivity,
      maxWattActivity,
      highestHeartrateActivity,
    },
  });
}
