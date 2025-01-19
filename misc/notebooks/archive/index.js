import fs from 'fs';
import path from 'path';

export async function GET(req) {
  try {
    const usersFilePath = path.join(process.cwd(), 'data', 'users.json');
    console.log("File path:", usersFilePath); // Log the file path

    if (!fs.existsSync(usersFilePath)) {
      console.log("File does not exist. Returning empty array.");
      return new Response(JSON.stringify([]), { status: 200 });
    }

    const usersData = fs.readFileSync(usersFilePath, 'utf8');
    console.log("File data:", usersData); // Log the file contents

    const users = JSON.parse(usersData);
    return new Response(JSON.stringify(users), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error in API route:", error); // Log any error
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}

export function POST(req) {
  return new Response('Method Not Allowed', { status: 405 });
}
