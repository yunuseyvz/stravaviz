// app/api/activities/[activityId]/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { loadActivities } from '../../../../../lib/dataLoader';
import { Activity } from '../../../../../types/activity';

export async function GET(request: NextRequest, { params }: { params: { activityId: string } }) {
  const { activityId } = params;

  // Load activities
  const activities: Activity[] = loadActivities();

  // Find activity by ID
  const activity = activities.find(act => act["Aktivitäts-ID"] === activityId);

  if (!activity) {
    return NextResponse.json({ error: `Activity with ID ${activityId} not found.` }, { status: 404 });
  }

  // Transform activity data as needed
  const transformedActivity = {
    "Aktivitäts-ID": activity["Aktivitäts-ID"],
    "Aktivitätsdatum": activity["Aktivitätsdatum"],
    "Name der Aktivität": activity["Name der Aktivität"],
    "Aktivitätsart": activity["Aktivitätsart"],
    "Distanz": activity["Distanz"],
    "Höhenzunahme": activity["Höhenzunahme"],
    "Durchschnittliche Geschwindigkeit": activity["Durchschnittliche Geschwindigkeit"],
    "Kalorien": activity["Kalorien"],
    "Max. Herzfrequenz": activity["Max. Herzfrequenz"],
    "Durchschnittliche Herzfrequenz": activity["Durchschnittliche Herzfrequenz"],
    "Max. Steigung": activity["Max. Steigung"],
    "Durchschnittliche Steigung": activity["Durchschnittliche Steigung"],
    // ... include other relevant fields as needed
  };

  return NextResponse.json(transformedActivity);
}
