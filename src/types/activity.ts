// types/activity.ts

export interface Activity {
    "Aktivitäts-ID": string;
    "Aktivitätsdatum": string; // We'll parse this into a Date object later
    "Name der Aktivität": string;
    "Aktivitätsart": string;
    "Distanz": number;
    "Höhenzunahme": number;
    "Durchschnittliche Geschwindigkeit": number;
    "Kalorien": number;
    // Add other fields as needed, following the same pattern
    // For optional fields, use the `?` modifier
    "Max. Herzfrequenz"?: number;
    "Durchschnittliche Herzfrequenz"?: number;
    "Max. Steigung"?: number;
    "Durchschnittliche Steigung"?: number;
    // ... continue for other fields
  }
  