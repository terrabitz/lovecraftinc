# Astro.js Best Practices

## Project Structure

- Keep layouts in `src/layouts/`
- Keep pages in `src/pages/`
- Keep components in `src/components/`
- Keep styles in `src/styles/`
- Use `src/content/` for content collections with markdown files

## Styling Best Practices

### General Principles

- Always prefer Tailwind classes over component-scoped classes
  - If we make use of a new Tailwind class, update the doc/tailwind-reference.md to include it
- Always prefer component-scoped styles over global styles
- Only use global styles for truly global concerns (CSS variables, resets, base element styles)
- Component-specific styles should be colocated with the component

### CSS Variables
- Define global CSS variables in `src/styles/global.css` using `:root` selector
- Import global styles in layout files, not individual pages
- Example:
  ```css
  :root {
    --primary-color: #0000ff;
    --spacing-unit: 8px;
  }
  ```

### Component Styles

#### For .astro files
- Use standard Tailwind classes wherever possible over custom classes
- If we need custom classes, use inline `<style>` tags in `.astro` files for component-specific styles
- Place `<style>` blocks at the root level (after HTML, not inside `<head>`)
- Astro automatically scopes component styles
- Use `<style is:global>` only when you need to override scoped styles
- **Never** add component-specific styles to `global.css`

#### For React/Preact/Vue/Svelte components (.tsx, .jsx, .vue, .svelte)
- Always prefer standard Tailwind classes where possible
- If custom classes are needed, use CSS Modules for component-scoped styles (e.g., `ComponentName.module.css`)
- Import the module: `import styles from './ComponentName.module.css'`
- Apply styles: `<div className={styles.myClass}>...</div>`
- Use `:global()` in CSS modules only when targeting elements from external libraries
- **Never** add component-specific styles to `global.css`

### Style Organization
```astro
---
// Imports and logic
---

<!-- HTML markup -->
<div class="component">
  <slot />
</div>

<!-- Styles at root level, outside HTML -->
<style>
  .component {
    /* Scoped styles */
  }
</style>

<!-- Scripts at root level -->
<script>
  // Client-side JavaScript
</script>
```

## Layout Patterns

### Layer Layouts for Flexibility
- Create a minimal base layout (e.g., `MainLayout.astro`) for HTML structure
- Create specialized layouts (e.g., `ContentLayout.astro`) that wrap the base layout
- Example:
  ```astro
  <!-- MainLayout.astro -->
  <html>
    <body>
      <slot />
    </body>
  </html>

  <!-- ContentLayout.astro -->
  <MainLayout>
    <nav>...</nav>
    <slot />
    <footer>...</footer>
  </MainLayout>
  ```

## Imports

### CSS/Style Imports
- Always prefer Tailwind utility classes when possible
- Import external CSS libraries in layout files (e.g., `import '98.css'`)
- Import global styles in layouts: `import '../styles/global.css'`
- Never import CSS multiple times across components

### Content Collections
- **Always use Content Collections API with Content Layer loaders** for markdown content in `src/content/`
- Define schemas in `src/content.config.ts` using Zod for type safety
- Also keep `keystatic.config.ts` in sync with the schemas in `src/content.config.ts` so that the CMS interface matches the data structure.
- Use the `glob()` loader to load content from the file system
- Use `getCollection()` to fetch content: `const posts = await getCollection('posts')`
- Access frontmatter via `.data` property: `entry.data.title`
- Render content with `await render(entry)` using the `render()` function from `astro:content`
- Never use `import.meta.glob()` or `Astro.glob()` for content collections

Example:
```astro
---
// Content config (src/content.config.ts)
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
  }),
});

export const collections = { posts };

// List page
import { getCollection } from 'astro:content';
const posts = await getCollection('posts');
---
{posts.map((post) => (
  <h2>{post.data.title}</h2>
))}

// Detail page
import { getCollection, render } from 'astro:content';

export async function getStaticPaths() {
  const posts = await getCollection('posts');
  return posts.map((post) => ({
    params: { id: post.slug },
    props: { post }
  }));
}

const { post } = Astro.props;
const { Content } = await render(post);
<Content />
```

## TypeScript

- Astro has built-in TypeScript support
- Type client-side DOM elements explicitly:
  ```typescript
  const button = document.getElementById('btn') as HTMLButtonElement;
  ```

## Client-Side JavaScript

- Use `<script>` tags at the root level (not in `<head>`)
- Scripts are processed and bundled by Astro
- Use `is:inline` directive only when you need to prevent bundling
- Prefer `classList.add/remove()` over inline style manipulation
- Use CSS classes for state management when possible

## File Naming

- Use kebab-case for file names: `main-layout.astro`, `global.css`
- Use PascalCase for component names in imports: `MainLayout`
- Dynamic routes use brackets: `[id].astro`, `[...slug].astro`

## Performance

- Astro ships zero JavaScript by default
- Add `client:*` directives only when client interactivity is needed
- Prefer CSS transitions/animations over JavaScript when possible
- Use `loading="lazy"` for images below the fold

## Content Collections

- Define collections in `src/content.config.ts` with Zod validation
- Use the Content Layer API with the `glob()` loader for file-based content
- Store markdown content in `src/content/[collection-name]/`
- Always use `getCollection()` API for type-safe content access
- Access frontmatter via `.data` property, not `.frontmatter`
- Render markdown with `await render(entry)` using the `render()` function from `astro:content`

## Custom Markdoc Components

Content is authored in Markdoc (`.mdoc` files) and edited via Keystatic. Custom components require configuration in three places:

