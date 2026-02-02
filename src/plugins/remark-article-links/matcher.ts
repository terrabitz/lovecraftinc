import type { ArticleTypeConfig, ArticleMatch } from './types.js';

export function resolveArticleType(
  id: string,
  articleTypes: ArticleTypeConfig[]
): ArticleTypeConfig | null {
  const normalizedId = id.toUpperCase();
  for (const articleType of articleTypes) {
    const pattern = new RegExp(articleType.pattern.source, 'i');
    if (pattern.test(normalizedId)) {
      return articleType;
    }
  }
  return null;
}

export function buildArticleUrl(id: string, urlPrefix: string): string {
  return `${urlPrefix}/${id.toUpperCase()}`;
}

export function findArticleReferences(
  text: string,
  articleTypes: ArticleTypeConfig[]
): ArticleMatch[] {
  const matches: ArticleMatch[] = [];
  const combinedPattern = articleTypes
    .map((t) => `(${t.pattern.source})`)
    .join('|');
  const regex = new RegExp(combinedPattern, 'gi');

  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const id = match[0].toUpperCase();
    const articleType = resolveArticleType(id, articleTypes);
    if (articleType) {
      matches.push({
        id,
        start: match.index,
        end: match.index + match[0].length,
        urlPrefix: articleType.urlPrefix,
      });
    }
  }

  return matches;
}
