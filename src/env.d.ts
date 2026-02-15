/// <reference types="astro/client" />
/// <reference types="vite-plugin-arraybuffer/types" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_GITHUB_OWNER?: string;
  readonly PUBLIC_GITHUB_REPO?: string;
  readonly PUBLIC_KEYSTATIC_MODE?: string;
}

declare module '*&inline' {
  const src: string;
  export default src;
}

declare module '*.wasm' {
  const content: WebAssembly.Module;
  export default content;
}
