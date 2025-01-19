import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { loadAllAthleteActivities } from '../../../lib/dataLoader';
import { Activity } from '../../../types/activity';

export async function GET(request: NextRequest) {
  try {
    // Load all activities
    const allActivities: Activity[] = loadAllAthleteActivities();

    if (allActivities.length === 0) {
      return NextResponse.json({ error: 'No activities found.' }, { status: 404 });
    }

    // Initialize records
    let topSpeedActivity: Activity | null = null;
    let maxWattActivity: Activity | null = null;
    let highestHeartRateActivity: Activity | null = null;
    let mostElevationGainActivity: Activity | null = null;

    allActivities.forEach(activity => {
      // Top Speed
      if (
        activity.averageSpeed &&
        (!topSpeedActivity ||
          activity.averageSpeed > (topSpeedActivity.averageSpeed || 0))
      ) {
        topSpeedActivity = activity;
  
      }

      // Max Watt
      if (
        activity.maxWatts &&
        (!maxWattActivity || activity.maxWatts > (maxWattActivity.maxWatts || 0))
      ) {
        maxWattActivity = activity;
      }

      // Highest Heart Rate
      if (
        activity.maxHeartRate &&
        (!highestHeartRateActivity || activity.maxHeartRate > (highestHeartRateActivity.maxHeartRate || 0))
      ) {
        highestHeartRateActivity = activity;
      }

      // Most Elevation Gain
      if (
        activity.elevationGain &&
        (!mostElevationGainActivity || activity.elevationGain > (mostElevationGainActivity.elevationGain || 0))
      ) {
        mostElevationGainActivity = activity;
      }
    });

    const records = {
      topSpeed: topSpeedActivity
        ? {
            activityId: topSpeedActivity.activityId,
            athleteId: topSpeedActivity.athleteId ?? 'Unknown',
            speed: topSpeedActivity.averageSpeed,
            activityName: topSpeedActivity.activityName,
            activityDate: topSpeedActivity.activityDate,
          }
        : null,
      maxWatt: maxWattActivity
        ? {
            activityId: maxWattActivity.activityId,
            athleteId: maxWattActivity.athleteId ?? 'Unknown',
            watt: maxWattActivity.maxWatts,
            activityName: maxWattActivity.activityName,
            activityDate: maxWattActivity.activityDate,
          }
        : null,
      highestHeartRate: highestHeartRateActivity
        ? {
            activityId: highestHeartRateActivity.activityId,
            athleteId: highestHeartRateActivity.athleteId ?? 'Unknown',
            heartRate: highestHeartRateActivity.maxHeartRate,
            activityName: highestHeartRateActivity.activityName,
            activityDate: highestHeartRateActivity.activityDate,
          }
        : null,
      mostElevationGain: mostElevationGainActivity
        ? {
            activityId: mostElevationGainActivity.activityId,
            athleteId: mostElevationGainActivity.athleteId ?? 'Unknown',
            elevationGain: mostElevationGainActivity.elevationGain,
            activityName: mostElevationGainActivity.activityName,
            activityDate: mostElevationGainActivity.activityDate,
          }
        : null,
    };

    return NextResponse.json(records);
  } catch (error: any) {
    console.error('Error in Records API:', error.message);
    return NextResponse.json({ error: 'Internal Server Error.' }, { status: 500 });
  }
}