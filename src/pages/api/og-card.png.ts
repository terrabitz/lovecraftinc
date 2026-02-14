import type { APIRoute } from 'astro';
import fontRegularData from '98.css/dist/ms_sans_serif.woff?arraybuffer';
import fontBoldData from '98.css/dist/ms_sans_serif_bold.woff?arraybuffer';
import fallbackFontRegularData from '@fontsource/noto-sans/files/noto-sans-latin-400-normal.woff?arraybuffer';
import fallbackFontBoldData from '@fontsource/noto-sans/files/noto-sans-latin-700-normal.woff?arraybuffer';
import logoDataUri from '../../assets/Logo.png?w=180&format=png&inline';
import { generateOgImage } from '../../utils/og-image';

export const prerender = false;
const MAX_TITLE_LENGTH = 140;

export const GET: APIRoute = async ({ request }) => {
  const title = new URL(request.url).searchParams.get('title');
  if (!title) {
    return Response.json({ error: 'must specify title' }, { status: 400 });
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return Response.json(
      {
        error: 'title exceeds maximum length',
        maxLength: MAX_TITLE_LENGTH,
      },
      { status: 422 }
    );
  }
  
  const png = await generateOgImage(title, {
    fontRegular: fontRegularData,
    fontBold: fontBoldData,
    fallbackFontRegular: fallbackFontRegularData,
    fallbackFontBold: fallbackFontBoldData,
    logoDataUri,
  });

  return new Response(Buffer.from(png), {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, s-maxage=31536000, stale-while-revalidate=86400, immutable',
    },
  });
};