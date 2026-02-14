import type { APIRoute } from 'astro';
import { Resvg } from '@cf-wasm/resvg';
import { satori } from '@cf-wasm/satori';
import fontData from '98.css/dist/ms_sans_serif.woff?arraybuffer';
import logoDataUri from '../../assets/Logo.png?w=180&format=png&inline';

export const prerender = false;

function getRandomHexColor(): string {
  const value = Math.floor(Math.random() * 0xffffff);
  return `#${value.toString(16).padStart(6, '0')}`;
}

function buildMarkup() {
  return {
    type: 'div',
    props: {
      style: {
        width: 600,
        height: 400,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1a1a1a',
        fontFamily: 'MS Sans Serif',
        color: getRandomHexColor(),
        fontSize: 32,
      },
      children: [
        {
          type: 'img',
          props: {
            src: logoDataUri,
            width: 180,
            height: 174,
            style: { marginBottom: 24 },
          },
        },
        'Hello',
      ],
    },
  };
}

export const GET: APIRoute = async () => {
  const svg = await satori(buildMarkup() as any, {
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