// scripts/processUserData.js

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const csv = require('csv-parser');
const gpxParse = require('gpx-parse');
const FitParser = require('fit-file-parser').default;

// Get StravaId from command line arguments
const StravaId = process.argv[2];
if (!StravaId) {
  console.error('StravaId is required as a command-line argument.');
  console.error('Usage: node scripts/processUserData.js <StravaId>');
  process.exit(1);
}

// Define paths based on StravaId
const userRawDir = path.join(__dirname, '..', 'data', 'users', 'raw', `Strava-export_${StravaId}`);
const userProcessedDir = path.join(__dirname, '..', 'data', 'users', 'processed', StravaId);

// Function to clean the processed directory
const cleanProcessedDir = () => {
  if (fs.existsSync(userProcessedDir)) {
    try {
      fs.rmSync(userProcessedDir, { recursive: true, force: true });
      console.log(`✅ Cleaned processed data directory: ${userProcessedDir}`);
    } catch (err) {
      console.error(`❌ Failed to delete directory ${userProcessedDir}:`, err.message);
      process.exit(1);
    }
  }
  try {
    fs.mkdirSync(userProcessedDir, { recursive: true });
    console.log(`✅ Recreated processed data directory: ${userProcessedDir}`);
  } catch (err) {
    console.error(`❌ Failed to create directory ${userProcessedDir}:`, err.message);
    process.exit(1);
  }
};

// 4. Copy profile.jpg to the processed directory
const copyProfileImage = () => {
  return new Promise((resolve, reject) => {
    const sourcePath = path.join(userRawDir, 'profile.jpg');
    const destPath = path.join(userProcessedDir, 'profile.jpg');

    if (!fs.existsSync(sourcePath)) {
      console.warn(`⚠️ profile.jpg not found in ${userRawDir}. Skipping copy.`);
      return resolve(); // Continue without failing
    }

    fs.copyFile(sourcePath, destPath, (err) => {
      if (err) {
        return reject(new Error(`Failed to copy profile.jpg: ${err.message}`));
      }
      console.log(`✅ Copied profile.jpg to processed directory.`);
      resolve();
    });
  });
};

// 1. Parse activities.csv
const parseActivitiesCSV = () => {
  return new Promise((resolve, reject) => {
    const activities = [];
    const csvPath = path.join(userRawDir, 'activities.csv');

    if (!fs.existsSync(csvPath)) {
      return reject(new Error(`activities.csv not found in ${userRawDir}`));
    }

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        activities.push(row);
      })
      .on('end', () => {
        const activitiesJsonPath = path.join(userProcessedDir, 'activities.json');
        fs.writeFileSync(activitiesJsonPath, JSON.stringify(activities, null, 2));
        console.log(`✅ Parsed activities.csv for StravaId ${StravaId}`);
        resolve();
      })
      .on('error', (err) => {
        reject(err);
      });
  });
};

const UserRawActivityDir = path.join(userRawDir, "activities_gpx");

// --- Early Filtering: Function to check if GPX file is empty ---
const isGPXEmpty = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return data.includes('<trkseg></trkseg>');
  } catch (err) {
    console.warn(`Warning: Could not read file ${filePath} for empty check: ${err.message}`);
    return false;
  }
};

