import type { APIRoute } from 'astro';
import { initWasm, Resvg } from '@resvg/resvg-wasm';
import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm';

export const prerender = false;

let initialized = false;

function getRandomHexColor(): string {
  const value = Math.floor(Math.random() * 0xffffff);
  return `#${value.toString(16).padStart(6, '0')}`;
}

export const GET: APIRoute = async ({params, request}) => {
  if (!initialized) {
    try {
      await initWasm(resvgWasm);
      initialized = true;
    } catch (e) {
    }
  }
  const shapeColor = getRandomHexColor();
  
  // Create a basic SVG with a random colored shape
  const svg = `
    <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="400" fill="#1a1a1a"/>
      <circle cx="300" cy="200" r="120" fill="${shapeColor}"/>
    </svg>
  `;

  // Convert SVG to PNG using resvg
  const resvg = new Resvg(svg, {
    font: {
      loadSystemFonts: false,
    },
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  
  return new Response(new Uint8Array(pngBuffer), {
    status: 200,
    headers: { 
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=3600'
    },
  });
};