# Astro.js Best Practices

## Project Structure

- Keep layouts in `src/layouts/`
- Keep pages in `src/pages/`
- Keep components in `src/components/`
- Keep styles in `src/styles/`
- Use `src/content/` for content collections with markdown files

## Styling Best Practices

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
- Use inline `<style>` tags in `.astro` files for component-specific styles
- Place `<style>` blocks at the root level (after HTML, not inside `<head>`)
- Astro automatically scopes component styles
- Use `<style is:global>` only when you need to override scoped styles
- Move styles to `global.css` only if used across multiple layouts/components

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
- Import external CSS libraries in layout files (e.g., `import '98.css'`)
- Import global styles in layouts: `import '../styles/global.css'`
- Never import CSS multiple times across components

### Content Collections
- **Always use Content Collections API with Content Layer loaders** for markdown content in `src/content/`
- Define schemas in `src/content.config.ts` using Zod for type safety
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

## General Guidelines

- Astro components are rendered at build time by default (SSG)
- Use `.astro` for static components, React/Vue/Svelte for complex interactivity
- Keep client-side JavaScript minimal
- Use semantic HTML
- Avoid creating unnecessary files
