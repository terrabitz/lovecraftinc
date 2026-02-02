import type { Text, Link } from 'mdast';

export interface ArticleTypeConfig {
  pattern: RegExp;
  idField: string;
  urlPrefix: string;
  contentPath: string;
}

export interface RemarkArticleLinksConfig {
  contentDir: string;
  articleTypes: ArticleTypeConfig[];
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
