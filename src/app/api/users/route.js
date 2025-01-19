import fs from 'fs';
import path from 'path';

export async function GET(req) {
  try {
    const usersFilePath = path.join(process.cwd(), 'src', 'data', 'users.json');
    console.log("File path:", usersFilePath);

    if (!fs.existsSync(usersFilePath)) {
      console.log("File does not exist. Returning empty array.");
      return new Response(JSON.stringify([]), { status: 200 });
    }

    const usersData = fs.readFileSync(usersFilePath, 'utf8');
    console.log("Users data:", usersData);

    const users = JSON.parse(usersData);
    return new Response(JSON.stringify(users), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error reading users.json:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
