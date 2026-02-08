import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = ({request}) => {
  const randomNumber = Math.floor(Math.random() * 100);
  return new Response(JSON.stringify({ randomNumber }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};