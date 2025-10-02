import fs from 'fs';
import path from 'path';
import { Activity } from '../types/activity';

// In-memory caches
const activitiesCache: { [athleteId: string]: Activity[] } = {};
let allActivitiesCache: Activity[] | null = null;

// Mapping dictionaries
const germanToEnglishMap: { [key: string]: keyof Activity } = {
  "Aktivitäts-ID": "activityId",
  "Aktivitätsdatum": "activityDate",
  "Name der Aktivität": "activityName",
  "Aktivitätsart": "activityType",
  "Aktivitätsbeschreibung": "activityDescription",
  "Verstrichene Zeit": "elapsedTime",
  "Distanz": "distance",
  "Max. Herzfrequenz": "maxHeartRate",
  "Relative Leistung": "relativeEffort",
  "Pendeln": "commute",
  "Hinweis zur Privatsphäre für Aktivitäten": "activityPrivateNote",
  "Aktivitätsausrüstung": "activityGear",
  "Dateiname": "filename",
  "Sportlergewicht": "athleteWeight",
  "Fahrradgewicht": "bikeWeight",
  "Bewegungszeit": "movingTime",
  "Höchstgeschw.": "maxSpeed",
  "Durchschnittliche Geschwindigkeit": "averageSpeed",
  "Höhenzunahme": "elevationGain",
  "Höhenunterschied": "elevationLoss",
  "Min. Höhe": "elevationLow",
  "Max. Höhe": "elevationHigh",
  "Max. Steigung": "maxGrade",
  "Durchschnittliche Steigung": "averageGrade",
  "Durchschnittliche positive Steigung": "averagePositiveGrade",
  "Durchschnittliche negative Steigung": "averageNegativeGrade",
  "Max. Tritt-/Schrittfrequenz": "maxCadence",
  "Durchschnittliche Trittfrequenz": "averageCadence",
  "Durchschnittliche Herzfrequenz": "averageHeartRate",
  "Max. Watt": "maxWatts",
  "Durchschnittliche Watt": "averageWatts",
  "Kalorien": "calories",
  "Max. Temperatur": "maxTemperature",
  "Durchschnittliche Temperatur": "averageTemperature",
  "Gesamtarbeit": "totalWork",
  "Anzahl Läufe": "numberOfRuns",
  "Bergaufzeit": "uphillTime",
  "Bergabzeit": "downhillTime",
  "Andere Zeit": "otherTime",
  "Gefühlte Anstrengung": "perceivedExertion",
  "Art": "type",
  "Startzeit": "startTime",
  "Gewichtete durchschnittliche Leistung": "weightedAveragePower",
  "Leistungszahl": "powerCount",
  "Gefühlte Anstrengung verwenden": "preferPerceivedExertion",
  "Gefühlte relative Leistung": "perceivedRelativeEffort",
  "Insgesamt gestemmtes Gewicht": "totalWeightLifted",
  "Von Upload": "fromUpload",
  "Auf Steigung angepasste Distanz": "gradeAdjustedDistance",
  "Wetterbeobachtungszeit": "weatherObservationTime",
  "Wetterlage": "weatherCondition",
  "Wetter: Temperatur": "weatherTemperature",
  "Scheinbare Temperatur": "apparentTemperature",
  "Taupunkt": "dewpoint",
  "Luftfeuchtigkeit": "humidity",
  "Wetter: Druck": "weatherPressure",
  "Windgeschwindigkeit": "windSpeed",
  "Windböe": "windGust",
  "Windrichtung": "windBearing",
  "Niederschlagsintensität": "precipitationIntensity",
  "Sonnenaufgangszeit": "sunriseTime",
  "Sonnenuntergangszeit": "sunsetTime",
  "Mondphase": "moonPhase",
  "Fahrrad": "bike",
  "Ausrüstung": "gear",
  "Niederschlagswahrscheinlichkeit": "precipitationProbability",
  "Niederschlagsart": "precipitationType",
  "Wolkendecke": "cloudCover",
  "Wetter: Sichtbarkeit": "weatherVisibility",
  "UV-Index": "uvIndex",
  "Wetter: Ozon": "weatherOzone",
  "Sprunganzahl": "jumpCount",
  "Schwierigkeit insgesamt": "totalGrit",
  "Durchschnittlicher Flow": "averageFlow",
  "Markiert": "flagged",
  "Durchschnittsgeschwindigkeit im Aufzeichnungszeitraum": "averageElapsedSpeed",
  "Auf Schotter zurückgelegte Distanz": "dirtDistance",
  "Neu getestete Distanz": "newlyExploredDistance",
  "Neu getestete Schotterdistanz": "newlyExploredDirtDistance",
  "Aktivitätsanzahl": "activityCount",
  "Schritte insgesamt": "totalSteps",
  "Eingesparte CO₂-Emissionen": "carbonSaved",
  "Pool-Länge": "poolLength",
  "Trainingsbelastung": "trainingLoad",
  "Intensität": "intensity",
  "Durchschnittliches auf Steigung angepasstes Tempo": "averageGradeAdjustedPace",
  "Stoppuhr-Zeit": "timerTime",
  "Zyklen gesamt": "totalCycles",
  "Medien": "media",
};

