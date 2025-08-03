import { NextResponse } from 'next/server';

let clients = new Set();

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const clientId = Date.now();
      const client = { id: clientId, controller };
      clients.add(client);
      
      controller.enqueue(`data: {"type":"connected","id":${clientId}}\n\n`);
      
      const cleanup = () => {
        clients.delete(client);
      };
      
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

export async function POST(request) {
  const { action } = await request.json();
  
  const zoomMessage = `data: {"type":"zoom","action":"${action}","timestamp":${Date.now()}}\n\n`;
  
  clients.forEach(client => {
    try {
      client.controller.enqueue(zoomMessage);
    } catch (error) {
      clients.delete(client);
    }
  });
  
  return NextResponse.json({ 
    success: true, 
    clientCount: clients.size,
    message: `${clients.size}개 화면에 ${action} 신호를 전송했습니다.`
  });
}