# CSS Cascade Layers and Tailwind

## What Are Cascade Layers?

CSS Cascade Layers (`@layer`) let authors organize their styles into explicit priority groups. They were introduced in the CSS Cascade Level 5 spec and are supported in all modern browsers.

```css
@layer base {
  h1 { color: red; }
}

@layer utilities {
  .blue { color: blue; }
}
```

The cascade resolves conflicts between layers based on **layer order**, not specificity. The last declared layer wins over earlier layers.

## The Critical Rule: Unlayered Styles Beat Layered Styles

The most important thing to understand:

**Unlayered (regular) CSS always wins over layered CSS, regardless of selector specificity.**

This means:

```css
/* Layered -- lower priority */
@layer utilities {
  .my-class { font-size: 20px; }  /* specificity: 0,1,0 */
}

/* Unlayered -- higher priority */
button { font-size: 14px; }  /* specificity: 0,0,1 */
```

Even though `.my-class` has higher specificity than `button`, the unlayered `button` rule wins because the cascade evaluates **layer membership before specificity**.

The full cascade priority order (highest to lowest):

1. `!important` in layered styles (earliest layer wins)
2. `!important` in unlayered styles
3. Unlayered normal styles
4. Layered normal styles (last layer wins)

## How Tailwind Uses Layers

Tailwind v4 wraps its generated utilities inside `@layer` blocks. When you write:

```css
@import "tailwindcss";
```

Tailwind outputs something like:

```css
@layer theme { /* CSS variables, design tokens */ }
@layer base { /* preflight/reset styles */ }
@layer components { /* component classes */ }
@layer utilities { /* utility classes like flex, text-xl, etc. */ }
```

This layering is what makes Tailwind's utility-first approach work -- utilities in the last layer override components and base styles predictably. But it also means **any unlayered CSS from a third-party library will override all Tailwind utilities**.

## The 98.css Conflict

In this project, 98.css is imported as regular unlayered CSS. It defines element-level rules like:

```css
button { font-size: 11px; }
h1 { font-size: ... }
```

Even though Tailwind's `text-xl` has a higher specificity class selector, it lives inside a `@layer`, so 98.css's unlayered element selectors take priority.

## Solutions

### 1. The `!important` modifier (per-utility fix)

Tailwind's `!` prefix adds `!important` to override everything:

```html
<button class="text-xl!">Click me</button>
```

Generates: `font-size: 1.25rem !important`

Use this for one-off overrides where only a few utilities are affected.

### 2. Import 98.css into a layer (project-wide fix)

You can place third-party CSS into an explicit layer so it participates in layer ordering rather than sitting above all layers:

```css
@layer vendor {
  @import "98.css";
}

@import "tailwindcss";
```

With this setup, 98.css rules are in the `vendor` layer. Since Tailwind's `utilities` layer comes later, Tailwind utilities will naturally win over 98.css without needing `!important`.

This is the cleanest solution but requires testing to ensure 98.css styles still apply correctly where you want them (since Tailwind's base/reset styles would now override 98.css for any conflicting properties).

### 3. Custom unlayered overrides

Write unlayered CSS after your imports to override specific 98.css rules:

```css
@import "tailwindcss";

/* Unlayered, so beats 98.css by source order */
button { font-size: unset; }
```

This is fragile and doesn't scale well.

## When You'll Hit This

Any time a Tailwind utility targets a property that 98.css also sets on the same element, the 98.css rule wins. Common cases in this project:

- `font-size` on `button`, `h1`, `table`
- `background` on various elements
- `box-shadow` on `.window`, `button`, inputs

If the Tailwind class doesn't seem to apply, check the browser DevTools -- you'll see the Tailwind rule crossed out with the 98.css rule winning, even with lower specificity.

## Further Reading

- [MDN: Cascade Layers](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Cascade_layers)
- [Tailwind v4: Compatibility with third-party CSS](https://tailwindcss.com/docs/compatibility)
- [CSS Cascade Level 5 Spec](https://www.w3.org/TR/css-cascade-5/#layering)
