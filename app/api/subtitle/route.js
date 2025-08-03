import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SUBTITLE_FILE = path.join(process.cwd(), 'public', 'data', 'subtitle.txt');

export async function GET() {
  try {
    let content = '';
    if (fs.existsSync(SUBTITLE_FILE)) {
      content = fs.readFileSync(SUBTITLE_FILE, 'utf8');
    }
    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json({ error: '파일 읽기 실패' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { content } = await request.json();
    
    // 디렉토리가 없으면 생성
    const dir = path.dirname(SUBTITLE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(SUBTITLE_FILE, content, 'utf8');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: '파일 저장 실패' }, { status: 500 });
  }
}