// file: src/app/api/athletes/[athleteId]/correlation/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest, 
  { params }: { params: { athleteId: string } }
) {
  const { athleteId } = params;

  // In your pipeline, "all_correlations.json" was created in "processed/<athleteId>/correlation/"
  const correlationDir = path.join(
    process.cwd(),
    "src",
    "data",
    "users",
    "processed",
    athleteId,
    "correlation"
  );
  const correlationFile = path.join(correlationDir, "all_correlations.json");

  try {
    if (!fs.existsSync(correlationFile)) {
      throw new Error("Correlation file not found.");
    }
    const rawData = fs.readFileSync(correlationFile, "utf-8");
    const correlations = JSON.parse(rawData); // an array of objects

    return NextResponse.json(correlations, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 404 });
  }
}
