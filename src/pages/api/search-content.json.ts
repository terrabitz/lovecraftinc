import type { APIRoute } from 'astro';
import { getAllSearchableContent } from '../../utils/searchContent';

export const GET: APIRoute = async () => {
  const content = await getAllSearchableContent();
  
  return new Response(JSON.stringify(content), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
};
