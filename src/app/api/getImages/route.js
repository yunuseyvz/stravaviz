import fs from 'fs';
import path from 'path';

export async function GET(req) {
  const mediaDir = path.join(process.cwd(), 'public/media');
  const files = fs.readdirSync(mediaDir);
  const images = files
    .filter(file => /\.(jpg|jpeg|png)$/i.test(file))
    .map(file => ({
      src: `/media/${file}`,
      alt: file.split('.')[0],
      title: file.split('.')[0].replace(/_/g, ' ')
    }));

  return new Response(JSON.stringify(images), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}