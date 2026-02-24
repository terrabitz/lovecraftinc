# Guide: Creating Custom Markdoc Components for Keystatic and Astro

This guide explains how to create custom components that can be used in your Markdown/Markdoc content, edited via the Keystatic CMS, and rendered on your Astro site.

## Architecture Overview

There are three main parts to a custom component in this stack:
1.  **The Component**: The code that renders the UI (Astro, React, Preact, etc.).
2.  **Astro Configuration (`markdoc.config.mjs`)**: Tells Astro which component code to use when it encounters a specific tag (e.g., `{% my-component %}`).
3.  **Keystatic Configuration (`keystatic.config.ts`)**: Tells the CMS how to display the editing form for that tag.

---

## Path A: Astro Components (`.astro`)
**Best for:** Static content, layout elements, or server-side logic.
**Pros:** Zero client-side JavaScript by default.
**Cons:** Cannot have a "Live Preview" in the Keystatic editor (only a form view).

### 1. Create Component (`src/components/CustomCallout.astro`)
```astro
---
interface Props {
  type: 'info' | 'warning' | 'error';
  title: string;
}
const { type = 'info', title } = Astro.props;

const colors = {
  info: 'bg-blue-100 border-blue-500 text-blue-900',
  warning: 'bg-yellow-100 border-yellow-500 text-yellow-900',
  error: 'bg-red-100 border-red-500 text-red-900',
};
---
<div class={`border-l-4 p-4 my-4 ${colors[type]}`}>
  <h3 class="font-bold mb-2">{title}</h3>
  <slot /> <!-- This renders the content inside the tag -->
</div>
```

### 2. Register in Astro (`markdoc.config.mjs`)
```javascript
import { defineMarkdocConfig, component } from '@astrojs/markdoc/config';

export default defineMarkdocConfig({
  tags: {
    callout: {
      render: component('./src/components/CustomCallout.astro'),
      attributes: {
        type: { type: String, default: 'info' },
        title: { type: String, required: true },
      },
    },
  },
});
```

### 3. Register in Keystatic (`keystatic.config.ts`)
Use `wrapper` if it contains other content (has a closing tag), or `block` if it is self-closing.

```typescript
// ... inside schema.components
'callout': wrapper({
  label: 'Callout',
  schema: {
    title: fields.text({ label: 'Title' }),
    type: fields.select({
      label: 'Type',
      options: [
        { label: 'Info', value: 'info' },
        { label: 'Warning', value: 'warning' },
        { label: 'Error', value: 'error' },
      ],
      defaultValue: 'info',
    }),
  },
}),
```

---

## Path B: React Components (`.tsx` / `.jsx`)
**Best for:** Interactive components where you ALSO want a **Live Preview** inside the CMS.
**Pros:** Same code used for CMS preview and live site.
**Cons:** Requires React hydration on the site (larger bundle if you aren't already using React).

### 1. Create Component (`src/components/react/DiceRoller.tsx`)
```tsx
import React, { useState } from 'react';

// Start with standard React component
export default function DiceRoller({ initialDie = 'd20' }: { initialDie?: string }) {
  const [result, setResult] = useState<number | null>(null);
  
  // Example logic
  const roll = () => {
    const max = parseInt(initialDie.substring(1));
    setResult(Math.floor(Math.random() * max) + 1);
  };

  return (
    <div className="p-4 border">
      <h3 className="text-lg">Roll {initialDie}</h3>
      <button onClick={roll} className="bg-blue-500 text-white px-4 py-2 rounded">
        Roll
      </button>
      {result && <div className="text-2xl mt-2">{result}</div>}
    </div>
  );
}
```

### 2. Register in Astro (`markdoc.config.mjs`)
```javascript
// ...
tags: {
  'dice-roller': {
    render: component('./src/components/react/DiceRoller.tsx'),
    attributes: {
      initialDie: { type: String, default: 'd20' },
    },
  },
}
// ...
```

### 3. Register in Keystatic (`keystatic.config.ts`)
Import the component directly into the config to use it as the preview.

```typescript
// Import the component (ensure tsconfig allows this import)
import DiceRoller from './src/components/react/DiceRoller';

// ... inside schema.components
'dice-roller': wrapper({
  label: 'Dice Roller',
  schema: {
    initialDie: fields.select({
        label: 'Default Die',
        options: [
          { label: 'D20', value: 'd20' },
          { label: 'D6', value: 'd6' },
        ],
        defaultValue: 'd20',
      }),
  },
  // The 'ContentView' prop enables the live preview
  ContentView: (props) => (
    <DiceRoller initialDie={props.value.initialDie} />
  ),
}),
```

---

## Path C: Non-React Framework Components (Preact, Svelte, Vue)
**Best for:** Highly interactive components on the site where performance/bundle size is critical.
**Pros:** Use your preferred lightweight framework (e.g., Preact is 3kb vs React's 40kb).
**Cons:** No "Live Preview" in CMS (edit via form fields only). To get a preview, you'd need to recreate a React version just for the CMS.

### 1. Create Component (`src/components/preact/Counter.tsx`)
```tsx
/** @jsxImportSource preact */
import { useState } from 'preact/hooks';

export default function Counter({ start = 0 }) {
  const [count, setCount] = useState(start);
  return <button onClick={() => setCount(c => c+1)}>{count}</button>;
}
```

### 2. Register in Astro (`markdoc.config.mjs`)
Astro handles the framework integration automatically.

```javascript
// ...
tags: {
  counter: {
    render: component('./src/components/preact/Counter.tsx'),
    attributes: {
      start: { type: Number, default: 0 },
    },
  },
}
// ...
```

### 3. Register in Keystatic (`keystatic.config.ts`)
Same as Path A (Astro components) - you define the schema but provide no preview.

```typescript
// ... inside schema.components
'counter': block({
  label: 'Counter',
  schema: {
    start: fields.integer({ label: 'Start Value', defaultValue: 0 }),
  },
}),
```

---

## Summary Table

| Feature | Astro Component | React Component | Preact/Vue/Svelte |
| :--- | :--- | :--- | :--- |
| **Best Use Case** | Static UI, Layouts | Complex UI + CMS Preview | Lightweight Interactive UI |
| **Site Performance** | Excellent (Zero JS) | Good (React Hydration) | Excellent (Light Hydration) |
| **CMS Preview** | Form Only | **Live Visual Preview** | Form Only |
| **File Extension** | `.astro` | `.tsx` | `.tsx`, `.vue`, `.svelte` |
| **Keystatic Config** | Schema Only | Schema + `ContentView` | Schema Only |
