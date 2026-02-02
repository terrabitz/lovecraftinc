import type { Root, Text, Link, Parent } from 'mdast';
import { visit, SKIP } from 'unist-util-visit';
import { loadValidIds } from './id-loader.js';
import { findArticleReferences, buildArticleUrl } from './matcher.js';
import type { RemarkArticleLinksConfig } from './types.js';

let cachedValidIds: Set<string> | null = null;

function getCurrentPageId(
  frontmatter: Record<string, unknown> | undefined,
  idFields: string[]
): string | null {
  if (!frontmatter) return null;
  
  for (const field of idFields) {
    const value = frontmatter[field];
    if (typeof value === 'string') {
      return value.toUpperCase();
    }
  }
  return null;
}

function createTextNode(value: string): Text {
  return { type: 'text', value };
}

function createLinkNode(url: string, text: string): Link {
  return {
    type: 'link',
    url,
    children: [createTextNode(text)],
  };
}

function transformText(
  text: string,
  validIds: Set<string>,
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
    const isValidId = validIds.has(match.id);

    if (match.start > lastIndex) {
      result.push(createTextNode(text.slice(lastIndex, match.start)));
    }

    if (isValidId && !isCurrentPage) {
      const url = buildArticleUrl(match.id, match.urlPrefix);
      result.push(createLinkNode(url, match.id));
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
  const idFields = config.articleTypes.map((t) => t.idField);

  return function (tree: Root, file: { data: { astro?: { frontmatter?: Record<string, unknown> } } }) {
    if (!cachedValidIds) {
      cachedValidIds = loadValidIds(config.contentDir, config.articleTypes);
    }

    const frontmatter = file.data?.astro?.frontmatter;
    const currentPageId = getCurrentPageId(frontmatter, idFields);

    visit(tree, 'text', (node: Text, index: number | undefined, parent: Parent | undefined) => {
      if (index === undefined || !parent) return;
      if (parent.type === 'link') return;

      const transformed = transformText(
        node.value,
        cachedValidIds!,
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
  cachedValidIds = null;
}

export type { RemarkArticleLinksConfig, ArticleTypeConfig } from './types.js';
