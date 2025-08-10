import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const { oldName, newName } = await request.json();
    
    if (!oldName || !newName) {
      return NextResponse.json({ message: '파일명이 필요합니다.' }, { status: 400 });
    }
    
    const videoDir = path.join(process.cwd(), 'public', 'video');
    const oldPath = path.join(videoDir, oldName);
    const newPath = path.join(videoDir, newName);
    
    // 파일 존재 확인
    if (!fs.existsSync(oldPath)) {
      return NextResponse.json({ message: '원본 파일을 찾을 수 없습니다.' }, { status: 404 });
    }
    
    // 새 파일명이 이미 존재하는지 확인
    if (fs.existsSync(newPath)) {
      return NextResponse.json({ message: '같은 이름의 파일이 이미 존재합니다.' }, { status: 409 });
    }
    
    // 파일명 변경
    fs.renameSync(oldPath, newPath);
    
    return NextResponse.json({ message: '파일명이 변경되었습니다.' });
  } catch (error) {
    console.error('파일명 변경 실패:', error);
    return NextResponse.json({ message: '파일명 변경에 실패했습니다.' }, { status: 500 });
  }
}