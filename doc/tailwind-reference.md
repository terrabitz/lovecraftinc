# Tailwind Utility Class Reference

This document serves as a reference for the Tailwind CSS utility classes currently used in the project (detected in `src/`).

## Layout

### Flexbox
- `flex`: Creates a flex container.
- `flex-col`: Sets the flex direction to column.
- `flex-grow` / `grow`: Allows a flex item to grow to fill available space.
- `justify-between`: Distributes items evenly; the first item at the start, the last at the end.
- `items-center`: Aligns items along the center of the container's cross axis.
- `items-start`: Aligns items to the start of the container's cross axis.
- `gap-*`: Controls gutters between grid and flex items.

### Grid
- `grid`: Creates a grid container.
- `grid-cols-*`: Specifies the number of columns in the grid.
  - Used: `grid-cols-1`
  - Responsive: `md:grid-cols-2`, `lg:grid-cols-3`

### Display & Position
- `block`: Displays an element as a block-level element.
- `inline-block`: Displays an element as an inline-level block container.
- `hidden`: Hides an element.

## Spacing

### Margin
- `m-*`: Controls margin.
  - `mt-*` (top): `mt-0`, `mt-1`, `mt-2`, `mt-3`, `mt-4`, `mt-auto`
  - `mr-*` (right): `mr-4`
  - `my-*` (vertical): `my-3`
  - `mx-*` (horizontal): `mx-auto`

### Padding
- `p-*`: Controls padding.
  - Examples: `p-2`, `p-3`

## Sizing

- `h-*`: Controls element height.
- `w-*`: Controls element width.
  - Example: `w-[70%]` for 70% width   

## Typography

- `text-*`: Controls font size and alignment.
  - `text-center`: Centers text.
  - `text-xl`: Extra large font size.

## Modifiers

- `md:*`, `lg:*`: Responsive modifiers for different screen sizes.
- `!`: Important modifier (e.g., `text-xl!` found in `index.astro`).

## Note on Non-Tailwind Classes
The project also heavily uses classes from `98.css` and custom scoped styles (via CSS modules or `global.css`):
- `window`, `window-body`, `title-bar`, `status-bar` (98.css)
- `sunken-panel`, `field-border` (Retro UI elements)
