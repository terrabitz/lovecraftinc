import { describe, it, expect } from 'vitest';
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { generateOgImage } from '../og-image';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, 'fixtures', 'og-image');
const UPDATE_FIXTURES = process.env.UPDATE_FIXTURES === 'true';
const MAX_DIFF_PERCENT = 0.5;

interface Fixture {
  name: string;
  title: string;
}

function loadFixtures(): Fixture[] {
  return readdirSync(fixturesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const meta = JSON.parse(
        readFileSync(join(fixturesDir, entry.name, 'input.json'), 'utf-8'),
      );
      return { name: entry.name, title: meta.title };
    });
}

function readExpectedPng(fixtureName: string): PNG {
  const buffer = readFileSync(join(fixturesDir, fixtureName, 'expected.png'));
  return PNG.sync.read(buffer);
}

function writeExpected(fixtureName: string, data: Uint8Array): void {
  const dir = join(fixturesDir, fixtureName);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'expected.png'), data);
}

function comparePngs(actual: PNG, expected: PNG): { diffPixels: number; totalPixels: number; diffPercent: number } {
  const totalPixels = actual.width * actual.height;
  const diffPixels = pixelmatch(
    actual.data,
    expected.data,
    undefined,
    actual.width,
    actual.height,
    { threshold: 0.1 },
  );
  return { diffPixels, totalPixels, diffPercent: (diffPixels / totalPixels) * 100 };
}

describe('generateOgImage', () => {
  const fixtures = loadFixtures();

  it.each(fixtures)('$name', async ({ name, title }) => {
    const result = await generateOgImage(title);

    if (UPDATE_FIXTURES) {
      writeExpected(name, result);
      return;
    }

    const actual = PNG.sync.read(Buffer.from(result));
    const expected = readExpectedPng(name);

    expect(actual.width).toBe(expected.width);
    expect(actual.height).toBe(expected.height);

    const { diffPercent } = comparePngs(actual, expected);
    expect(diffPercent, `pixel diff was ${diffPercent.toFixed(2)}%, max allowed is ${MAX_DIFF_PERCENT}%`).toBeLessThanOrEqual(MAX_DIFF_PERCENT);
  });

  it('produces a valid PNG signature', async () => {
    const result = await generateOgImage('Test');
    const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    expect([...result.slice(0, 8)]).toEqual(pngSignature);
  });
});
