import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const videoDir = path.join(process.cwd(), 'public', 'video');
    
    if (!fs.existsSync(videoDir)) {
      return NextResponse.json([]);
    }
    
    const files = fs.readdirSync(videoDir);
    const videoFiles = files.filter(file => 
      file.toLowerCase().endsWith('.mp4') || 
      file.toLowerCase().endsWith('.webm') || 
      file.toLowerCase().endsWith('.ogg')
    ).sort();
    
    return NextResponse.json(videoFiles);
  } catch (error) {
    console.error('Error reading video directory:', error);
    return NextResponse.json([]);
  }
}