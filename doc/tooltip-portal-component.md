# Tooltip Portal Component

## Overview

The `Tooltip.astro` component implements a portal-based tooltip system that renders tooltips at the document root level, allowing them to escape overflow containers and always appear on top of other elements.

## Why a Portal?

CSS-based tooltips using `::before`/`::after` pseudo-elements are clipped by parent elements with `overflow: hidden` or `overflow: auto`. This is problematic for tooltips inside scrollable containers like the SID Assistant's speech bubble.

A portal solves this by:
1. Rendering the tooltip element at the root level of the DOM (outside any overflow containers)
2. Using `position: fixed` to position it relative to the viewport
3. Calculating position dynamically based on the target element's `getBoundingClientRect()`

## Architecture

```
<body>
  <div id="tooltip-portal">        <!-- Portal container at root level -->
    <div class="tooltip">          <!-- Single reusable tooltip element -->
      <span class="tooltip-arrow">
      <span class="tooltip-text">
    </div>
  </div>
  ... rest of page content ...
</body>
```

## Event Handling Pattern

The component uses **event delegation** rather than attaching listeners to each tooltip target. This is more efficient and automatically handles dynamically-added elements.

### Event Delegation

Instead of:
```js
// Inefficient: attach to every element
document.querySelectorAll('[data-tooltip]').forEach(el => {
  el.addEventListener('mouseover', showTooltip);
  el.addEventListener('mouseout', hideTooltip);
});
```

We use:
```js
// Efficient: single listener on document, filter by target
document.addEventListener('mouseover', handleMouseOver);
document.addEventListener('mouseout', handleMouseOut);
```

### The `handleMouseOver` Callback

```typescript
function handleMouseOver(e: Event) {
  const target = (e.target as HTMLElement).closest('[data-tooltip]') as HTMLElement | null;
  if (target && target !== currentTarget) {
    showTooltip(target);
  }
}
```

Breaking this down:

1. **`e.target`** - The actual element that triggered the event (could be a child element)

2. **`.closest('[data-tooltip]')`** - Walks up the DOM tree to find the nearest ancestor (or self) that has a `data-tooltip` attribute. This handles cases where you hover over a child element inside the tooltip target.

3. **`target !== currentTarget`** - Prevents re-triggering when moving between child elements of the same tooltip target. Without this check, the tooltip would flicker as you move the mouse within the target.

### The `handleMouseOut` Callback

```typescript
function handleMouseOut(e: Event) {
  const target = (e.target as HTMLElement).closest('[data-tooltip]');
  if (target) {
    const relatedTarget = (e as MouseEvent).relatedTarget as HTMLElement | null;
    if (!relatedTarget || !target.contains(relatedTarget)) {
      hideTooltip();
    }
  }
}
```

Breaking this down:

1. **`relatedTarget`** - The element the mouse is moving TO (for mouseout events)

2. **`!target.contains(relatedTarget)`** - Only hide if we're actually leaving the tooltip target. If we're just moving from a child to another child within the same target, don't hide.

This prevents the tooltip from flickering when moving between nested elements like:
```html
<a data-tooltip="Hello">
  <span>Click</span>  <!-- mouseout fires when leaving this -->
  <span>here</span>   <!-- but relatedTarget is still inside the <a> -->
</a>
```

### Scroll Handling

```typescript
document.addEventListener('scroll', hideTooltip, true);
```

The `true` parameter enables **capture phase** listening, which catches scroll events on any element (not just the document). This ensures tooltips hide when scrolling any container, not just the page.

## Astro Integration

### Page Load Event

```typescript
document.addEventListener('astro:page-load', initTooltip);
```

Astro's View Transitions feature replaces page content without full page reloads. The `astro:page-load` event fires after each navigation, ensuring the tooltip system reinitializes.

### Is This Pattern "Astro-ish"?

This vanilla JS approach is idiomatic for Astro because:

1. **Zero JS framework dependency** - Works without Preact/React hydration
2. **Progressive enhancement** - The page works without JS; tooltips are an enhancement
3. **Minimal client-side JS** - Astro emphasizes shipping less JavaScript

Alternative approaches:

- **Preact component with portal**: Would require `client:load` directive and framework hydration. More overhead for a simple tooltip.
- **Web Component**: Could encapsulate the tooltip logic, but adds complexity for this use case.
- **CSS Anchor Positioning**: Modern CSS-only solution, but limited browser support (Chrome 125+, Firefox behind flag as of 2024).

## Position Calculation

The `positionTooltip` function handles:

1. **Vertical positioning**: Prefers above the target, flips to below if not enough space
2. **Horizontal centering**: Centers on the target, clamps to viewport edges
3. **Measurement trick**: Temporarily makes tooltip visible but hidden (`visibility: hidden`) to measure its size before final positioning

```typescript
// Measure without showing
tooltipEl.style.visibility = 'hidden';
tooltipEl.classList.add('visible');
const tooltipRect = tooltipEl.getBoundingClientRect();

// Position and reveal
tooltipEl.style.top = `${top}px`;
tooltipEl.style.left = `${left}px`;
tooltipEl.style.visibility = 'visible';
```

## CSS Variables

The component uses CSS variables from `global.css` for theming:

- `--tooltip-bg` - Background color
- `--tooltip-text` - Text color  
- `--tooltip-font-family` - Font family

These automatically adapt to dark mode when defined in the `html.dark` selector.