// 2. Parse .gpx and .fit files
const parseActivityFiles = () => {
  return new Promise((resolve, reject) => {
    fs.readdir(UserRawActivityDir, (err, files) => {
      if (err) return reject(new Error(`Failed to read directory ${UserRawActivityDir}: ${err.message}`));

      // Filter GPX and FIT files
      const gpxFiles = files
        .filter((file) => file.endsWith('.gpx'))
        .filter((file) => {
          const fullPath = path.join(UserRawActivityDir, file);
          return !isGPXEmpty(fullPath); // Exclude empty GPX files
        });
      const fitFiles = files.filter((file) => file.endsWith('.fit'));

      // Process GPX Files
      const processGPX = (file) => {
        return new Promise((res, rej) => {
          const filePath = path.join(UserRawActivityDir, file);
          fs.readFile(filePath, (err, data) => {
            if (err) return rej(new Error(`Failed to read file ${filePath}: ${err.message}`));

            gpxParse.parseGpx(data.toString(), (error, gpxData) => {
              if (error) {
                console.warn(`Failed to parse GPX data from ${filePath}: ${error.message}. Skipping.`);
                return res(); // Skip this file but resolve promise to continue processing others.
              }

              // Initialize the GeoJSON structure
              const geojson = {
                type: 'Feature',
                properties: {
                  name: (gpxData.metadata && gpxData.metadata.name) || 'Activity',
                  time: (gpxData.metadata && gpxData.metadata.time) || null,
                },
                geometry: {
                  type: 'LineString',
                  coordinates: [],
                },
              };

              // Check if there are any tracks
              if (!gpxData.tracks || gpxData.tracks.length === 0) {
                console.warn(`No tracks found in ${filePath}. Skipping.`);
                return res();
              }

              // Iterate through tracks, segments, and points with safety checks
              gpxData.tracks.forEach((track, trackIndex) => {
                if (!track.segments || track.segments.length === 0) {
                  console.warn(`No segments found in track ${trackIndex} of ${filePath}. Skipping track.`);
                  return;
                }
                track.segments.forEach((segment, segmentIndex) => {
                  if (!segment || segment.length === 0) {
                    console.warn(`No points found in segment ${segmentIndex} of track ${trackIndex} in ${filePath}. Skipping segment.`);
                    return;
                  }
                  // Consider only every 10th data point
                  for (let i = 0; i < segment.length; i += 10) {
                    const point = segment[i];
                    geojson.geometry.coordinates.push([point.lon, point.lat]);
                  }
                });
              });

              // If no valid points were found, skip writing the file.
              if (geojson.geometry.coordinates.length === 0) {
                console.warn(`No valid track points found in ${filePath}. Skipping file.`);
                return res();
              }

              const outputFileName = file.replace('.gpx', '.geojson');
              const outputPath = path.join(userProcessedDir, outputFileName);
              fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2));
              console.log(`✅ Parsed and saved ${outputFileName} for StravaId ${StravaId}`);
              res();
            });
          });
        });
      };

      // You can also add FIT processing here (if needed), following a similar pattern.
      const promises = [];
      gpxFiles.forEach((file) => promises.push(processGPX(file)));
      // If processing FIT files, add their promises as well.
      // fitFiles.forEach((file) => promises.push(processFIT(file)));

      Promise.all(promises)
        .then(() => resolve())
        .catch((error) => reject(error));
    });
  });
};

// 3. Aggregate GeoJSON Files
const aggregateGeoJSON = () => {
  return new Promise((resolve, reject) => {
    try {
      const processedFiles = fs.readdirSync(userProcessedDir).filter((file) => file.endsWith('.geojson'));
      const features = [];

      processedFiles.forEach((file) => {
        const filePath = path.join(userProcessedDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        features.push(data);
      });

      const aggregatedGeoJSON = {
        type: 'FeatureCollection',
        features: features,
      };

      const outputPath = path.join(userProcessedDir, 'all_activities.geojson');
      fs.writeFileSync(outputPath, JSON.stringify(aggregatedGeoJSON, null, 2));
      console.log(`✅ Aggregated GeoJSON for StravaId ${StravaId}`);
      resolve();
    } catch (error) {
      reject(new Error(`Failed to aggregate GeoJSON files: ${error.message}`));
    }
  });
};

// Main Execution Function
const main = async () => {
  try {
    console.log(`🚀 Starting data processing for StravaId ${StravaId}...`);
    cleanProcessedDir(); // Clean old data
    await copyProfileImage(); // Copy profile.jpg
    await parseActivitiesCSV();
    await parseActivityFiles();
    await aggregateGeoJSON();
    console.log(`🎉 Data processing complete for StravaId ${StravaId}`);
  } catch (error) {
    console.error(`❌ Error processing data for StravaId ${StravaId}:`, error.message);
    process.exit(1);
  }
};

main();