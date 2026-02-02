import type { Text, Link } from 'mdast';

export interface ArticleTypeConfig {
  pattern: RegExp;
  urlPrefix: string;
  contentPath: string;
}

export interface RemarkArticleLinksConfig {
  contentDir: string;
  articleTypes: ArticleTypeConfig[];
}

export interface ArticleInfo {
  id: string;
  name: string;
}

export interface ArticleMatch {
  id: string;
  start: number;
  end: number;
  urlPrefix: string;
}

export type TextNode = Text;
export type LinkNode = Link;
export type TransformedNode = TextNode | LinkNode;
