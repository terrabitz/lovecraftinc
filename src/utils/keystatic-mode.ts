// The Astro dev server always edits local files; builds honor PUBLIC_KEYSTATIC_MODE.
export const useGitHubStorage =
  !import.meta.env.DEV && import.meta.env.PUBLIC_KEYSTATIC_MODE === 'github';
