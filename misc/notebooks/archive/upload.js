// pages/api/upload.js

import nextConnect from 'next-connect';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';

// Configure multer storage
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const username = req.body.username;
      if (!username) {
        return cb(new Error('Username is required'), null);
      }
      const userDir = path.join(process.cwd(), 'data', 'users', username, 'raw');
      fs.mkdirSync(userDir, { recursive: true });
      cb(null, userDir);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
});

const apiRoute = nextConnect({
  onError(error, req, res) {
    res.status(501).json({ error: `Sorry something Happened! ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

// Middleware to handle multipart/form-data
apiRoute.use(upload.array('files'));

apiRoute.post(async (req, res) => {
  const username = req.body.username;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  // After files are uploaded, trigger data processing
  try {
    const processingScript = path.join(process.cwd(), 'scripts', 'processUserData.js');
    const command = `node ${processingScript} ${username}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error processing data for user ${username}:`, stderr);
        return res.status(500).json({ error: 'Error processing data' });
      }
      console.log(`Data processed for user ${username}:`, stdout);
      res.status(200).json({ message: 'Upload and processing successful' });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during processing' });
  }
});

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, since we're using multer
  },
};

export default apiRoute;
