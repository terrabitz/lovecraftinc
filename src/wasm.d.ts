/// <reference types="astro/client" />
/// <reference types="vite-plugin-arraybuffer/types" />

declare module '*?inline' {
  const src: string;
  export default src;
}

declare module '*.wasm' {
  const content: WebAssembly.Module;
  export default content;
}