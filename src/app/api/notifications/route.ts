import { NextResponse } from 'next/server';

// Stockage des clients connectés avec leur contrôleur
const clients = new Map<string, ReadableStreamDefaultController>();
let clientId = 0;

export async function GET() {
  const currentClientId = (clientId++).toString();
  
  const stream = new ReadableStream({
    start(controller) {
      clients.set(currentClientId, controller);
      
      // Envoyer un message initial
      controller.enqueue('data: {"type":"connected"}\n\n');
    },
    cancel() {
      clients.delete(currentClientId);
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// Fonction pour envoyer une notification à tous les clients
export function sendNotificationToAll(data: any) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  
  for (const [id, client] of clients.entries()) {
    try {
      client.enqueue(message);
    } catch (error) {
      console.error('Error sending message to client:', error);
      clients.delete(id);
    }
  }
}
