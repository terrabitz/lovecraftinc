import type { ArticleTypeConfig, ArticleInfo, TextNode, TransformedNode } from './types.js';
import { findArticleReferences, buildArticleUrl } from './matcher.js';

export function transformTextNode(
  node: TextNode,
  articles: Map<string, ArticleInfo>,
  currentPageId: string | null,
  articleTypes: ArticleTypeConfig[]
): TransformedNode[] {
  const text = node.value;
  const matches = findArticleReferences(text, articleTypes);

  const validMatches = matches.filter(
    (match) =>
      articles.has(match.id) &&
      (currentPageId === null || match.id !== currentPageId.toUpperCase())
  );

  if (validMatches.length === 0) {
    return [node];
  }

  const result: TransformedNode[] = [];
  let lastIndex = 0;

  for (const match of validMatches) {
    if (match.start > lastIndex) {
      result.push({
        type: 'text',
        value: text.slice(lastIndex, match.start),
      });
    }

    const articleInfo = articles.get(match.id)!;
    result.push({
      type: 'link',
      url: buildArticleUrl(match.id, match.urlPrefix),
      title: articleInfo.name,
      children: [{ type: 'text', value: match.id }],
    });

    lastIndex = match.end;
  }

  if (lastIndex < text.length) {
    result.push({
      type: 'text',
      value: text.slice(lastIndex),
    });
  }

  return result;
}
