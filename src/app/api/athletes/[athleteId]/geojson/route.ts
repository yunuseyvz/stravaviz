// src/app/api/athletes/[athleteId]/geojson/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
// Import Turf’s simplify function (and helpers if needed)
import simplify from '@turf/simplify';
// Turf expects GeoJSON types from @turf/helpers
import { FeatureCollection } from 'geojson';

export async function GET(request: NextRequest, { params }: {  params:Promise<{ athleteId: string }>  }) {
  const { athleteId } = await params;
  const { searchParams } = new URL(request.url);
  
  // Determine which file to load. Default is the aggregated file.
  const fileName = searchParams.get('file') || 'all_activities.geojson';
  const smooth = searchParams.get('smooth') === 'true';
  
  // Build the absolute path to the file (adjust as needed for your project structure)
  const filePath = path.join(process.cwd(), 'src','data', 'users', 'processed', athleteId, fileName);
  
  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    let geojsonData: FeatureCollection = JSON.parse(rawData);

    if (smooth) {
      // Use Turf’s simplify function to smooth the geometries.
      // You can adjust the tolerance (here set to 0.001) and highQuality flag as needed.
      geojsonData = simplify(geojsonData, { tolerance: 0.001, highQuality: true });
    }

    return new NextResponse(JSON.stringify(geojsonData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}
