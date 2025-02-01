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


const UserRawActivityDir = path.join(userRawDir,"activities")

// 2. Parse .gpx.gz and .fit.gz files
const parseActivityFiles = () => {
  return new Promise((resolve, reject) => {
    fs.readdir(UserRawActivityDir, (err, files) => {
      if (err) return reject(new Error(`Failed to read directory ${UserRawActivityDir}: ${err.message}`));

      const gpxFiles = files.filter((file) => file.endsWith('.gpx'));
      const fitFiles = files.filter((file) => file.endsWith('.fit'));

      const processGPX = (file) => {
        return new Promise((res, rej) => {
          const filePath = path.join(UserRawActivityDir, file);
          fs.readFile(filePath, (err, data) => {
            if (err) return rej(new Error(`Failed to read file ${filePath}: ${err.message}`));

            gpxParse.parseGpx(data.toString(), (error, gpxData) => {
              if (error) return rej(new Error(`Failed to parse GPX data from ${filePath}: ${error.message}`));

              const geojson = {
                type: 'Feature',
                properties: {
                  name: gpxData.metadata.name || 'Activity',
                  time: gpxData.metadata.time || null,
                },
                geometry: {
                  type: 'LineString',
                  coordinates: [],
                },
              };

              gpxData.tracks.forEach((track) => {
                track.segments.forEach((segment) => {
                  segment.forEach((point) => {
                    geojson.geometry.coordinates.push([point.lon, point.lat]);
                  });
                });
              });

              const outputFileName = file.replace('.gpx', '.geojson');
              const outputPath = path.join(userProcessedDir, outputFileName);
              fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2));
              console.log(`✅ Parsed and saved ${outputFileName} for StravaId ${StravaId}`);
              res();
            });
          });
        });
      };

      const processFIT = (file) => {
        return new Promise((res, rej) => {
          const filePath = path.join(UserRawActivityDir, file);
          fs.readFile(filePath, (err, data) => {
            if (err) return rej(new Error(`Failed to read file ${filePath}: ${err.message}`));

            const fitParser = new FitParser({
              force: true,
              speedUnit: 'm/s',
              lengthUnit: 'meter',
              temperatureUnit: 'celsius',
              elapsedRecordField: true,
              mode: 'list',
            });

            fitParser.parse(data, (error, fitData) => {
              if (error) return rej(new Error(`Failed to parse FIT data from ${filePath}: ${error.message}`));

              // Extract coordinates
              const coordinates = fitData.records
                .filter((record) => record.position_lat && record.position_long)
                .map((record) => [
                  record.position_long * (180 / Math.pow(2, 31)),
                  record.position_lat * (180 / Math.pow(2, 31)),
                ]);

              const geojson = {
                type: 'Feature',
                properties: {
                  name: (fitData.activity && fitData.activity.name) || 'Activity',
                  time: (fitData.activity && fitData.activity.start_time) || null,
                },
                geometry: {
                  type: 'LineString',
                  coordinates: coordinates,
                },
              };

              const outputFileName = file.replace('.fit', '.geojson');
              const outputPath = path.join(userProcessedDir, outputFileName);
              fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2));
              console.log(`✅ Parsed and saved ${outputFileName} for StravaId ${StravaId}`);
              res();
            });
          });
        });
      };

      // Process all GPX and FIT files
      const promises = [];
      gpxFiles.forEach((file) => promises.push(processGPX(file)));
      //fitFiles.forEach((file) => promises.push(processFIT(file)));
      // temporaly disable fit file processing

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
