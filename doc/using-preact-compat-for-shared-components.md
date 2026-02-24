# Guide: Using Preact Compat for React Components

This guide explains how to write shared components using standard React syntax that are compiled to Preact for your production site (for performance) while remaining compatible with React-based tools like Keystatic.

## The Goal
*   **Write once**: Share logic between the CMS and the live site.
*   **Run efficiently**: Serve lightweight Preact (3kb) on the live site.
*   **Run stably**: Use genuine React (40kb+) for the Keystatic Admin UI to ensure 100% compatibility.

## Strategy: The "Wrapper" Pattern
Instead of aliasing React globally (which forces Keystatic to use Preact and might break the CMS), we will:
1.  Write the component in **Preact** (for the site).
2.  Create a tiny **React Wrapper** (for Keystatic) that imports the Preact component and renders it.

This ensures the site gets the 3kb library, and Keystatic gets the stable React environment it expects.

---

## Step 1: Create the Preact Component
Write your component using standard Preact syntax.

**File**: `src/components/preact/DiceRoller.tsx`

```tsx
/** @jsxImportSource preact */
import { useState } from 'preact/hooks';

export default function DiceRoller({ initialDie = 'd20' }) {
  const [result, setResult] = useState<number | null>(null);

  // ... implementation ...

  return (
    <div className="dice-roller">
      {/* UI ... */}
    </div>
  );
}
```

---

## Step 2: Create a Generic Wrapper Helper
Instead of writing a wrapper for every single component, let's create a reusable utility helper.

**File**: `src/utils/withPreact.tsx`

```tsx
/** @jsxImportSource react */
import React, { useEffect, useRef } from 'react';
import { render } from 'preact';

/**
 * A Higher-Order Component (HOC) to wrap Preact components for use in React.
 */
export function withPreact(PreactComponent: any) {
  return function PreactWrapper(props: any) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (ref.current) {
        render(<PreactComponent {...props} />, ref.current);
      }
      return () => {
        if (ref.current) {
          render(null, ref.current);
        }
      };
    }, [props]);

    // display: contents ensures the wrapper doesn't affect layout
    return <div ref={ref} style={{ display: 'contents' }} />;
  };
}
```

---

## Step 3: Configure Astro (`markdoc.config.mjs`)
For the live site, interact directly with the Preact component.

```javascript
/* markdoc.config.mjs */
tags: {
  'dice-roller': {
    render: component('./src/components/preact/DiceRoller.tsx'), // Uses Preact!
    attributes: { /*...*/ },
  },
}
```

---

## Step 4: Configure Keystatic (`keystatic.config.ts`)
Wrap the component on-the-fly right inside your config file!

```typescript
/* keystatic.config.ts */
// 1. Import createElement and the helper
import { createElement } from 'react';
import { withPreact } from './src/utils/withPreact';

// 2. Import your Preact component
import DiceRoller from './src/components/preact/DiceRoller';

// 3. Create the wrapped version (React)
const DiceRollerReact = withPreact(DiceRoller);

// ... inside your schema ...
  // Use createElement since keystatic.config.ts cannot use JSX
  ContentView: (props) =>
    createElement(DiceRollerReact, { initialDie: props.value.initialDie }),
// ...
```

---

## Summary of Architecture

| Context | Component Used | Framework | Outcome |
| :--- | :--- | :--- | :--- |
| **Live Site** | `DiceRoller.tsx` | **Preact** | Fast, small bundle (~3kb). |
| **Keystatic Admin** | `DiceRollerWrapper.tsx` | **React** | Stable, fully compatible CMS. |

This approach provides the **exact** separation you asked for: React for the CMS, Preact for production, with zero risk of breaking Keystatic's internals via global aliasing.
