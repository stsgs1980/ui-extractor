# UI Extractor

Extract UI components, styles, design tokens, and patterns from any website. Generate production-ready component code (HTML/React/Vue) and integrate with AI agents via MCP.

## Features

- **Extract** — DOM, CSS variables, computed styles, images, screenshots (full page, viewport, mobile, sections, components)
- **Analyze** — Pattern detection, design system extraction (colors, spacing, radius, fonts), component classification
- **Spec** — Generate component specifications (props, states, accessibility, responsive breakpoints)
- **Generate** — Output HTML, React, or Vue components with CSS/SCSS/Tailwind
- **Pipeline** — Full extract → analyze → spec → generate in one command
- **Learn** — Save any site as a reference for future regeneration
- **MCP Server** — Integrate with Cursor, Claude, Windsurf, VS Code

## Installation

```bash
# Clone and install
git clone https://github.com/stsgs1980/ui-extractor.git
cd ui-extractor
pnpm install

# Build all packages
pnpm build
```

## Quick Start

### CLI

```bash
# Full pipeline: extract + analyze + spec + generate
pnpm --filter @ui-extractor/cli start pipeline https://ui.shadcn.com --component button

# Extract only
pnpm --filter @ui-extractor/cli start extract https://ui.shadcn.com --screenshot

# Analyze only
pnpm --filter @ui-extractor/cli start analyze https://ui.shadcn.com

# Generate from URL
pnpm --filter @ui-extractor/cli start generate https://ui.shadcn.com --component button --format react

# Learn a site for later use
pnpm --filter @ui-extractor/cli start learn https://ui.shadcn.com --save shadcn-ui

# List saved references
pnpm --filter @ui-extractor/cli start references

# Generate from saved reference
pnpm --filter @ui-extractor/cli start generate-ref shadcn-ui --format vue

# Screenshots
pnpm --filter @ui-extractor/cli start screenshot https://ui.shadcn.com --types full,viewport,sections,components

# Compare two sites
pnpm --filter @ui-extractor/cli start compare https://ui.shadcn.com https://vercel.com
```

### MCP Server

Add to your MCP config (Cursor, Claude Desktop, Windsurf):

```json
{
  "mcpServers": {
    "ui-extractor": {
      "command": "node",
      "args": ["packages/mcp/src/server.js"],
      "cwd": "/path/to/ui-extractor"
    }
  }
}
```

Available tools:
- `uix_extract` — Extract UI data from URL
- `uix_analyze` — Analyze patterns and design system
- `uix_spec` — Generate component specification
- `uix_generate` — Generate component code
- `uix_pipeline` — Full pipeline
- `uix_learn` — Learn and save reference
- `uix_references` — List references
- `uix_generate_from_reference` — Generate from saved reference
- `uix_compare` — Compare two URLs

Example usage in Cursor:
```
@ui-extractor uix_pipeline https://ui.shadcn.com --component button --format react
```

## Documentation

- [Agent Workflow](docs/agent-workflow.md) — How to write UI components with AI agents
- [Teardown Method](docs/teardown-method.md) — Step-by-step UI reverse engineering
- [Teardown Cheatsheet](docs/teardown-cheatsheet.md) — Quick reference for 5-step process

## Architecture

```
packages/
├── core/           # Core library (extract, analyze, spec, generate, pipeline, learn)
├── cli/            # Command-line interface
└── mcp/            # MCP server for AI agent integration
```

### Core Modules

| Module | Description |
|--------|-------------|
| `extract.js` | Playwright-based extraction with long screenshots |
| `analyze.js` | Pattern detection, design system extraction, component classification |
| `spec.js` | Component specification generator (props, states, a11y, responsive) |
| `generate.js` | Multi-format code generator (HTML, React, Vue) |
| `pipeline.js` | Full pipeline + learn/catalog system |
| `index.js` | Unified exports |

## Supported Sites

| Site | Auth Required | Status |
|------|---------------|--------|
| shadcn/ui | No | ✅ Full support |
| Vercel | No | ✅ Full support |
| Ant Design | No | ✅ Full support |
| Linear | No | ✅ Full support |
| Pinterest (public boards) | No | ✅ Full support |
| Pinterest (pins) | Yes | ⚠️ Login wall |
| Instagram | Yes | ⚠️ Login wall |

For authenticated sites, use the `auth-browser` script to save session cookies.

## Output Formats

### HTML
```html
<!-- button.html -->
<button class="btn btn-primary">Click me</button>
<style>
.btn { /* CSS variables from source */ }
</style>
```

### React
```tsx
// Button.tsx
export function Button({ variant = "primary", children, ...props }) {
  return <button className={`btn btn-${variant}`} {...props}>{children}</button>;
}
```

### Vue
```vue
<!-- Button.vue -->
<template>
  <button :class="['btn', `btn-${variant}`]"><slot /></button>
</template>
<script setup>
defineProps({ variant: { type: String, default: 'primary' } });
</script>
```

## Configuration

### Screenshot Types
- `full` — Full page screenshot
- `viewport` — Viewport only
- `mobile` — Mobile viewport (375px)
- `sections` — Per-section screenshots
- `components` — Per-component screenshots

```bash
pnpm --filter @ui-extractor/cli start extract https://example.com --screenshot --screenshot-types full,viewport,sections,components
```

## Development

```bash
# Run tests
pnpm test

# Lint
pnpm eslint .

# Type check (if TypeScript)
pnpm typecheck
```

## License

MIT