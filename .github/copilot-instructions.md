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

### Content Imports
- Use `Astro.glob()` for dynamic imports: `await Astro.glob('../content/**/*.md')`
- Import components using relative paths: `import Component from '../components/Component.astro'`

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

- Define schemas in `src/content/config.ts`
- Store markdown content in `src/content/[collection-name]/`
- Use frontmatter for metadata
- Access via `getCollection()` or `Astro.glob()`

## General Guidelines

- Astro components are rendered at build time by default (SSG)
- Use `.astro` for static components, React/Vue/Svelte for complex interactivity
- Keep client-side JavaScript minimal
- Use semantic HTML
- Avoid creating unnecessary files
