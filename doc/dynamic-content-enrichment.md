# Auto-replacing Text Patterns with Markdoc Components

Markdoc processes content in two stages: **parse** (text to AST) and **transform** (AST to renderable tree). We can override the `text` node's transform to scan for regex patterns and replace matches with component tags.

This is the Markdoc equivalent of the text-node visitor pattern used in remark plugins like `remark-article-links`.

## Example: Auto-converting Dice Notation

Given content like:

```markdown
The monster deals 2d6 slashing damage plus 1d4 fire damage.
```

We want `2d6` and `1d4` to automatically render as interactive dice roller components, without the author needing to write `{% dice-roller /%}` tags.

### 1. Create the Transform

`src/plugins/markdoc-dice-transform.ts`

```typescript
import Markdoc from '@markdoc/markdoc';

const DICE_PATTERN = /\b(\d+d\d+)\b/g;

export function diceTextTransform(node: any) {
  const content: string = node.attributes.content;

  if (!DICE_PATTERN.test(content)) return content;
  DICE_PATTERN.lastIndex = 0;

  const parts: (string | InstanceType<typeof Markdoc.Tag>)[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = DICE_PATTERN.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    parts.push(new Markdoc.Tag('dice-roller', { initialDie: match[1] }));
    lastIndex = DICE_PATTERN.lastIndex;
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts;
}
```

### 2. Wire It Up

Register both the node transform and the corresponding tag in `markdoc.config.mjs`:

```javascript
import { defineMarkdocConfig, component } from '@astrojs/markdoc/config';
import { diceTextTransform } from './src/plugins/markdoc-dice-transform';

export default defineMarkdocConfig({
  nodes: {
    text: {
      transform: diceTextTransform,
    },
  },
  tags: {
    'dice-roller': {
      render: component('./src/components/ClientDiceRoller.astro'),
      attributes: {
        initialDie: { type: String, default: 'd20' },
      },
    },
  },
});
```

Now `2d6` in any `.mdoc` file automatically renders as `<DiceRoller initialDie="2d6" />`.

## The General Pattern

To auto-replace any text pattern with a component:

1. Write a transform function that receives a Markdoc text node (`node.attributes.content`)
2. Scan for your regex pattern
3. Return an array of plain strings (unchanged text) and `new Markdoc.Tag(tagName, attributes)` (for matches)
4. Register the transform on the `text` node and define the corresponding tag in `markdoc.config.mjs`

This follows the same split-and-splice approach as `remark-article-links`, but operates on Markdoc's AST instead of mdast.
