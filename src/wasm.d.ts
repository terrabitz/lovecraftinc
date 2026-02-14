/// <reference types="astro/client" />

declare module '*.wasm' {
  const content: WebAssembly.Module;
  export default content;
}