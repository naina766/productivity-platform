// Ambient declaration for global CSS side-effect imports (e.g. app/globals.css).
// TypeScript 6 enables `noUncheckedSideEffectImports` by default; Next's types
// only declare `*.module.css`, so plain `import './globals.css'` needs this.
declare module '*.css';