const englishToEnglishMap: { [key: string]: keyof Activity } = {
  "Activity ID": "activityId",
  "Activity Date": "activityDate",
  "Activity Name": "activityName",
  "Activity Type": "activityType",
  "Activity Description": "activityDescription",
  "Elapsed Time": "elapsedTime",
  "Distance": "distance",
  "Max Heart Rate": "maxHeartRate",
  "Relative Effort": "relativeEffort",
  "Commute": "commute",
  "Activity Private Note": "activityPrivateNote",
  "Activity Gear": "activityGear",
  "Filename": "filename",
  "Athlete Weight": "athleteWeight",
  "Bike Weight": "bikeWeight",
  "Moving Time": "movingTime",
  "Max Speed": "maxSpeed",
  "Average Speed": "averageSpeed",
  "Elevation Gain": "elevationGain",
  "Elevation Loss": "elevationLoss",
  "Elevation Low": "elevationLow",
  "Elevation High": "elevationHigh",
  "Max Grade": "maxGrade",
  "Average Grade": "averageGrade",
  "Average Positive Grade": "averagePositiveGrade",
  "Average Negative Grade": "averageNegativeGrade",
  "Max Cadence": "maxCadence",
  "Average Cadence": "averageCadence",
  "Average Heart Rate": "averageHeartRate",
  "Max Watts": "maxWatts",
  "Average Watts": "averageWatts",
  "Calories": "calories",
  "Max Temperature": "maxTemperature",
  "Average Temperature": "averageTemperature",
  "Total Work": "totalWork",
  "Number of Runs": "numberOfRuns",
  "Uphill Time": "uphillTime",
  "Downhill Time": "downhillTime",
  "Other Time": "otherTime",
  "Perceived Exertion": "perceivedExertion",
  "Type": "type",
  "Start Time": "startTime",
  "Weighted Average Power": "weightedAveragePower",
  "Power Count": "powerCount",
  "Prefer Perceived Exertion": "preferPerceivedExertion",
  "Perceived Relative Effort": "perceivedRelativeEffort",
  "Total Weight Lifted": "totalWeightLifted",
  "From Upload": "fromUpload",
  "Grade Adjusted Distance": "gradeAdjustedDistance",
  "Weather Observation Time": "weatherObservationTime",
  "Weather Condition": "weatherCondition",
  "Weather Temperature": "weatherTemperature",
  "Apparent Temperature": "apparentTemperature",
  "Dewpoint": "dewpoint",
  "Humidity": "humidity",
  "Weather Pressure": "weatherPressure",
  "Wind Speed": "windSpeed",
  "Wind Gust": "windGust",
  "Wind Bearing": "windBearing",
  "Precipitation Intensity": "precipitationIntensity",
  "Sunrise Time": "sunriseTime",
  "Sunset Time": "sunsetTime",
  "Moon Phase": "moonPhase",
  "Bike": "bike",
  "Gear": "gear",
  "Precipitation Probability": "precipitationProbability",
  "Precipitation Type": "precipitationType",
  "Cloud Cover": "cloudCover",
  "Weather Visibility": "weatherVisibility",
  "UV Index": "uvIndex",
  "Weather Ozone": "weatherOzone",
  "Jump Count": "jumpCount",
  "Total Grit": "totalGrit",
  "Average Flow": "averageFlow",
  "Flagged": "flagged",
  "Average Elapsed Speed": "averageElapsedSpeed",
  "Dirt Distance": "dirtDistance",
  "Newly Explored Distance": "newlyExploredDistance",
  "Newly Explored Dirt Distance": "newlyExploredDirtDistance",
  "Activity Count": "activityCount",
  "Total Steps": "totalSteps",
  "Carbon Saved": "carbonSaved",
  "Pool Length": "poolLength",
  "Training Load": "trainingLoad",
  "Intensity": "intensity",
  "Average Grade Adjusted Pace": "averageGradeAdjustedPace",
  "Timer Time": "timerTime",
  "Total Cycles": "totalCycles",
  "Media": "media",
};

