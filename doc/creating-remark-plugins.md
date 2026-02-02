# Creating Remark and Rehype Plugins for Astro

Astro's markdown processing uses a two-stage pipeline: **remark** transforms Markdown AST (MDAST), then **rehype** transforms HTML AST (HAST). Understanding when to use each is key to building effective plugins.

## Remark vs Rehype: When to Use Which

| Use Case | Plugin Type | Why |
|----------|-------------|-----|
| Find/replace text patterns | Remark | Works with raw text before HTML conversion |
| Auto-link references (e.g., `EID-047`) | Remark | Needs access to text content |
| Generate table of contents | Remark | Operates on heading structure |
| Transform frontmatter | Remark | Frontmatter is Markdown metadata |
| Add HTML attributes | Rehype | Works with actual HTML elements |
| Convert attributes (e.g., `title` to `data-tooltip`) | Rehype | Manipulates HTML properties |
| Modify link behavior | Rehype | HTML anchors are rehype elements |
| Add wrapper elements | Rehype | Creates HTML structure |
| Syntax highlighting | Rehype | Processes code blocks as HTML |

**Rule of thumb**: Use remark for content transformation, rehype for HTML attribute manipulation.

## Part 1: Remark Plugins

### Understanding the AST

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

## Part 2: Rehype Plugins

Rehype plugins operate on HAST (HTML Abstract Syntax Tree) after markdown has been converted to HTML. This makes them ideal for manipulating HTML attributes.

### Understanding HAST

After remark-to-rehype conversion, an anchor element looks like:

```js
{
  type: 'element',
  tagName: 'a',
  properties: { href: '/anomalies/EID-047', title: 'The Whispering Door' },
  children: [{ type: 'text', value: 'EID-047' }]
}
```

### Basic Rehype Plugin Structure

```ts
import type { Root, Element } from 'hast';
import { visit } from 'unist-util-visit';

export default function myRehypePlugin() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      // Manipulate HTML elements here
    });
  };
}
```

### Example: Converting title to data-tooltip

Native browser `title` tooltips have a ~1 second delay. To enable instant CSS tooltips via `[data-tooltip]::after`, use a rehype plugin to convert the attribute:

```ts
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
```

### Registering Rehype Plugins in Astro

Add to the `rehypePlugins` array in `astro.config.mjs`:

```js
import { myRemarkPlugin } from './src/plugins/my-remark-plugin';
import myRehypePlugin from './src/plugins/my-rehype-plugin';

export default defineConfig({
  markdown: {
    remarkPlugins: [myRemarkPlugin],
    rehypePlugins: [myRehypePlugin],
  }
});
```

### Why Remark Can't Set Custom HTML Attributes

You might wonder why we need a separate rehype plugin for attributes like `data-tooltip`. In remark, link nodes support `data.hProperties` which should pass through to HTML:

```ts
// This SHOULD work but doesn't reliably in Astro
{
  type: 'link',
  url: '/test',
  data: { hProperties: { 'data-tooltip': 'Tooltip' } },
  children: [...]
}
```

However, Astro's markdown processing doesn't always preserve `hProperties` on all node types. The `title` property on links works because it's part of the MDAST spec for links. For custom attributes, use rehype.

### Testing Rehype Plugins

Create HAST trees directly for unit testing:

```ts
import { describe, it, expect } from 'vitest';
import type { Root, Element, Text } from 'hast';
import rehypeTooltip from '../index.js';

function createAnchor(href: string, text: string, title?: string): Element {
  return {
    type: 'element',
    tagName: 'a',
    properties: { href, ...(title && { title }) },
    children: [{ type: 'text', value: text }],
  };
}

describe('rehypeTooltip', () => {
  it('converts title to data-tooltip', () => {
    const tree: Root = {
      type: 'root',
      children: [createAnchor('/test', 'Link', 'Tooltip')],
    };
    const plugin = rehypeTooltip();
    plugin(tree);

    const anchor = tree.children[0] as Element;
    expect(anchor.properties?.['data-tooltip']).toBe('Tooltip');
    expect(anchor.properties?.title).toBeUndefined();
  });
});
```

## Plugin Execution Order

Plugins run in the order specified in the config arrays:

1. **remarkPlugins** run first, transforming MDAST
2. remark-rehype converts MDAST to HAST
3. **rehypePlugins** run last, transforming HAST

This means remark plugins can set `title` on links, and a rehype plugin can later convert those to `data-tooltip`.
