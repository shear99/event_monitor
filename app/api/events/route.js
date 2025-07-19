import { eventData } from '@/lib/eventUtils';

export async function GET() {
  return Response.json(eventData);
}