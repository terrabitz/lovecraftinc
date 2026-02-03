# Client Islands, Preact, and Persistent State in Astro

This document explains how to create interactive components that persist across page navigations in Astro using client islands, Preact, and view transitions.

## The Problem: Persistent UI Components

Astro is a static site generator (SSG) by default. Each page navigation triggers a full page reload, which means any client-side state (open modals, form inputs, animation progress) is lost.

For the SID Assistant feature, we needed:
- A floating help widget that stays open as users navigate between pages
- State preservation (the current message, whether the panel is visible)
- Interactive behavior (typewriter animations, user input)

## Solution Overview

We combined three Astro features:

1. **Client Islands** - Interactive JavaScript components that hydrate on the client
2. **Preact** - A lightweight React alternative for building the component
3. **View Transitions with `transition:persist`** - Keeps the component alive across navigations

## Client Islands

### What Are They?

In Astro, most components render to static HTML with zero JavaScript. A "client island" is a component that also runs JavaScript in the browser, enabling interactivity.

Think of your page as an ocean of static HTML with small "islands" of JavaScript where interactivity is needed.

### Why Use Them?

- **Performance**: Only the interactive parts load JavaScript, not the entire page
- **Selective Hydration**: You control exactly which components need client-side code
- **Framework Flexibility**: Use React, Preact, Vue, Svelte, or Solid for islands

### How to Create One

Add a `client:*` directive to a framework component:

```astro
---
import MyComponent from './MyComponent.tsx';
---

<!-- Static - renders HTML only, no JavaScript -->
<MyComponent />

<!-- Client Island - hydrates with JavaScript -->
<MyComponent client:load />
```

### Client Directives

| Directive | When it Hydrates |
|-----------|------------------|
| `client:load` | Immediately on page load |
| `client:idle` | When the browser is idle |
| `client:visible` | When the component enters the viewport |
| `client:media="(query)"` | When a CSS media query matches |
| `client:only="preact"` | Skips server rendering entirely |

For SID, we use `client:load` because the help button should be immediately interactive.

## Preact

### What Is It?

Preact is a lightweight (3KB) alternative to React with the same API. It uses:
- Functional components
- Hooks (`useState`, `useEffect`, `useRef`, etc.)
- JSX syntax

### Why Preact Over React?

- **Smaller bundle size**: ~3KB vs ~40KB for React
- **Same API**: If you know React, you know Preact
- **Fast**: Optimized for performance
- **Astro integration**: First-class support via `@astrojs/preact`

### Setup

1. Install the packages:
   ```bash
   npm install @astrojs/preact preact
   ```

2. Add to `astro.config.mjs`:
   ```javascript
   import preact from '@astrojs/preact';

   export default defineConfig({
     integrations: [preact()],
   });
   ```

3. Configure TypeScript in `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "jsx": "react-jsx",
       "jsxImportSource": "preact"
     }
   }
   ```

### Creating a Preact Component

Create a `.tsx` file with a functional component:

```tsx
import { useState, useEffect } from 'preact/hooks';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

### Key Differences from Plain Astro Components

| Astro Component (.astro) | Preact Component (.tsx) |
|--------------------------|-------------------------|
| Renders at build time | Can render on client |
| No client-side state | Has `useState`, `useEffect` |
| Uses `<script>` for JS | Logic lives in component |
| Template syntax | JSX syntax |
| Scoped `<style>` tags | CSS-in-JS or inline styles |

### Hooks Reference

```tsx
import { useState, useEffect, useRef, useCallback } from 'preact/hooks';

// State that triggers re-renders
const [value, setValue] = useState(initialValue);

// Side effects (API calls, subscriptions, timers)
useEffect(() => {
  // Run on mount and when dependencies change
  return () => {
    // Cleanup function (runs on unmount)
  };
}, [dependencies]);

// Mutable ref that persists across renders (doesn't trigger re-render)
const intervalRef = useRef<number | null>(null);

