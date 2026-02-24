# Guide: Dynamic Content Enrichment (Auto-linking & Inline Components)

This guide explores how to enrich your content by automatically turning text patterns (like dice notation `1d6`) into interactive components, or manually inserting inline components.

## Scenario
You want text like `1d6` or `2d20` to automatically become an interactive clickable roller, without manually typing `{% dice-roller /%}` every time.

## Approach Comparison

| Feature | Custom Remark Plugin | Markdoc Inline Component |
| :--- | :--- | :--- |
| **Trigger** | Automatic (Regex pattern like `\d+d\d+`) | Manual (Explicit tag `{% dice %}`) |
| **Syntax** | Just write text: `I roll 1d6 damage.` | Write tag: `I roll {% dice "1d6" /%} damage.` |
| **Complexity** | High (Requires AST manipulation) | Low (Standard Markdoc feature) |
| **Best For** | "Magic" replacements, reducing friction | Explicit control, complex props |

---

## Option 1: The "Magic" Route (Remark Plugin)
**Best for:** Automatically converting simple text patterns into components.

We can create a Remark plugin that scans for regex matches (e.g., `/\b\d+d\d+\b/`) and transforms them into Markdoc tag nodes.

### 1. Create the Plugin
`src/plugins/remark-smart-dice.ts`

```typescript
import { visit } from 'unist-util-visit';

export function remarkSmartDice() {
  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      const regex = /\b(\d+)d(\d+)\b/g;
      const value = node.value;
      
      if (!regex.test(value)) return;

      const children = [];
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(value)) !== null) {
        // Push preceding text
        if (match.index > lastIndex) {
          children.push({ type: 'text', value: value.slice(lastIndex, match.index) });
        }

        // Push the Markdoc tag node
        // Note: This output format depends on how Markdoc integration parses it.
        // Often it's easier to simply convert to a Markdoc tag structure if the integration supports it, 
        // OR transform to an HTML node that Astro/Markdoc will treat as a component.
        children.push({
          type: 'markdocTag', // Pseudo-type for conceptual understanding
          name: 'dice-roller',
          attributes: { initialDie: match[0] }
        });

        lastIndex = regex.lastIndex;
      }

      // Push remaining text
      if (lastIndex < value.length) {
        children.push({ type: 'text', value: value.slice(lastIndex) });
      }

      parent.children.splice(index, 1, ...children);
    });
  };
}
```

*Note: Writing robust AST transforms can be tricky. A simpler alternative is to transform the text to a Markdoc tag string directly if your pipeline runs before Markdoc parsing.*

---

## Option 2: The Inline Markdoc Component (Recommended)
**Best for:** Explicit control and simplicity. Markdoc supports inline tags natively!

You can define a tag as `inline` in the schema. This allows it to sit inside a paragraph without breaking the block.

### 1. Configure Markdoc
`markdoc.config.mjs`

```javascript
tags: {
  'dice': {
    render: component('./src/components/preact/InlineDice.tsx'),
    attributes: {
      notation: { type: String, required: true }
    },
    // Markdoc treats tags as inline if they appear in inline context, 
    // but ensuring your component renders as <span> or inline-block is key.
  }
}
```

### 2. Create the Inline Component
`src/components/preact/InlineDice.tsx`

```tsx
/** @jsxImportSource preact */
import { useState } from 'preact/hooks';

export default function InlineDice({ notation }) {
  const [result, setResult] = useState(null);

  const roll = () => { /* ... parse notation and roll ... */ };

  return (
    <span className="inline-flex items-center gap-1 mx-1">
      <button 
        onClick={roll}
        className="px-1.5 py-0.5 text-xs bg-gray-200 hover:bg-gray-300 rounded border border-gray-400"
      >
        {notation}
      </button>
      {result && <span className="font-bold text-blue-600">[{result}]</span>}
    </span>
  );
}
```

### 3. Usage
In your markdown:
```markdown
The monster attacks for {% dice notation="2d6" /%} slashing damage.
```

### 4. Keystatic Setup
Use `inline` from content-components for the schema.

```typescript
import { inline } from '@terrabitz/keystatic-core/content-components';

components: {
  dice: inline({
    label: 'Inline Dice',
    schema: {
      notation: fields.text({ label: 'Notation' }),
    }
  })
}
```

---

## Recommendation

For your specific case of `1d6` conversion:
1.  **Start with Option 2 (Inline Components)**. It is robust, explicit, and easy to build.
2.  If typing `{% dice ... %}` becomes annoying, treat Option 1 as an enhancement later. You can write a script or plugin that pre-processes your content to find `1d6` and replace it with `{% dice notation="1d6" /%}` automatically!
