# MECHANiNG Pretext UI Architecture

## Overview
Web UI using Cheng Lou's **Pretext** layout engine - replicates VS Code interface with maximum performance.

## Core Technology
- **Pretext**: DOM-free text measurement (500x faster than CSS)
- **Dual-phase logic**: `prepare()` (once) → `layout()` (hot path)
- **Icon Fonts**: Material Icons as text glyphs (not SVGs)

## Icon-Font Architecture

### Font Loading
```html
<!-- Google Material Icons -->
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

<!-- Or: Font Awesome -->
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
```

### Icon as Text Glyph
```typescript
// Icons are text characters in the icon font
const icons = {
  explorer: '\ue5c3',    // Material: folder
  search: '\ue8b6',      // Material: search
  git: '\ue86a',         // Material: source
  debug: '\ue868',       // Material: bug_report
  extensions: '\ue5d3',  // Material: extension
}

// Render with Pretext - measured as text
<Pretext family="material-icons" size={24}>
  {getIcon('explorer')}
</Pretext>
```

### Benefits
1. **No SVG overhead** - icons are text glyphs
2. **Pretext measurement** - sub-millisecond layout
3. **120 FPS animations** - no DOM thrashing
4. **Vector crispness** - font-based scaling

## Pretext Dual-Phase System

### Phase 1: Prepare (One-time)
```typescript
// Prepare text + icon font combination
const prepared = prepare('File.txt 📄', '14px "Material Icons", sans')
```

### Phase 2: Layout (Hot path)
```typescript
// Pure arithmetic - no DOM measurement
const { height, lineCount } = layout(prepared, maxWidth, lineHeight)
```

## VS Code Layout Components

### Activity Bar
- Icons: Material Icons (24px)
- Width: 48px fixed
- Active indicator: 2px orange bar (#f78166)

### Sidebar (Explorer)
- Tree: File icons as glyphs
- Chevron: Material expand/collapse
- Dynamic height via Pretext measurement

### Editor Tabs
- Tab height: 35px
- Icons: File type icons from Material
- Close button: Material 'close'

### Status Bar
- Height: 22px
- Icons: Branch, error, warning glyphs
- Text: Pretext measured status labels

## Performance Targets
- **Prepare**: ~19ms for 500 items
- **Layout**: ~0.09ms for 500 items
- **Total**: 120 FPS text animations
- **No layout thrashing**: Zero DOM measurements in hot path

## Implementation
See: `lib/pretext/` for the icon font + Pretext integration