// Memoized callback (prevents unnecessary re-renders of children)
const handleClick = useCallback(() => {
  // handler logic
}, [dependencies]);
```

## View Transitions and Persistence

### The ClientRouter

Astro's `<ClientRouter />` (imported from `astro:transitions`) enables SPA-like navigation without full page reloads. It's already configured in `MainLayout.astro`.

### transition:persist

The `transition:persist` directive tells Astro to keep an element (and its state) alive across navigations instead of replacing it.

For plain HTML elements:
```astro
<video controls transition:persist>
  <source src="/video.mp4" />
</video>
```

For client islands, this preserves the component's internal state:
```astro
<SidAssistant client:load transition:persist />
```

### How It Works

During navigation:
1. Astro fetches the new page
2. Elements marked `transition:persist` are moved to the new DOM
3. The component's JavaScript state is preserved
4. The rest of the page swaps out

### Important: Only Works with Client Islands

`transition:persist` on a plain Astro component with a `<script>` tag does NOT preserve JavaScript state. The script re-runs and state is lost.

For true state persistence, you need:
- A framework component (Preact, React, Vue, etc.)
- A `client:*` directive to make it an island
- The `transition:persist` directive

## SID Assistant Implementation

### Component Structure

```
src/components/SidAssistant.tsx   # Preact component
src/layouts/ContentLayout.astro   # Uses the component
```

### ContentLayout Usage

```astro
---
import SidAssistant from '../components/SidAssistant.tsx';
---

<SidAssistant client:load transition:persist />
```

### Component State

The SID component manages:
- `isVisible` - Whether the panel is shown
- `displayedText` - Current text in the speech bubble
- `currentFrame` - Animation frame (1 or 2)
- `inputValue` - User's typed message

All of this state persists across page navigations thanks to `transition:persist`.

### Styling Approach

Since Preact components don't have Astro's scoped `<style>` tags, we use inline styles via a `<style>` tag in JSX:

```tsx
return (
  <div class="container">
    {/* component markup */}
    
    <style>{`
      .container {
        position: fixed;
        /* ... */
      }
    `}</style>
  </div>
);
```

Alternatively, you could:
- Import a CSS file
- Use CSS modules
- Use a CSS-in-JS library like styled-components

## Common Patterns

### Intervals and Cleanup

Always clean up intervals in `useEffect`:

```tsx
useEffect(() => {
  const interval = setInterval(() => {
    // do something
  }, 1000);
  
  return () => clearInterval(interval);
}, []);
```

### Refs for Non-Reactive Values

Use `useRef` for values that shouldn't trigger re-renders:

```tsx
const intervalRef = useRef<number | null>(null);

// Start
intervalRef.current = window.setInterval(() => {}, 100);

// Stop
if (intervalRef.current) {
  clearInterval(intervalRef.current);
  intervalRef.current = null;
}
```

### Event Handlers

Use `useCallback` to memoize handlers passed to child components:

```tsx
const handleSend = useCallback(() => {
  // handle send
}, [inputValue]);
```

## Troubleshooting

### State Lost on Navigation

- Ensure you have both `client:load` AND `transition:persist`
- Verify the component is a framework component (.tsx), not an Astro component
- Check that `<ClientRouter />` is in your layout's `<head>`

### Component Not Interactive

- Missing `client:*` directive
- Check browser console for hydration errors
- Verify Preact is configured in `astro.config.mjs`

### TypeScript JSX Errors

- Set `jsxImportSource: "preact"` in tsconfig.json
- Ensure `@types/node` or relevant types are installed

## Further Reading

- [Astro Islands Documentation](https://docs.astro.build/en/concepts/islands/)
- [Astro View Transitions](https://docs.astro.build/en/guides/view-transitions/)
- [Preact Documentation](https://preactjs.com/guide/v10/getting-started)
- [Preact Hooks](https://preactjs.com/guide/v10/hooks)
