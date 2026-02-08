import satori from 'satori';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;

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

export async function generateOgImage(title: string, projectRoot = process.cwd()): Promise<Uint8Array> {
  const resolve = (rel: string) => fs.readFileSync(path.resolve(projectRoot, rel));
  const fontRegular = resolve('node_modules/98.css/dist/ms_sans_serif.woff');
  const fontBold = resolve('node_modules/98.css/dist/ms_sans_serif_bold.woff');
  const logoData = resolve('src/assets/Logo.png');
  const logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;

  const svg = await satori(buildElementTree(title, logoBase64) as any, {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    fonts: [
      { name: 'MS Sans Serif', data: fontRegular, weight: 400, style: 'normal' as const },
      { name: 'MS Sans Serif', data: fontBold, weight: 700, style: 'normal' as const },
    ],
  });

  const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
}
