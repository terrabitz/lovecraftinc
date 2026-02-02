import type { Root, Element } from 'hast';
import { visit } from 'unist-util-visit';

export default function rehypeTooltip() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'a' && node.properties?.title) {
        node.properties['data-tooltip'] = node.properties.title;
        delete node.properties.title;
      }
    });
  };
}
