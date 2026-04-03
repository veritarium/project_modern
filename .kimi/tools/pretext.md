# Pretext

> DOM-free text measurement and layout engine by Cheng Lou  
> 500x faster than CSS text measurement, enables 120 FPS text animations

## Quick Facts

| Attribute | Value |
|-----------|-------|
| **Category** | ui-layout |
| **Author** | Cheng Lou (creator of ReasonML, React contributor) |
| **Language** | TypeScript |
| **License** | MIT |
| **GitHub** | https://github.com/chenglou/pretext |
| **NPM** | `pretext` |

## What It Is

Pretext is a text measurement and layout engine that operates entirely without the DOM. Instead of forcing the browser to calculate text dimensions (which causes layout thrashing), Pretext uses its own layout algorithm based on font metrics.

### The Dual-Phase System

```typescript
import { prepare, layout } from 'pretext'

// Phase 1: Prepare (one-time per text string)
// This measures the text and creates a layout plan
const prepared = prepare('Hello World 📄', '14px "Inter", sans-serif')

// Phase 2: Layout (hot path)
// Pure arithmetic - no DOM access
const { width, height, lineCount, lines } = layout(prepared, maxWidth, lineHeight)
```

## Why Use It

### Performance Comparison

| Operation | CSS/DOM | Pretext | Speedup |
|-----------|---------|---------|---------|
| Measure 500 items | ~350ms | ~19ms | 18x |
| Layout 500 items | ~45ms | ~0.09ms | 500x |
| Animation frame | 30-60 FPS | 120 FPS | 2-4x |

### Key Benefits

1. **No Layout Thrashing**: Zero DOM measurements in hot path
2. **Deterministic**: Same input always produces same output
3. **Framework Agnostic**: Works with React, Vue, Svelte, vanilla JS
4. **Small**: ~5KB gzipped

## When to Use

### ✅ Perfect For

- Code editors (line numbers, syntax highlighting)
- Terminals (monospace layout)
- Data grids (thousands of cells)
- Chat applications (dynamic heights)
- PDF generation (consistent layout)
- Canvas/WebGL text rendering

### ❌ Not For

- Simple static pages (overkill)
- SEO-critical content (use semantic HTML)
- When you need native text selection (implement separately)

## Installation

```bash
npm install pretext
```

## Basic Usage

```typescript
import { prepare, layout } from 'pretext'

// Prepare text with font specification
const text = prepare('Hello World', {
  family: 'Inter, sans-serif',
  size: 16,
  weight: '400',
  lineHeight: 1.5
})

// Get layout for a container
const result = layout(text, {
  width: 300,        // Container width
  lineHeight: 24     // Line height in pixels
})

console.log(result.height)      // Total height needed
console.log(result.lineCount)   // Number of lines
console.log(result.lines)       // Array of line info
```

## Advanced: Icon Fonts

Pretext shines with icon fonts (Material Icons, Font Awesome):

```typescript
// Icons are just text glyphs - no SVG overhead
const icon = '\ue5c3'  // Material folder icon

const prepared = prepare(icon, '24px "Material Icons"')
const { width } = layout(prepared, Infinity, 24)

// Render with your renderer (Canvas, WebGL, etc.)
```

## Integration Examples

### With React

```tsx
import { useMemo } from 'react'
import { prepare, layout } from 'pretext'

function MeasuredText({ text, maxWidth }: { text: string; maxWidth: number }) {
  const dimensions = useMemo(() => {
    const prepared = prepare(text, '16px Inter')
    return layout(prepared, maxWidth, 24)
  }, [text, maxWidth])

  return (
    <div style={{ height: dimensions.height }}>
      {text}
    </div>
  )
}
```

### With Canvas

```typescript
import { prepare, layout } from 'pretext'

function renderToCanvas(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
  const prepared = prepare(text, '16px Inter')
  const result = layout(prepared, 300, 24)
  
  // Draw each line at calculated positions
  result.lines.forEach((line, i) => {
    ctx.fillText(line.text, x, y + i * 24)
  })
}
```

### With Three.js/WebGL

```typescript
// Create text texture using Pretext dimensions
function createTextTexture(text: string) {
  const prepared = prepare(text, '32px Inter')
  const { width, height } = layout(prepared, 512, 40)
  
  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(width)
  canvas.height = Math.ceil(height)
  
  const ctx = canvas.getContext('2d')!
  ctx.font = '32px Inter'
  ctx.fillText(text, 0, 32)
  
  return new THREE.CanvasTexture(canvas)
}
```

## VS Code-Style Layout Example

```typescript
import { prepare, layout } from 'pretext'

// Activity Bar icons
const activityIcons = {
  explorer: '\ue5c3',
  search: '\ue8b6',
  git: '\ue86a',
  debug: '\ue868',
  extensions: '\ue5d3'
}

// Measure all icons (one-time)
const preparedIcons = Object.entries(activityIcons).map(([name, icon]) => ({
  name,
  prepared: prepare(icon, '24px "Material Icons"')
}))

// Layout loop (120 FPS capable)
function renderActivityBar() {
  let y = 0
  for (const { name, prepared } of preparedIcons) {
    const { height } = layout(prepared, 48, 48)  // 48px width
    renderIcon(prepared, 12, y + 12)  // Centered
    y += 48
  }
}
```

## Resources

- **GitHub**: https://github.com/chenglou/pretext
- **Examples**: Check repo for more patterns
- **Related**: Cheng Lou's talks on layout engines

## See Also

- `webgl-text` - For rendering Pretext layouts in WebGL
- `react-window` / `@tanstack/react-virtual` - For virtual scrolling
- `metrics` - Font metrics extraction

---

*Last verified: 2026-04-03*
