import type { APIRoute } from 'astro';
import fontRegularData from '98.css/dist/ms_sans_serif.woff?arraybuffer';
import fontBoldData from '98.css/dist/ms_sans_serif_bold.woff?arraybuffer';
import logoDataUri from '../../assets/Logo.png?w=180&format=png&inline';
import { generateOgImage } from '../../utils/og-image';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const title = new URL(request.url).searchParams.get('title') ?? 'Hello';
  const png = await generateOgImage(title, {
    assets: {
      fontRegular: fontRegularData,
      fontBold: fontBoldData,
      logoDataUri,
    },
  });

  return new Response(Buffer.from(png), {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};