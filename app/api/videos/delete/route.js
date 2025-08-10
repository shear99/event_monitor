import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    console.log('🗑️ 파일 삭제 시작');
    
    const { filename } = await request.json();
    
    if (!filename) {
      console.log('❌ 파일명이 제공되지 않음');
      return NextResponse.json({ message: '파일명이 필요합니다.' }, { status: 400 });
    }
    
    console.log(`📄 삭제할 파일: ${filename}`);
    
    const videoDir = path.join(process.cwd(), 'public', 'video');
    const filePath = path.join(videoDir, filename);
    
    // 파일 존재 확인
    if (!fs.existsSync(filePath)) {
      console.log(`❌ 파일을 찾을 수 없음: ${filePath}`);
      return NextResponse.json({ message: '파일을 찾을 수 없습니다.' }, { status: 404 });
    }
    
    // 파일 삭제
    fs.unlinkSync(filePath);
    console.log(`✅ 파일 삭제 완료: ${filename}`);
    
    return NextResponse.json({ message: '파일이 삭제되었습니다.' });
    
  } catch (error) {
    console.error('💥 파일 삭제 중 오류:', error);
    return NextResponse.json({ 
      message: '파일 삭제에 실패했습니다.', 
      error: error.message 
    }, { status: 500 });
  }
}