import type { APIRoute } from 'astro';
import { Resvg } from '@cf-wasm/resvg';
import { satori } from '@cf-wasm/satori';
import { html } from 'satori-html';
import fontData from '98.css/dist/ms_sans_serif.woff?arraybuffer';

export const prerender = false;

function getRandomHexColor(): string {
  const value = Math.floor(Math.random() * 0xffffff);
  return `#${value.toString(16).padStart(6, '0')}`;
}

export const GET: APIRoute = async ({params, request}) => {
  const shapeColor = getRandomHexColor();
  
  const markup = html(`
    <div style="
      width: 600px;
      height: 400px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #1a1a1a;
      font-family: 'MS Sans Serif';
      color: #ffffff;
      font-size: 32px;
    ">
      <div style="
        width: 120px;
        height: 120px;
        display: flex;
        border-radius: 50%;
        background: ${shapeColor};
        margin-bottom: 24px;
      "></div>
      Hello
    </div>
  `);

  const svg = await satori(markup, {
    width: 600,
    height: 400,
    fonts: [
      {
        name: 'MS Sans Serif',
        data: fontData,
        weight: 400,
        style: 'normal',
      },
    ],
  });

  const resvgInstance = await Resvg.async(svg, {});
  const pngData = resvgInstance.render();
  const pngBuffer = pngData.asPng();
  
  return new Response(new Uint8Array(pngBuffer), {
    status: 200,
    headers: { 
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=3600'
    },
  });
};