1. **The component itself** (`.astro` or `.tsx`)
2. **`markdoc.config.mjs`** -- maps a Markdoc tag to the component file
3. **`keystatic.config.ts`** -- defines the CMS editing form (and optional live preview)

### When to Use Astro vs Preact

| Criteria | Use Astro (`.astro`) | Use Preact (`.tsx`) |
| :--- | :--- | :--- |
| Needs client-side interactivity? | No | Yes |
| Ships JavaScript to browser? | No (zero JS) | Yes (~3kb Preact runtime) |
| CMS live preview available? | No (form-only editing) | Yes (via `withPreact` wrapper) |
| Examples | Callouts, formatted blocks, images | Dice rollers, counters, toggles |

**Rule of thumb:** If it has state, event handlers, or user interaction, use Preact. Otherwise use Astro.

### Creating Astro Components

Astro components are static -- they render at build time with zero client JavaScript.

1. Create the component in `src/components/`:
   ```astro
   ---
   interface Props {
     type: 'info' | 'warning' | 'error';
     title: string;
   }
   const { type = 'info', title } = Astro.props;
   ---
   <div class={`border-l-4 p-4 my-4 ${type}`}>
     <h3 class="font-bold mb-2">{title}</h3>
     <slot />
   </div>
   ```

2. Register the tag in `markdoc.config.mjs`:
   ```javascript
   callout: {
     render: component('./src/components/Callout.astro'),
     attributes: {
       type: { type: String, default: 'info' },
       title: { type: String, required: true },
     },
   },
   ```

3. Register in `keystatic.config.ts` (inside the `components` object of `fields.markdoc()`):
   - Use `wrapper()` if the tag wraps content (`{% callout %}...{% /callout %}`)
   - Use `block()` if the tag is self-closing (`{% image src="..." / %}`)
   - Use `inline()` if the tag appears inside a paragraph
   ```typescript
   callout: wrapper({
     label: 'Callout',
     schema: {
       title: fields.text({ label: 'Title' }),
       type: fields.select({ label: 'Type', options: [...], defaultValue: 'info' }),
     },
   }),
   ```

### Creating Preact Components

Preact components are interactive and hydrated on the client. They require a thin `.astro` wrapper to add the `client:*` directive for hydration, since Markdoc tags render through Astro.

1. Create the Preact component in `src/components/preact/`:
   ```tsx
   /** @jsxImportSource preact */
   import { useState } from 'preact/hooks';

   export default function DiceRoller({ initialDie = 'd20' }) {
     const [result, setResult] = useState<number | null>(null);
     const roll = () => setResult(Math.floor(Math.random() * parseInt(initialDie.substring(1))) + 1);
     return (
       <button onClick={roll} className="p-2 border rounded">
         {result ?? initialDie}
       </button>
     );
   }
   ```

2. Create an Astro wrapper in `src/components/` that adds hydration:
   ```astro
   ---
   import DiceRoller from "./preact/DiceRoller";
   ---
   <DiceRoller {...Astro.props} client:load />
   ```

3. Register the tag in `markdoc.config.mjs` pointing to the **Astro wrapper** (not the Preact file directly):
   ```javascript
   "dice-roller": {
     render: component('./src/components/ClientDiceRoller.astro'),
     attributes: {
       initialDie: { type: String, default: 'd20' },
     },
   },
   ```

4. Register in `keystatic.config.ts` with a `ContentView` for live CMS preview:
   ```typescript
   import { createElement } from 'react';
   import { withPreact } from 'src/utils/withPreact';
   import DiceRoller from './src/components/preact/DiceRoller';

   "dice-roller": inline({
     label: 'Dice Roller',
     schema: {
       initialDie: fields.text({ label: 'Die Type', defaultValue: 'd20' }),
     },
     ContentView: (props) =>
       createElement(withPreact(DiceRoller), { initialDie: props.value.initialDie }),
   }),
   ```

### The `withPreact` Helper

`withPreact` (in `src/utils/withPreact.tsx`) bridges Preact components into Keystatic's React-based admin UI. It creates a DOM boundary: React owns the outer `<div>`, Preact owns an inner `<div>` created via `document.createElement`. This avoids React 19's frozen VNode problem.

Key rules:
- `withPreact.tsx` uses `/** @jsxImportSource react */` so its JSX compiles as React elements
- It calls Preact's `h()` function directly (not JSX) to create Preact VNodes
- Never use JSX to render the Preact component inside `withPreact` -- the React pragma would create frozen objects that Preact cannot process

### Framework File Routing

Astro disambiguates React vs Preact `.tsx` files by directory (configured in `astro.config.mjs`):
- `**/preact/*.tsx` -- compiled with Preact
- `**/react/**.tsx` -- compiled with React

Place Preact components in `src/components/preact/` and React components in `src/components/react/`.

### Keeping Configs in Sync

When adding a new Markdoc component, always update all three locations:
1. `markdoc.config.mjs` -- tag name, attributes, and `render` path
2. `keystatic.config.ts` -- matching tag name, matching attribute schema, component type (`wrapper`/`block`/`inline`)
3. `src/content.config.ts` -- no change needed (Markdoc content is already handled by the glob loader)

Attribute names and types must match exactly between `markdoc.config.mjs` and `keystatic.config.ts`.

## General Guidelines

- Astro components are rendered at build time by default (SSG)
- Use `.astro` for static components, Preact for complex interactivity
- Keep client-side JavaScript minimal
- Use semantic HTML
- Avoid creating unnecessary files
