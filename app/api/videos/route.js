import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ORDER_FILE = path.join(process.cwd(), 'public', 'data', 'video-order.json');

export async function GET() {
  try {
    const videoDir = path.join(process.cwd(), 'public', 'video');
    
    if (!fs.existsSync(videoDir)) {
      return NextResponse.json([]);
    }
    
    const files = fs.readdirSync(videoDir);
    const videoFiles = files.filter(file => {
      const isVideo = file.toLowerCase().endsWith('.mp4') || 
                     file.toLowerCase().endsWith('.webm') || 
                     file.toLowerCase().endsWith('.ogg');
      const isNotTempFile = !file.startsWith('._') && !file.startsWith('.DS_Store');
      return isVideo && isNotTempFile;
    });
    
    // 저장된 순서가 있으면 그 순서대로, 없으면 알파벳 순서
    let orderedFiles = videoFiles.sort();
    
    if (fs.existsSync(ORDER_FILE)) {
      try {
        const orderData = JSON.parse(fs.readFileSync(ORDER_FILE, 'utf8'));
        if (orderData.order && Array.isArray(orderData.order)) {
          // 저장된 순서에 따라 정렬하되, 새 파일은 끝에 추가
          const savedOrder = orderData.order.filter(file => videoFiles.includes(file));
          const newFiles = videoFiles.filter(file => !orderData.order.includes(file));
          orderedFiles = [...savedOrder, ...newFiles.sort()];
        }
      } catch (error) {
        console.error('Error reading video order:', error);
      }
    }
    
    return NextResponse.json(orderedFiles);
  } catch (error) {
    console.error('Error reading video directory:', error);
    return NextResponse.json([]);
  }
}