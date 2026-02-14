import { Resvg } from '@cf-wasm/resvg';
import { satori } from '@cf-wasm/satori';

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;

export interface OgImageAssets {
  fontRegular: ArrayBuffer | Buffer;
  fontBold: ArrayBuffer | Buffer;
  fallbackFontRegular: ArrayBuffer | Buffer;
  fallbackFontBold: ArrayBuffer | Buffer;
  logoDataUri: string;
}

function buildElementTree(title: string, logoBase64: string) {
  return {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#018281',
        padding: '32px',
      },
      children: {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            backgroundColor: '#c0c0c0',
            borderTop: '2px solid #fff',
            borderLeft: '2px solid #fff',
            borderRight: '2px solid #0a0a0a',
            borderBottom: '2px solid #0a0a0a',
          },
          children: [
            buildTitleBar(),
            buildBody(title, logoBase64),
            buildStatusBar(),
          ],
        },
      },
    },
  };
}

function buildTitleBar() {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(90deg, #000080, #1084d0)',
        padding: '6px 12px',
        color: 'white',
        fontWeight: 700,
        fontSize: '24px',
      },
      children: 'Eidolon Capital Intranet',
    },
  };
}

function buildBody(title: string, logoBase64: string) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        padding: '24px',
        gap: '24px',
      },
      children: [
        {
          type: 'img',
          props: {
            src: logoBase64,
            width: 180,
            height: 180,
          },
        },
        {
          type: 'div',
          props: {
            style: {
              fontSize: '52px',
              fontWeight: 700,
              textAlign: 'center',
              color: '#222',
              maxWidth: '900px',
            },
            children: title,
          },
        },
      ],
    },
  };
}

function buildStatusBar() {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        padding: '6px 12px',
        fontSize: '16px',
        color: '#222',
        borderTop: '2px solid #808080',
      },
      children: 'Eidolon Capital Intranet Portal v1.0',
    },
  };
}

export async function generateOgImage(
  title: string,
  assets: OgImageAssets,
): Promise<Uint8Array> {
  const fonts = [
    { name: 'MS Sans Serif', data: assets.fontRegular, weight: 400, style: 'normal' as const },
    { name: 'MS Sans Serif', data: assets.fontBold, weight: 700, style: 'normal' as const },
    { name: 'Noto Sans', data: assets.fallbackFontRegular, weight: 400, style: 'normal' as const },
    { name: 'Noto Sans', data: assets.fallbackFontBold, weight: 700, style: 'normal' as const },
  ];

  const svg = await satori(buildElementTree(title, assets.logoDataUri) as any, {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    fonts,
  });

  const resvgInstance = await Resvg.async(svg, {});
  const pngData = resvgInstance.render();
  const pngBuffer = pngData.asPng();

  return new Uint8Array(pngBuffer);
}
