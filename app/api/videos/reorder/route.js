import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ORDER_FILE = path.join(process.cwd(), 'public', 'data', 'video-order.json');

export async function POST(request) {
  try {
    const { videos } = await request.json();
    
    if (!videos || !Array.isArray(videos)) {
      return NextResponse.json(
        { error: '비디오 목록이 유효하지 않습니다' },
        { status: 400 }
      );
    }

    const orderData = {
      order: videos,
      updatedAt: new Date().toISOString()
    };

    const dataDir = path.dirname(ORDER_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(ORDER_FILE, JSON.stringify(orderData, null, 2));
    
    return NextResponse.json({
      success: true,
      message: '재생 순서가 변경되었습니다'
    });
  } catch (error) {
    console.error('Reorder error:', error);
    return NextResponse.json(
      { error: '순서 변경 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}