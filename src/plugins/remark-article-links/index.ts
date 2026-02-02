import type { Root, Text, Link, Parent } from 'mdast';
import { visit, SKIP } from 'unist-util-visit';
import { loadArticles } from './id-loader.js';
import { findArticleReferences, buildArticleUrl } from './matcher.js';
import type { RemarkArticleLinksConfig, ArticleInfo } from './types.js';

let cachedArticles: Map<string, ArticleInfo> | null = null;

function getCurrentPageId(
  frontmatter: Record<string, unknown> | undefined
): string | null {
  if (!frontmatter) return null;
  const id = frontmatter.id;
  return typeof id === 'string' ? id.toUpperCase() : null;
}

function createTextNode(value: string): Text {
  return { type: 'text', value };
}

function createLinkNode(url: string, text: string, title: string): Link {
  return {
    type: 'link',
    url,
    title,
    children: [createTextNode(text)],
  };
}

function transformText(
  text: string,
  articles: Map<string, ArticleInfo>,
  currentPageId: string | null,
  articleTypes: RemarkArticleLinksConfig['articleTypes']
): (Text | Link)[] {
  const matches = findArticleReferences(text, articleTypes);
  if (matches.length === 0) {
    return [createTextNode(text)];
  }

  const result: (Text | Link)[] = [];
  let lastIndex = 0;

  for (const match of matches) {
    const isCurrentPage = currentPageId && match.id === currentPageId;
    const articleInfo = articles.get(match.id);

    if (match.start > lastIndex) {
      result.push(createTextNode(text.slice(lastIndex, match.start)));
    }

    if (articleInfo && !isCurrentPage) {
      const url = buildArticleUrl(match.id, match.urlPrefix);
      result.push(createLinkNode(url, match.id, articleInfo.name));
    } else {
      result.push(createTextNode(text.slice(match.start, match.end)));
    }

    lastIndex = match.end;
  }

  if (lastIndex < text.length) {
    result.push(createTextNode(text.slice(lastIndex)));
  }

  return result;
}

export function remarkArticleLinks(config: RemarkArticleLinksConfig) {
  return function (tree: Root, file: { data: { astro?: { frontmatter?: Record<string, unknown> } } }) {
    if (!cachedArticles) {
      cachedArticles = loadArticles(config.contentDir, config.articleTypes);
    }

    const frontmatter = file.data?.astro?.frontmatter;
    const currentPageId = getCurrentPageId(frontmatter);

    visit(tree, 'text', (node: Text, index: number | undefined, parent: Parent | undefined) => {
      if (index === undefined || !parent) return;
      if (parent.type === 'link') return;

      const transformed = transformText(
        node.value,
        cachedArticles!,
        currentPageId,
        config.articleTypes
      );

      if (transformed.length === 1 && transformed[0].type === 'text' && transformed[0].value === node.value) {
        return;
      }

      parent.children.splice(index, 1, ...transformed);
      return [SKIP, index + transformed.length] as const;
    });
  };
}

export function clearCache(): void {
  cachedArticles = null;
}

export type { RemarkArticleLinksConfig, ArticleTypeConfig } from './types.js';
