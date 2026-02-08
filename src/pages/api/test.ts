import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = ({params, request}) => {
  const url = new URL(request.url);
  const title = url.searchParams.get('title');
  const randomNumber = Math.floor(Math.random() * 100);
  return new Response(JSON.stringify({ 
    randomNumber,
    title: title,
    foo: "bar",
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};