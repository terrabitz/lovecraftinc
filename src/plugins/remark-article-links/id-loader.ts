import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type { ArticleTypeConfig, ArticleInfo } from './types.js';

export function loadArticles(
  contentDir: string,
  articleTypes: ArticleTypeConfig[]
): Map<string, ArticleInfo> {
  const articles = new Map<string, ArticleInfo>();
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
      const title = frontmatter[articleType.titleField];
      if (typeof id === 'string') {
        articles.set(id.toUpperCase(), {
          id: id.toUpperCase(),
          title: typeof title === 'string' ? title : id,
        });
      }
    }
  }

  return articles;
}

export function loadValidIds(
  contentDir: string,
  articleTypes: ArticleTypeConfig[]
): Set<string> {
  const articles = loadArticles(contentDir, articleTypes);
  return new Set(articles.keys());
}
