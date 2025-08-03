import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'public', 'data', 'config.json');

export async function GET() {
  try {
    let config = {
      clockTimeFontSize: 120,
      clockDateFontSize: 60,
      clockPeriodFontSize: 40,
      subtitleFontSize: 100,
      subtitleSmallFontSize: 50,
      subtitleLineHeight: 1.2
    };
    
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf8');
      config = { ...config, ...JSON.parse(data) };
    }
    
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: '설정 읽기 실패' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const config = await request.json();
    
    // 디렉토리가 없으면 생성
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: '설정 저장 실패' }, { status: 500 });
  }
}