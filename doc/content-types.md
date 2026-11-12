# Content types

`src/content-types.ts` is the single registry for content types. It drives Astro
collections, Keystatic forms and image directories, list and detail routes,
navigation, dashboard cards and totals, global search, and the remark article-link
plugin configuration.

## Adding a type

Add one entry to `definitions` in `src/content-types.ts`:

```typescript
{
  slug: 'sites',
  label: 'Sites',
  singular: 'Site',
  heading: 'Site Directory',
  description: 'Browse containment sites.',
  idPattern: /EID-SITE-\d+/,
  idHint: 'ID must start with "EID-SITE-" followed by numbers',
}
```

Use a unique, lowercase, kebab-case slug that does not collide with an existing
page such as `dashboard`, `api`, or `keystatic`. The slug determines the collection
name, content directory, and URL prefix. ID patterns are unanchored for reference
matching; both Astro and Keystatic automatically anchor them for ID validation.
Use non-overlapping patterns that cannot match an empty string.

Optionally set `icon` to an asset prefix such as `Employee`. The corresponding
`<prefix> Icon Light.png` and `<prefix> Icon Dark.png` files must exist under
`src/assets/Icons/`. Omit `icon` to use no icon.

Optionally add `columns` to show selected metadata in the listing table:

```typescript
columns: [
  { key: 'location', label: 'Location', hideOnMobile: true },
  { key: 'status', label: 'Status', hideOnTablet: true },
],
```

ID and Name columns always appear. All metadata appears in the selection panel
and detail page, whether or not a table column is configured.

Create records in Keystatic or add `.mdoc` files under `src/content/sites/`.
No additional routes, components, schemas, or search cases are needed.

## Record format

All types share the same frontmatter:

```yaml
---
id: EID-SITE-001
name: Site Alpha
metadata:
  location: Arkham
  status: Operational
  established: '1995-04-28'
---

Article body written in Markdoc.
```

Only `id`, `name`, and `metadata` belong in frontmatter. `metadata` is an arbitrary
map of text keys to text values; it can be omitted or empty. Quote dates, numbers,
and boolean-looking text so YAML does not turn them into other types. Blank keys
and duplicate keys in the CMS are rejected. No metadata key is required or tied
to a particular type.

Keystatic provides Add metadata / Remove controls and editable key/value rows.
The map is stored as a YAML object, not a list or a JSON string. Existing Markdoc
components and per-collection image uploads remain available.

Metadata keys and values participate in listing search, and metadata is included
in the global search index. Existing IDs and URLs are unchanged by the migration
from type-specific frontmatter fields to `metadata`.

The remark plugin applies to Markdown processed by Astro's Markdown pipeline;
this registry does not add remark processing to Markdoc.
