import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    console.log('📤 파일 업로드 시작');
    
    const formData = await request.formData();
    const files = formData.getAll('videos');
    
    console.log(`📁 업로드할 파일 수: ${files.length}`);
    
    if (files.length === 0) {
      console.log('❌ 업로드할 파일이 없음');
      return NextResponse.json({ message: '업로드할 파일이 없습니다.' }, { status: 400 });
    }
    
    const videoDir = path.join(process.cwd(), 'public', 'video');
    
    // 디렉토리 존재 확인 및 생성
    if (!fs.existsSync(videoDir)) {
      console.log('📂 비디오 디렉토리 생성:', videoDir);
      fs.mkdirSync(videoDir, { recursive: true });
    }
    
    let uploadedCount = 0;
    const errors = [];
    
    for (const file of files) {
      try {
        console.log(`📄 처리 중: ${file.name} (${file.size} bytes)`);
        
        // 파일 유효성 검사
        if (!file.type.startsWith('video/')) {
          console.log(`❌ 비디오 파일이 아님: ${file.name} (${file.type})`);
          errors.push(`${file.name}: 비디오 파일이 아닙니다`);
          continue;
        }
        
        // 파일 크기 제한 (100MB)
        const maxSize = 100 * 1024 * 1024;
        if (file.size > maxSize) {
          console.log(`❌ 파일 크기 초과: ${file.name} (${file.size} bytes)`);
          errors.push(`${file.name}: 파일 크기가 너무 큽니다 (최대 100MB)`);
          continue;
        }
        
        // 안전한 파일명 생성
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = path.join(videoDir, safeName);
        
        // 중복 파일명 처리
        let finalPath = filePath;
        let counter = 1;
        while (fs.existsSync(finalPath)) {
          const ext = path.extname(safeName);
          const nameWithoutExt = path.basename(safeName, ext);
          finalPath = path.join(videoDir, `${nameWithoutExt}_${counter}${ext}`);
          counter++;
        }
        
        console.log(`💾 저장 경로: ${finalPath}`);
        
        // 파일 저장
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fs.writeFileSync(finalPath, buffer);
        
        uploadedCount++;
        console.log(`✅ 업로드 완료: ${path.basename(finalPath)}`);
        
      } catch (fileError) {
        console.error(`❌ 파일 처리 실패: ${file.name}`, fileError);
        errors.push(`${file.name}: ${fileError.message}`);
      }
    }
    
    console.log(`🎉 업로드 완료: ${uploadedCount}개 성공, ${errors.length}개 실패`);
    
    const response = {
      uploaded: uploadedCount,
      total: files.length,
      errors: errors
    };
    
    if (uploadedCount === 0) {
      return NextResponse.json({ 
        message: '업로드된 파일이 없습니다.', 
        ...response 
      }, { status: 400 });
    }
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('💥 업로드 처리 중 오류:', error);
    return NextResponse.json({ 
      message: '서버 오류가 발생했습니다.', 
      error: error.message 
    }, { status: 500 });
  }
}