# Astro Image Handling

This document explains how images are handled in this project and the rationale behind the implementation.

## Background: `src/` vs `public/`

Astro provides two locations for storing images:

- **`public/`**: Files served as-is with no processing. Use for favicons or images that need a stable public URL.
- **`src/`** (recommended): Images are processed, optimized, and bundled during build. Astro can convert formats (PNG to webp), resize, and add content hashes for cache busting.

We store images in `src/assets/` so Astro can optimize them during the build process.

## How Astro Image Optimization Works

### Build Time (`astro build`)

When you run the build:

1. `getImage()` or `<Image />` runs on the server
2. Sharp processes each image (resize, format conversion)
3. Optimized files output to `dist/_astro/` with content hashes
4. HTML references the pre-built static files

### Dev Mode (`astro dev`)

In development:

1. Images are processed on-demand via the `/_image` endpoint
2. Browser requests trigger Sharp processing in real-time
3. Large images can cause timeouts or canceled requests

This is why we specify a target `width` - it ensures fast processing in both build and dev modes.

## Framework Components and Images

Astro's `<Image />` component and `getImage()` function are **server-side/build-time only**. They cannot be used inside UI framework components (React, Preact, Vue, etc.) because:

1. **Client-side execution**: Components with `client:load` hydrate and run in the browser. `getImage()` executes during build on the server.

2. **Module availability**: `astro:assets` is part of Astro's server-side rendering system and is not available to framework components.

3. **Timing**: Image optimization happens at build time. By the time the browser loads the page, this work must already be complete.

### The Solution: Props Pattern

The recommended approach is to:

1. Import and optimize images in an Astro component (`.astro` file)
2. Pass the optimized URLs as props to the framework component

```astro
---
// ContentLayout.astro (Astro component - runs at build time)
import { getImage } from "astro:assets";
import MyComponent from './MyComponent.tsx';
import imageSrc from '../assets/image.png';

const optimizedUrl = (await getImage({ src: imageSrc, format: 'webp', width: 200 })).src;
---

<MyComponent imageUrl={optimizedUrl} client:load />
```

```tsx
// MyComponent.tsx (Framework component - runs in browser)
export default function MyComponent({ imageUrl }: { imageUrl: string }) {
  return <img src={imageUrl} alt="..." />;
}
```

See: https://www.reddit.com/r/astrojs/comments/1bia6lq/comment/kvj4gp3/

> You cannot use Astro components on frameworks components, this is a limitation of the web architecture. Astro components, depending on your output work are run during your build process or on the server, while framework components, like react, work on the user browser. The data flow is server -> client. No the other way around. So is important to regard the client directives (client:load, client:visible, etc) as a boundary between server and client. Once you cross it, you cannot go back (ie: you can't import astro components on client components). Other frameworks like Next (with the app router) have the same limitations (you can't import a Server Component on a Client Component).
> 
> So, what is the solution? For a small website where I need to use my content colection images on a dynamic route, I optimized all the images using the getImage() function (https://docs.astro.build/en/guides/images/#generating-images-with-getimage) before time, and the passed the optimized images to my react component as a prop. As my output was a static site, all the images were processed during the build time.
> 
> Another option (that i discarded for incompatibilities of my hosting solution) was to create an api route on my web, that received the image and some parameters, and run the getImage() function on the server and return the optimized image. Locally it worked, but I couldn't manage to run on my hosting (Cloudflare) most probably because the getImage() function required some node packages that were not available on the Edge. Probably it would have worked on a Node adaptar (like running it from a VPS) but that particular webpage didn't had that budged.

## Implementation in This Project

### Image Storage

Source images (high-quality PNGs) are stored in `src/assets/`:

```
src/assets/
  SID - Frame 1.png
  SID - Frame 2.png
  SID - Horror 1.png
  SID - Horror 2.png
  windows_95_icons_help_book_large.png
```

### Optimization in ContentLayout.astro

```astro
---
import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";

import sidFrame1Src from '../assets/SID - Frame 1.png';
import sidFrame2Src from '../assets/SID - Frame 2.png';
// ... other imports

const SID_IMAGE_SIZE = 200; // 2x display size for retina

async function getOptimizedImage(src: ImageMetadata): Promise<string> {
  return (await getImage({ src, format: 'webp', width: SID_IMAGE_SIZE })).src;
}

const sidFrames = await Promise.all([sidFrame1Src, sidFrame2Src].map(getOptimizedImage));
const sidHorrorFrames = await Promise.all([sidHorror1Src, sidHorror2Src].map(getOptimizedImage));
const sidHelpIcon = await getOptimizedImage(helpIconSrc);
---

<SidAssistant 
  frames={sidFrames} 
  horrorFrames={sidHorrorFrames} 
  helpIcon={sidHelpIcon} 
  client:load 
/>
```

### SidAssistant Component

The Preact component receives optimized URLs as props:

```tsx
interface SidAssistantProps {
  frames: string[];        // Array of optimized image URLs
  horrorFrames: string[];  // Array of optimized image URLs  
  helpIcon: string;        // Single optimized image URL
}

export default function SidAssistant({ frames, horrorFrames, helpIcon }: SidAssistantProps) {
  // Use URLs directly in <img> tags
  return <img src={frames[0]} alt="..." />;
}
```

## Optimization Results

With `width: 200` and webp conversion:

| Image | Original PNG | Optimized webp |
|-------|-------------|----------------|
| SID - Frame 1 | 1,211 KB | 10 KB |
| SID - Frame 2 | 1,196 KB | 10 KB |
| SID - Horror 1 | 3,615 KB | 11 KB |
| SID - Horror 2 | 3,770 KB | 10 KB |
| Help icon | 9 KB | 4 KB |
| **Total** | **~9.8 MB** | **~45 KB** |

## Key Takeaways

1. Store images in `src/` for automatic optimization
2. Use `getImage()` with `format` and `width` options for control over output
3. Pass optimized URLs to framework components via props
4. Specify a reasonable `width` to avoid processing timeouts in dev mode
5. The `width` should be 2x display size for retina support (100px display = 200px image)
