# Preact Component Styling Best Practices

This guide covers best practices for styling Preact components in our Astro project, with a focus on CSS Modules for component-scoped styles.

## Table of Contents
- [Why CSS Modules?](#why-css-modules)
- [Basic Usage](#basic-usage)
- [Best Practices](#best-practices)
- [Official Documentation](#official-documentation)

## Why CSS Modules?

CSS Modules provide **component-scoped styling** that prevents naming conflicts and keeps styles colocated with components. Benefits include:

- **Encapsulation**: Styles are scoped to the component automatically
- **No naming conflicts**: Class names are locally scoped
- **Type safety**: TypeScript provides autocomplete for class names
- **Tree-shaking**: Unused styles can be eliminated during build
- **Maintainability**: Styles live next to the component they style

## Basic Usage

### 1. Create a CSS Module

Create a file with the `.module.css` extension next to your component:

```
src/components/
  ├── MyComponent.tsx
  └── MyComponent.module.css
```

**MyComponent.module.css:**
```css
.container {
  display: flex;
  gap: 16px;
}

.title {
  font-size: 24px;
  font-weight: bold;
}

.button {
  padding: 8px 16px;
  background-color: var(--primary-color);
}
```

### 2. Import and Use in Component

**MyComponent.tsx:**
```typescript
import { h } from 'preact';
import styles from './MyComponent.module.css';

export default function MyComponent() {
  return (
    <div class={styles.container}>
      <h2 class={styles.title}>Hello World</h2>
      <button class={styles.button}>Click Me</button>
    </div>
  );
}
```

### 3. Generated Class Names

CSS Modules automatically generate unique class names like:
```
MyComponent_container_a1b2c
MyComponent_title_d3e4f
MyComponent_button_g5h6i
```

This prevents conflicts with other components' styles.

## Best Practices

### 1. Prefer Component-Scoped Styles

**✅ DO:** Use CSS Modules for component-specific styles
```typescript
import styles from './Button.module.css';

<button class={styles.primary}>Submit</button>
```

**❌ DON'T:** Add component-specific styles to global.css
```css
/* global.css - AVOID THIS */
.my-component-button {
  padding: 8px;
}
```

### 2. Use :global() for External Libraries

When you need to style elements from external libraries (like 98.css), use `:global()`:

```css
/* DataListing.module.css */
.detailPanel :global(.sunken-panel) {
  width: 100%;
  margin-bottom: 12px;
}
```

### 3. Compose Styles

You can combine multiple CSS Module classes:

```typescript
<div class={`${styles.container} ${styles.active}`}>
  Content
</div>
```

Or conditionally:

```typescript
<div class={isActive ? styles.active : styles.inactive}>
  Content
</div>
```

### 4. Use CSS Variables for Theming

Define global CSS variables in `global.css`, reference them in modules:

**global.css:**
```css
:root {
  --primary-color: #0000ff;
  --spacing-unit: 8px;
}
```

**Component.module.css:**
```css
.container {
  color: var(--primary-color);
  padding: var(--spacing-unit);
}
```

### 5. Organize Styles Logically

Structure your CSS Module to match component structure:

```css
/* Container styles */
.container {
  display: flex;
}

/* Child element styles */
.header {
  background: white;
}

.content {
  flex: 1;
}

/* State variations */
.container.loading {
  opacity: 0.5;
}

/* Responsive styles */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }
}
```

### 6. Keep Selectors Flat

**✅ DO:** Use flat, single-class selectors
```css
.button {
  padding: 8px;
}

.buttonPrimary {
  background: blue;
}
```

**❌ DON'T:** Nest selectors unnecessarily
```css
.container .wrapper .button {
  padding: 8px;
}
```

### 7. Name Classes Semantically

Use meaningful, descriptive class names:

```css
/* Good */
.searchInput { }
.submitButton { }
.errorMessage { }

/* Avoid */
.input1 { }
.btn { }
.red { }
```

## Responsive Design

Use media queries within your CSS Module:

```css
.table {
  width: 100%;
}

.hideOnMobile {
  display: table-cell;
}

@media (max-width: 768px) {
  .hideOnMobile {
    display: none;
  }
  
  .table {
    font-size: 14px;
  }
}
```

## TypeScript Integration

CSS Modules work seamlessly with TypeScript. Your IDE will provide:

- **Autocomplete** for class names
- **Type checking** to catch typos
- **Go-to-definition** to jump to CSS

```typescript
import styles from './Component.module.css';

// TypeScript knows about all classes in the module
<div class={styles.container}>  // ✅ Autocomplete works
<div class={styles.container}>  // ❌ Type error: typo detected (if misspelled)
```

## When NOT to Use CSS Modules

Use **global.css** for:

- CSS custom properties (variables)
- CSS resets and normalizations
- Base element styles (`body`, `h1`, etc.)
- Utility classes shared across ALL components

Use **inline styles** (sparingly) for:

- Dynamic values from props/state
- One-off styling that won't be reused

## Real-World Example

See `src/components/DataListing.tsx` and `DataListing.module.css` for a complete example of CSS Modules in action.

## Official Documentation

### Preact
- [Preact Official Site](https://preactjs.com/)
- [Preact Getting Started](https://preactjs.com/guide/v10/getting-started)
- [Preact with TypeScript](https://preactjs.com/guide/v10/typescript)
- [Preact Hooks API](https://preactjs.com/guide/v10/hooks)

### CSS Modules
- [CSS Modules GitHub](https://github.com/css-modules/css-modules)
- [CSS Modules Specification](https://github.com/css-modules/css-modules/blob/master/README.md)

### Astro with Preact
- [Astro Preact Integration](https://docs.astro.build/en/guides/integrations-guide/preact/)
- [Astro Client Directives](https://docs.astro.build/en/reference/directives-reference/#client-directives)
- [Astro Styling](https://docs.astro.build/en/guides/styling/)
- [Astro CSS Modules Support](https://docs.astro.build/en/guides/styling/#css-modules)

### Vite (Astro's Build Tool)
- [Vite CSS Modules](https://vitejs.dev/guide/features.html#css-modules)

## Summary

1. **Always use CSS Modules** for component-specific styles
2. **Import styles**: `import styles from './Component.module.css'`
3. **Apply classes**: `<div class={styles.className}>`
4. **Use :global()** only for external library elements
5. **Keep global.css** for truly global concerns
6. **Leverage TypeScript** for type safety and autocomplete

Following these practices ensures maintainable, scalable, and conflict-free styling in your Preact components.