/**
 * Parses a German date string (e.g., "04.09.2019, 15:39:30") to ISO string.
 * @param dateStr - German date string
 * @returns ISO date string
 */
const parseGermanDate = (dateStr: string): string => {
  // Expected format: "DD.MM.YYYY, HH:MM:SS"
  const [datePart, timePart] = dateStr.split(', ');
  if (!datePart || !timePart) return '';

  const [day, month, year] = datePart.split('.').map(Number);
  const [hours, minutes, seconds] = timePart.split(':').map(Number);

  const date = new Date(year, month - 1, day, hours, minutes, seconds);
  return date.toISOString();
};

/**
 * Parses an English date string (e.g., "Jul 3, 2020, 4:56:00 PM") to ISO string.
 * @param dateStr - English date string
 * @returns ISO date string
 */
const parseEnglishDate = (dateStr: string): string => {
  // Directly use Date constructor as it can parse "Jul 3, 2020, 4:56:00 PM"
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? '' : date.toISOString();
};

/**
 * Detects the language of the activity based on its keys.
 * @param activity - The raw activity object from JSON
 * @returns 'de' for German, 'en' for English, or 'unknown'
 */
const detectLanguage = (activity: any): 'de' | 'en' | 'unknown' => {
  if (activity.hasOwnProperty("Aktivitäts-ID")) return 'de';
  if (activity.hasOwnProperty("Activity ID")) return 'en';
  return 'unknown';
};

// Simple unique ID generator (for demonstration)
let nextId = 1;
const generateUniqueId = () => (nextId++).toString();

/**
 * Maps raw activity data to the unified Activity interface based on language.
 * @param raw - Raw activity object from JSON
 * @param language - Detected language ('de' or 'en')
 * @returns Mapped Activity object
 */
const mapActivity = (raw: any, language: 'de' | 'en'): Activity => {
    const map = language === 'de' ? germanToEnglishMap : englishToEnglishMap;
    const mappedActivity: any = {};
  
    // Handle missing activityId
    if (!raw[language === 'de' ? "Aktivitäts-ID" : "Activity ID"]) {
      console.warn(`Missing activityId in activity: ${JSON.stringify(raw)}. Generating a unique ID.`);
      mappedActivity['activityId'] = generateUniqueId();
    }
  
    for (const key in map) {
      const activityKey = map[key];
      const rawValue = raw[key];
  
      if (activityKey === 'activityDate') {
        mappedActivity[activityKey] = language === 'de' ? parseGermanDate(rawValue) : parseEnglishDate(rawValue);
        continue;
      }
  
      // Convert numeric fields
      if (
        [
          'elapsedTime',
          'distance',
          'maxHeartRate',
          'relativeEffort',
          'commute',
          'athleteWeight',
          'bikeWeight',
          'movingTime',
          'maxSpeed',
          'averageSpeed',
          'elevationGain',
          'elevationLoss',
          'elevationLow',
          'elevationHigh',
          'maxGrade',
          'averageGrade',
          'averagePositiveGrade',
          'averageNegativeGrade',
          'maxCadence',
          'averageCadence',
          'averageHeartRate',
          'maxWatts',
          'averageWatts',
          'calories',
          'maxTemperature',
          'averageTemperature',
          'totalWork',
          'numberOfRuns',
          'uphillTime',
          'downhillTime',
          'otherTime',
          'weightedAveragePower',
          'powerCount',
          'perceivedRelativeEffort',
          'totalWeightLifted',
          'fromUpload',
          'gradeAdjustedDistance',
          'weatherTemperature',
          'apparentTemperature',
          'dewpoint',
          'humidity',
          'weatherPressure',
          'windSpeed',
          'windGust',
          'precipitationIntensity',
          'uvIndex',
          'weatherOzone',
          'jumpCount',
          'totalGrit',
          'averageFlow',
          'averageElapsedSpeed',
          'dirtDistance',
          'newlyExploredDistance',
          'newlyExploredDirtDistance',
          'activityCount',
          'totalSteps',
          'carbonSaved',
          'poolLength',
          'trainingLoad',
          'intensity',
          'averageGradeAdjustedPace',
          'timerTime',
          'totalCycles',
        ].includes(activityKey)
      ) {
        mappedActivity[activityKey] = rawValue ? parseFloat(rawValue) : 0;
        continue;
      }
  
      // Convert boolean fields
      if (activityKey === 'preferPerceivedExertion') {
        mappedActivity[activityKey] = rawValue === '1' || rawValue === 'true';
        continue;
      }
  
      // Assign string fields or activityId if missing
      mappedActivity[activityKey] = rawValue || (activityKey === 'activityId' ? generateUniqueId() : '');
    }
  
    // Handle 'media' field which might be a single string or an array
    if (language === 'de') {
      mappedActivity['media'] = raw["Medien"] ? (Array.isArray(raw["Medien"]) ? raw["Medien"] : [raw["Medien"]]) : [];
    } else {
      mappedActivity['media'] = raw["Media"] ? (Array.isArray(raw["Media"]) ? raw["Media"] : [raw["Media"]]) : [];
    }
  
    return mappedActivity as Activity;
  };

