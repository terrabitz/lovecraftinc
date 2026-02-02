import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import rehypeTooltip from '../index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, 'fixtures');

function loadFixture(name: string): { input: string; expected: string } {
  const fixtureDir = join(fixturesDir, name);
  return {
    input: readFileSync(join(fixtureDir, 'input.html'), 'utf-8'),
    expected: readFileSync(join(fixtureDir, 'expected.html'), 'utf-8'),
  };
}

async function processHtml(html: string): Promise<string> {
  const result = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeTooltip)
    .use(rehypeStringify)
    .process(html);
  return String(result);
}

const fixtures = readdirSync(fixturesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

describe('rehypeTooltip', () => {
  it.each(fixtures)('%s', async (fixtureName) => {
    const { input, expected } = loadFixture(fixtureName);
    const result = await processHtml(input);
    expect(result).toBe(expected);
  });
});
