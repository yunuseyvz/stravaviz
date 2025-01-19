// scripts/processAllUsers.js

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const csv = require('csv-parser');

// Path to the users.json file
const usersFilePath = path.join(__dirname, '..', 'data', 'users.json');

// Path to the raw users directory
const rawUsersDir = path.join(__dirname, '..', 'data', 'users', 'raw');

// Function to read profile.csv and extract Nachname (username)
const getUsernameFromProfile = (profileCsvPath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(profileCsvPath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        if (results.length === 0) {
          return reject(new Error(`No data found in ${profileCsvPath}`));
        }
        // Assuming Nachname is in the first row
        const username = results[0].Nachname;
        if (!username) {
          return reject(new Error(`'Nachname' column not found in ${profileCsvPath}`));
        }
        resolve(username);
      })
      .on('error', (err) => reject(err));
  });
};

// Function to validate StravaId (digits only)
const isValidStravaId = (StravaId) => /^[0-9]+$/.test(StravaId);

// Function to rebuild users.json
const rebuildUsersJson = async () => {
  try {
    // Read all directories in rawUsersDir
    const userDirs = fs.readdirSync(rawUsersDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('Strava-export_'))
      .map(dirent => dirent.name);

    const users = [];

    for (const dirName of userDirs) {
      const StravaId = dirName.replace('Strava-export_', '');
      if (!isValidStravaId(StravaId)) {
        console.warn(`⚠️ Invalid StravaId format for directory ${dirName}. Skipping user.`);
        continue;
      }

      const profileCsvPath = path.join(rawUsersDir, dirName, 'profile.csv');

      if (!fs.existsSync(profileCsvPath)) {
        console.warn(`⚠️ profile.csv not found for StravaId ${StravaId} in ${dirName}. Skipping user.`);
        continue;
      }

      try {
        const username = await getUsernameFromProfile(profileCsvPath);
        // Check for duplicate StravaId
        if (users.some(u => u.StravaId === StravaId)) {
          console.warn(`⚠️ Duplicate StravaId ${StravaId} found. Skipping user.`);
          continue;
        }
        // Check for duplicate username
        if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
          console.warn(`⚠️ Duplicate username ${username} found. Skipping user.`);
          continue;
        }

        users.push({
          username: username.trim(),
          StravaId: StravaId.trim(),
        });
        console.log(`✅ Extracted user: ${username} (StravaId: ${StravaId})`);
      } catch (error) {
        console.error(`❌ Failed to extract username for StravaId ${StravaId}: ${error.message}`);
        // Continue processing other users even if one fails
        continue;
      }
    }

    // Write the users array to users.json
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    console.log(`✅ Rebuilt users.json with ${users.length} users.`);
    return users;
  } catch (error) {
    console.error(`❌ Error rebuilding users.json: ${error.message}`);
    process.exit(1);
  }
};

// Function to process a single user
const processUser = (StravaId) => {
  return new Promise((resolve, reject) => {
    const command = `node ${path.join(__dirname, 'processUserData.js')} ${StravaId}`;

    console.log(`🔄 Processing data for StravaId: ${StravaId}...`);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error processing StravaId ${StravaId}:`, stderr);
        return reject(error);
      }
      console.log(stdout);
      resolve();
    });
  });
};

// Function to process all users sequentially
const processAllUsers = async () => {
  const users = await rebuildUsersJson();

  for (const user of users) {
    const { StravaId, username } = user;
    if (!StravaId) {
      console.warn(`⚠️ User ${username} does not have a StravaId. Skipping.`);
      continue;
    }

    try {
      await processUser(StravaId);
    } catch (error) {
      console.error(`❌ Failed to process data for StravaId ${StravaId}. Continuing with next user.`);
      // Continue processing other users even if one fails
      continue;
    }
  }

  console.log('🎉 All users have been processed.');
};

processAllUsers();