/**
 * Loads and parses activities.json for a given athlete.
 * Implements caching to avoid repeated file reads.
 * @param athleteId - The ID of the athlete
 * @returns Array of Activity objects
 */
export const loadActivities = (athleteId: string): Activity[] => {
    if (activitiesCache[athleteId]) {
      return activitiesCache[athleteId];
    }
  
    const filePath = path.join(process.cwd(), 'src', 'data', 'users', 'processed', athleteId, 'activities.json');
  
    if (!fs.existsSync(filePath)) {
      throw new Error(`activities.json for athlete ID ${athleteId} not found.`);
    }
  
    try {
      const fileContents = fs.readFileSync(filePath, 'utf-8');
      const rawActivities: any[] = JSON.parse(fileContents);
  
      if (rawActivities.length === 0) {
        activitiesCache[athleteId] = [];
        return activitiesCache[athleteId];
      }
  
      // Detect language based on the first activity's keys
      const language = detectLanguage(rawActivities[0]);
      if (language === 'unknown') {
        throw new Error(`Unable to detect language for athlete ID ${athleteId}.`);
      }
  
      // Map all activities to the unified Activity interface
      const activities: Activity[] = rawActivities.map(raw => {
        const activity = mapActivity(raw, language);
        activity.athleteId = athleteId; // Ensure athleteId is assigned
        return activity;
      });
  
      // Cache the loaded activities
      activitiesCache[athleteId] = activities;
  
      return activitiesCache[athleteId];
    } catch (error: any) {
      throw new Error(`Failed to parse activities.json for athlete ID ${athleteId}: ${error.message}`);
    }
  };

/**
 * Retrieves all athlete IDs by reading the processed users directory.
 * Assumes athlete IDs correspond to folder names under src/data/users/processed/
 * @returns Array of athlete IDs
 */
export const getAllAthleteIds = (): string[] => {
  const processedDir = path.join(process.cwd(), 'src', 'data', 'users', 'processed');
  if (!fs.existsSync(processedDir)) {
    return [];
  }

  const athleteIds = fs.readdirSync(processedDir).filter(file => {
    const filePath = path.join(processedDir, file);
    return fs.statSync(filePath).isDirectory();
  });

  return athleteIds;
};

/**
 * Loads and aggregates all activities across all athletes.
 * Implements caching to avoid repeated file reads.
 * @returns Array of all Activity objects
 */
export const loadAllAthleteActivities = (): Activity[] => {
  if (allActivitiesCache) {
    return allActivitiesCache;
  }

  const athleteIds = getAllAthleteIds();
  const allActivities: Activity[] = [];

  athleteIds.forEach(athleteId => {
    try {
      const athleteActivities = loadActivities(athleteId);
      allActivities.push(...athleteActivities);
    } catch (error: any) {
      console.error(`Error loading activities for athlete ID ${athleteId}: ${error.message}`);
      // Optionally, handle the error (e.g., continue, rethrow, etc.)
    }
  });

  allActivitiesCache = allActivities;
  return allActivitiesCache;
};