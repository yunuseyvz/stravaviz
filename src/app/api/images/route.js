import fs from 'fs';
import path from 'path';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId'); // Extract userId from the query params

    if (!userId) {
      return new Response('Missing userId parameter', { status: 400 });
    }

    const imagePath = path.join(process.cwd(), 'src', 'data', 'users', 'processed', userId, 'profile.jpg');


    if (!fs.existsSync(imagePath)) {
      return new Response('Image not found', { status: 404 });
    }

    const imageBuffer = fs.readFileSync(imagePath);
    return new Response(imageBuffer, {
      status: 200,
      headers: { 'Content-Type': 'image/jpeg' },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
