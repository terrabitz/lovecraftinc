# How `withPreact` Works: Bridging React and Preact

## The Problem

We have two UI frameworks running in the same application:

- **React**: Powers the Keystatic CMS admin interface.
- **Preact**: Powers interactive components on the live site (smaller bundle size).

We want to write a component once (in Preact) and show a live preview of it inside the Keystatic admin (which is React). But React and Preact are separate frameworks that cannot render each other's components directly.

---

## What Are Virtual DOM Elements?

Both React and Preact work by creating lightweight JavaScript objects called **virtual DOM nodes** (VNodes) that describe what the UI should look like. When you write JSX like this:

```tsx
<DiceRoller initialDie="d20" />
```

The build tool transforms it into a function call. **Which function** depends on which framework "owns" the file:

| Framework | JSX Compiles To | Result |
| :--- | :--- | :--- |
| React | `React.createElement(DiceRoller, { initialDie: 'd20' })` | A React VNode (frozen object) |
| Preact | `h(DiceRoller, { initialDie: 'd20' })` | A Preact VNode (mutable object) |

These two VNode formats are **incompatible**. React's `render()` cannot process Preact VNodes, and Preact's `render()` cannot process React VNodes.

**References:**
- [React: createElement API](https://react.dev/reference/react/createElement)
- [Preact: h() / createElement](https://preactjs.com/guide/v10/api-reference/#h--createelement)

### The Frozen Object Problem

React 19+ freezes its VNodes with `Object.freeze()`. This means no properties can be added to them after creation. Preact's renderer needs to stamp internal bookkeeping properties (like `__`) onto VNodes it processes. When Preact tries to modify a frozen React VNode, you get:

```
TypeError: Cannot add property __, object is not extensible
```

This change was introduced as part of React 19's security hardening. See:
- [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19)
- [MDN: Object.freeze()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)

---

## How `/** @jsxImportSource */` Works

The `/** @jsxImportSource react */` pragma at the top of a file tells the TypeScript/Vite compiler: "Every piece of JSX in this file should be compiled using React's `createElement`."

This is part of the [JSX Transform](https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html) specification, supported by TypeScript via the [`jsxImportSource` compiler option](https://www.typescriptlang.org/tsconfig/#jsxImportSource). Per-file pragmas override the project-wide setting.

This is critical because `withPreact.tsx` needs to be a **React component** (so Keystatic can render it), but it also needs to create **Preact VNodes** (to mount the Preact component).

If we wrote `<PreactComponent {...props} />` in this file, the compiler would see the `@jsxImportSource react` directive and compile it as:

```javascript
React.createElement(PreactComponent, props)
// Returns a frozen React VNode that Preact cannot use
```

Instead, we bypass JSX entirely and call Preact's `h()` function directly:

```javascript
h(PreactComponent, props)
// Returns a mutable Preact VNode that Preact can render
```

This is the key insight: **JSX is just syntactic sugar for function calls**, and we can mix function calls from different frameworks in the same file as long as we're explicit about which one we're calling.

**References:**
- [TypeScript: jsxImportSource](https://www.typescriptlang.org/tsconfig/#jsxImportSource)
- [React: Introducing the New JSX Transform](https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html)

---

## The DOM Boundary: Why Two `<div>` Elements?

React and Preact each maintain their own internal data structures attached to the DOM nodes they manage. React uses [internal fiber nodes](https://react.dev/learn/preserving-and-resetting-state) linked to DOM elements, and Preact similarly attaches its own `__` properties to DOM nodes it controls. If both frameworks try to manage the same DOM node, they corrupt each other's state.

Our solution creates a strict ownership boundary:

```
React's DOM Tree
  └── <div ref={ref}>          ← React owns this node
        └── <div>              ← Preact owns this node (created via document.createElement)
              └── <DiceRoller> ← Preact renders here
```

### The Outer `<div>` (React-Owned)

```tsx
return <div ref={ref} style={{ display: 'contents' }} />;
```

This is a standard React element. React creates this DOM node and gives us a reference to it via [`useRef`](https://react.dev/reference/react/useRef). React manages this node's lifecycle (creation, updates, removal).

### The Inner `<div>` (Preact-Owned)

```javascript
containerRef.current = document.createElement('div');
ref.current.appendChild(containerRef.current);
```

We manually create a child DOM node using the raw browser API ([`document.createElement`](https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement)). Neither React nor Preact created this node through their virtual DOM systems. We then hand it to Preact as its render target via [`preact.render()`](https://preactjs.com/guide/v10/api-reference/#render). Preact now "owns" this node and everything inside it.

### Why `display: contents`?

Both wrapper `<div>` elements use [`display: contents`](https://developer.mozilla.org/en-US/docs/Web/CSS/display#display_contents). This CSS property makes the element itself invisible to the layout engine. Its children are rendered as if they were direct children of the grandparent. This prevents the wrapper divs from affecting the visual layout (no extra spacing, no broken flexbox, etc.).

---

## The `useEffect` Lifecycle

```tsx
useEffect(() => {
  // Mount: Create container and render Preact component
  // ...
  render(h(PreactComponent, props), containerRef.current);

  return () => {
    // Cleanup: Unmount the Preact component
    render(null, containerRef.current);
  };
}, [props]);
```

- **On mount / props change**: We call Preact's `render()` to mount or update the Preact component inside the container we own.
- **On unmount**: The cleanup function calls `render(null, ...)` which tells Preact to remove everything from the container, preventing memory leaks.
- **`[props]` dependency**: Whenever React passes new props (e.g., the user changes a dropdown in Keystatic), the effect re-runs and Preact re-renders with the updated values.

**References:**
- [React: useEffect](https://react.dev/reference/react/useEffect)
- [React: Synchronizing with Effects (cleanup functions)](https://react.dev/learn/synchronizing-with-effects#step-3-add-cleanup-if-needed)
- [Preact: render()](https://preactjs.com/guide/v10/api-reference/#render)

---

## Data Flow Summary

```
Keystatic Admin (React)
  │
  ├── User changes "initialDie" dropdown to "d6"
  │
  ├── React re-renders <PreactWrapper initialDie="d6">
  │     │
  │     ├── useEffect fires (props changed)
  │     │     │
  │     │     ├── h(DiceRoller, { initialDie: "d6" })  ← Creates Preact VNode
  │     │     │
  │     │     └── render(vnode, container)              ← Preact updates its DOM tree
  │     │
  │     └── Returns <div ref={ref}> (unchanged, React doesn't touch Preact's subtree)
  │
  └── User sees updated DiceRoller preview in the admin UI
```

---

## Why Not Just Use `preact/compat`?

[`preact/compat`](https://preactjs.com/guide/v10/switching-to-preact/) is a drop-in replacement that aliases all `react` imports to Preact. If we used it globally (via [Vite resolve aliases](https://vite.dev/config/shared-options.html#resolve-alias)), Keystatic itself would run on Preact instead of React. While `preact/compat` handles most React APIs, Keystatic is a complex application and subtle incompatibilities could break the admin UI.

The `withPreact` approach is surgical: React runs React, Preact runs Preact, and the two only interact through a thin DOM boundary that we fully control.

---

## Prior Art

The `withPreact` pattern is not novel -- it draws on well-established techniques from micro-frontend architecture and framework interop. Here's where similar ideas have been explored:

### Astro Islands

Astro's entire architecture is built on this concept. Each interactive component on a page is an independent "island" that can use any framework (React, Preact, Svelte, Vue, etc.). Astro creates separate hydration roots for each island, so multiple frameworks coexist on the same page without interfering with each other. Our `withPreact` does the same thing at a smaller scale: it creates a Preact island inside a React tree.

- [Astro: Islands Architecture](https://docs.astro.build/en/concepts/islands/)
- [Astro: Framework Components](https://docs.astro.build/en/guides/framework-components/) -- see "Mixing frameworks" section
- [Jason Miller (Preact creator): Islands Architecture](https://jasonformat.com/islands-architecture/) -- the original 2020 blog post that coined the term

### single-spa Parcels

[single-spa](https://single-spa.js.org/) is a micro-frontend framework that provides exactly this capability through its "parcel" abstraction. A parcel wraps a component from any framework (React, Vue, Angular, etc.) and exposes `mount(props)` / `unmount()` lifecycle methods. The [`<Parcel>` React component](https://single-spa.js.org/docs/ecosystem-react/#parcels) lets you embed a parcel from any framework inside a React tree -- it creates a `<div>`, passes it to the parcel's `mount()` function, and calls `unmount()` on cleanup. This is structurally identical to what `withPreact` does.

- [single-spa: Parcels Overview](https://single-spa.js.org/docs/parcels-overview/) -- framework-agnostic component mounting
- [single-spa-react: Parcel Component](https://single-spa.js.org/docs/ecosystem-react/#parcels) -- the React wrapper that uses `useEffect` + DOM node handoff

### React Portals and `createPortal`

React's own [`createPortal`](https://react.dev/reference/react-dom/createPortal) uses a conceptually similar approach: rendering React content into a DOM node that lives outside the parent React tree. The React docs even show an example of ["Rendering React components into non-React DOM nodes"](https://react.dev/reference/react-dom/createPortal#rendering-react-components-into-non-react-dom-nodes) -- rendering into a DOM node owned by a third-party widget (e.g., a map library). Our pattern inverts this: instead of rendering React into a non-React container, we render Preact into a React-owned container.

- [React: createPortal API](https://react.dev/reference/react-dom/createPortal)
- [React: Rendering into non-React DOM nodes](https://react.dev/reference/react-dom/createPortal#rendering-react-components-into-non-react-dom-nodes)

### Micro Frontends (Martin Fowler / Cam Jackson)

The Thoughtworks article on micro frontends describes the exact `useEffect` + `document.createElement` + imperative mount/unmount pattern. Their `MicroFrontend` React component creates a container `<main>` element, then in `componentDidMount` calls a global `window.renderBrowse(containerId)` function that mounts an entirely separate React application into that node. On `componentWillUnmount`, it calls a corresponding `window.unmountBrowse()`. Our `withPreact` follows the same lifecycle, just using Preact's `render()` / `render(null)` instead of global functions.

- [Martin Fowler: Micro Frontends](https://martinfowler.com/articles/micro-frontends.html) -- see "Run-time integration via JavaScript" and "The container" sections
- [GitHub: micro-frontends-demo](https://github.com/micro-frontends-demo/container) -- working example of the `MicroFrontend` React component

### Web Components as a Bridge

The Web Components spec (Custom Elements + Shadow DOM) provides a browser-native version of this pattern. You can create a custom element that internally uses any framework to render, and use it from any other framework. Libraries like [`@lit/react`](https://lit.dev/docs/frameworks/react/) and Angular's [`@angular/elements`](https://angular.dev/guide/elements) wrap framework components as custom elements for cross-framework consumption.

- [Lit: React Integration](https://lit.dev/docs/frameworks/react/) -- wrapping Lit components for use in React
- [MDN: Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)

### The "Strangler Fig" Pattern

Our use case (running Preact components inside a React admin UI during a migration or coexistence period) maps to what Martin Fowler calls the [Strangler Fig Application](https://martinfowler.com/bliki/StranglerFigApplication.html): gradually replacing or augmenting one system with another by wrapping pieces incrementally, rather than doing a wholesale rewrite.

---

## Further Reading

- [Preact: Differences from React](https://preactjs.com/guide/v10/differences-to-react/)
- [Preact: Switching to Preact](https://preactjs.com/guide/v10/switching-to-preact/)
- [Astro: UI Framework Integrations](https://docs.astro.build/en/guides/framework-components/)
- [Astro: @astrojs/preact](https://docs.astro.build/en/guides/integrations-guide/preact/)
- [Astro: @astrojs/react](https://docs.astro.build/en/guides/integrations-guide/react/)
- [Keystatic: Content Components](https://keystatic.com/docs/content-components)
