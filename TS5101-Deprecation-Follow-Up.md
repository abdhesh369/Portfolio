# TypeScript 7.0 Migration Plan: Removing `baseUrl`

This document outlines the steps required to remove reliance on the deprecated `baseUrl` compiler option in `Frontend/tsconfig.json` before upgrading to TypeScript 7.0.

## Background
TypeScript 5.1/5.5+ deprecated the `baseUrl` option and it will stop functioning in TypeScript 7.0 (error TS5101). Currently, the Frontend uses it to simplify import paths like `@/*`, `@shared/*`, and `@portfolio/shared/*`.

We have temporarily silenced the warning using `"ignoreDeprecations": "6.0"`, but a structural fix is necessary for long-term compatibility.

## Recommended Follow-Up Actions

### 1. Adopt Native Node.js Subpath Imports
Modern Node.js and bundlers support [subpath imports](https://nodejs.org/api/packages.html#subpath-imports) defined in `package.json`.

Update `Frontend/package.json` to include:
```json
"imports": {
  "#src/*": "./src/*",
  "#shared/*": "./shared/*"
}
```
*Note: The `#` prefix is standard and required for Node.js subpath imports.*

### 2. Update `Frontend/tsconfig.json`

Remove the deprecated fields:
```diff
- "ignoreDeprecations": "6.0",
- "baseUrl": ".",
```

Change `"paths"` to use the subpath aliases (without `baseUrl`, paths are evaluated relative to `tsconfig.json` when `baseUrl` is absent, or you can rely entirely on the bundler/TypeScript resolving `#` imports automatically depending on TS version):

```json
"paths": {
  "#src/*": ["./src/*"],
  "#shared/*": ["./shared/*"],
  "@portfolio/shared": ["../packages/shared/src/index.ts"],
  "@portfolio/shared/*": ["../packages/shared/src/*"]
}
```

### 3. Refactor Import Statements

Search and replace across the frontend codebase to use the new native paths:
- Replace `import ... from "@/"` with `import ... from "#src/"`
- Replace `import ... from "@shared/"` with `import ... from "#shared/"`

### 4. Update Bundler Configurations (Vite)

If Vite is being used, you may need to update `vite.config.ts` to recognize the new aliases if it doesn't automatically inherit from `tsconfig.json` paths or `package.json` imports:
```typescript
resolve: {
  alias: {
    '#src': path.resolve(__dirname, './src'),
    '#shared': path.resolve(__dirname, './shared'),
  }
}
```

### 5. Final Verification
Run the type-check and build steps to ensure the application compiles error-free:
```bash
npx tsc --noEmit
npm run build
```
