import { NextResponse } from 'next/server';

let clients = new Set();

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const clientId = Date.now();
      const client = { id: clientId, controller };
      clients.add(client);
      
      // 연결 확인 메시지
      controller.enqueue(`data: {"type":"connected","id":${clientId}}\n\n`);
      
      // 클라이언트 연결 해제 시 정리
      const cleanup = () => {
        clients.delete(client);
      };
      
      // 30초마다 keep-alive 신호 전송
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(`data: {"type":"ping"}\n\n`);
        } catch (error) {
          clearInterval(keepAlive);
          cleanup();
        }
      }, 30000);
      
      return cleanup;
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}

export async function POST() {
  // 모든 연결된 클라이언트에게 새로고침 신호 전송
  const refreshMessage = `data: {"type":"refresh","timestamp":${Date.now()}}\n\n`;
  
  clients.forEach(client => {
    try {
      client.controller.enqueue(refreshMessage);
    } catch (error) {
      clients.delete(client);
    }
  });
  
  return NextResponse.json({ 
    success: true, 
    clientCount: clients.size,
    message: `${clients.size}개 화면에 새로고침 신호를 전송했습니다.`
  });
}