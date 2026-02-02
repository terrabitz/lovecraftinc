# Creating Remark Plugins for Astro

Remark plugins transform Markdown content by manipulating the Abstract Syntax Tree (AST). Here's how to build one:

## 1. Understanding the AST

Markdown is parsed into an MDAST (Markdown Abstract Syntax Tree). A simple paragraph like `Hello EID-047` becomes:

```js
{
  type: 'paragraph',
  children: [
    { type: 'text', value: 'Hello EID-047' }
  ]
}
```

## 2. Basic Plugin Structure

A remark plugin is a function that returns a transformer function:

```ts
import type { Root } from 'mdast';

export function myRemarkPlugin() {
  return function transformer(tree: Root) {
    // Modify tree here
  };
}
```

## 3. Traversing the Tree with `unist-util-visit`

Use `unist-util-visit` to walk the tree and find specific node types:

```ts
import { visit } from 'unist-util-visit';
import type { Root, Text } from 'mdast';

export function myRemarkPlugin() {
  return function transformer(tree: Root) {
    visit(tree, 'text', (node: Text, index, parent) => {
      // node.value contains the text content
      // parent.children[index] is this node
      // Modify parent.children to replace/wrap nodes
    });
  };
}
```

## 4. Replacing Nodes

To replace a text node with multiple nodes (e.g., text + link + text):

```ts
visit(tree, 'text', (node: Text, index, parent) => {
  if (index === undefined || !parent) return;
  
  const newNodes = transformTextToLinks(node.value);
  
  // Splice new nodes into parent's children
  parent.children.splice(index, 1, ...newNodes);
});
```

## 5. Creating Link Nodes

Link nodes in MDAST have this structure:

```ts
{
  type: 'link',
  url: '/anomalies/EID-047',
  children: [{ type: 'text', value: 'EID-047' }]
}
```

## 6. Plugin Options via Factory

Pass configuration by wrapping in a factory function:

```ts
interface PluginOptions {
  baseUrl: string;
  patterns: RegExp[];
}

export function myRemarkPlugin(options: PluginOptions) {
  return function transformer(tree: Root) {
    visit(tree, 'text', (node, index, parent) => {
      // Use options.baseUrl, options.patterns here
    });
  };
}
```

## 7. Registering in Astro

Add to `astro.config.mjs`:

```js
import { myRemarkPlugin } from './src/plugins/my-plugin';

export default defineConfig({
  markdown: {
    remarkPlugins: [
      myRemarkPlugin,
      // Or with options:
      [myRemarkPlugin, { baseUrl: '/posts' }]
    ]
  }
});
```

This works for both regular `.md` pages in `src/pages/` and Content Collections.

## 8. Accessing Frontmatter

Remark plugins can read frontmatter via the `file` parameter:

```ts
export function myRemarkPlugin() {
  return function (tree: Root, file: { data: { astro?: { frontmatter?: Record<string, unknown> } } }) {
    const frontmatter = file.data?.astro?.frontmatter;
    const title = frontmatter?.title;
    // Use frontmatter values in your transformation
  };
}
```

## Testing Remark Plugins

Keep transformation logic in pure functions for easy unit testing:

```ts
// Pure function - easy to test
export function findMatches(text: string, pattern: RegExp): Match[] { ... }

// Plugin calls pure functions
export function myPlugin() {
  return (tree: Root) => {
    visit(tree, 'text', (node) => {
      const matches = findMatches(node.value, pattern);
      // ...
    });
  };
}
```
