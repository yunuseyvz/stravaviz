// lib/dataLoader.ts

import fs from 'fs';
import path from 'path';
import { Activity } from '../types/activity';

// In-memory cache
let activitiesCache: Activity[] | null = null;

/**
 * Loads and parses activities.json into an array of Activity objects.
 * Implements caching to avoid repeated file reads.
 */
export const loadActivities = (): Activity[] => {
  if (activitiesCache) {
    return activitiesCache;
  }

  const filePath = path.join(process.cwd(), 'public', 'activities.json');
  const fileContents = fs.readFileSync(filePath, 'utf-8');

  // Parse JSON
  const rawActivities: any[] = JSON.parse(fileContents);

  // Transform raw data to match Activity interface
  const activities: Activity[] = rawActivities.map((raw) => ({
    "Aktivitäts-ID": raw["Aktivitäts-ID"],
    "Aktivitätsdatum": new Date(raw["Aktivitätsdatum"]).toISOString(),
    "Name der Aktivität": raw["Name der Aktivität"],
    "Aktivitätsart": raw["Aktivitätsart"],
    "Distanz": parseFloat(raw["Distanz"]) || 0,
    "Höhenzunahme": parseFloat(raw["Höhenzunahme"]) || 0,
    "Durchschnittliche Geschwindigkeit": parseFloat(raw["Durchschnittliche Geschwindigkeit"]) || 0,
    "Kalorien": parseFloat(raw["Kalorien"]) || 0,
    // Handle optional fields
    "Max. Herzfrequenz": raw["Max. Herzfrequenz"] ? parseFloat(raw["Max. Herzfrequenz"]) : undefined,
    "Durchschnittliche Herzfrequenz": raw["Durchschnittliche Herzfrequenz"] ? parseFloat(raw["Durchschnittliche Herzfrequenz"]) : undefined,
    "Max. Steigung": raw["Max. Steigung"] ? parseFloat(raw["Max. Steigung"]) : undefined,
    "Durchschnittliche Steigung": raw["Durchschnittliche Steigung"] ? parseFloat(raw["Durchschnittliche Steigung"]) : undefined,
    // ... map other fields similarly
  }));

  activitiesCache = activities;
  return activitiesCache;
};
