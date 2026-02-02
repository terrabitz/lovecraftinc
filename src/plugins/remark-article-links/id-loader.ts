import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type { ArticleTypeConfig } from './types.js';

export function loadValidIds(
  contentDir: string,
  articleTypes: ArticleTypeConfig[]
): Set<string> {
  const validIds = new Set<string>();
  const resolvedContentDir = path.resolve(process.cwd(), contentDir);

  for (const articleType of articleTypes) {
    const collectionPath = path.join(resolvedContentDir, articleType.contentPath);

    if (!fs.existsSync(collectionPath)) {
      continue;
    }

    const files = fs.readdirSync(collectionPath);

    for (const file of files) {
      if (!file.endsWith('.md') && !file.endsWith('.mdx')) {
        continue;
      }

      const filePath = path.join(collectionPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const { data: frontmatter } = matter(content);

      const id = frontmatter[articleType.idField];
      if (typeof id === 'string') {
        validIds.add(id.toUpperCase());
      }
    }
  }

  return validIds;
}
