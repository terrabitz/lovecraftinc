import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkFrontmatter from 'remark-frontmatter';
import remarkStringify from 'remark-stringify';
import matter from 'gray-matter';
import { remarkArticleLinks, clearArticleCache } from '../index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, 'fixtures');

const articleTypes = [
  {
    pattern: /EID-EMP-\d+/,
    urlPrefix: '/employees',
    contentPath: 'employees',
  },
  {
    pattern: /EID-ORG-\d+/,
    urlPrefix: '/organizations',
    contentPath: 'organizations',
  },
  {
    pattern: /EID-\d+/,
    urlPrefix: '/anomalies',
    contentPath: 'anomalies',
  },
];

function getAllMarkdownFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllMarkdownFiles(fullPath));
    } else if (entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

async function processMarkdown(markdown: string, contentDir: string): Promise<string> {
  const { data: frontmatter } = matter(markdown);

  const result = await unified()
    .use(remarkParse)
    .use(remarkFrontmatter, ['yaml'])
    .use(remarkArticleLinks, { contentDir, articleTypes })
    .use(remarkStringify)
    .process({
      value: markdown,
      data: { astro: { frontmatter } },
    });
  return String(result);
}

const fixtures = readdirSync(fixturesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

describe('remarkArticleLinks', () => {
  it.each(fixtures)('%s', async (fixtureName) => {
    clearArticleCache();

    const fixtureDir = join(fixturesDir, fixtureName);
    const inputDir = join(fixtureDir, 'input');
    const expectedDir = join(fixtureDir, 'expected');

    const inputFiles = getAllMarkdownFiles(inputDir);

    for (const inputFile of inputFiles) {
      const relativePath = relative(inputDir, inputFile);
      const expectedFile = join(expectedDir, relativePath);

      const input = readFileSync(inputFile, 'utf-8');
      const expected = readFileSync(expectedFile, 'utf-8');

      const result = await processMarkdown(input, inputDir);
      expect(result).toBe(expected);
    }
  });
});
