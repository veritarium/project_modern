# Project Modern - VS Code Extension

Evaluate and discover open source packages directly in your editor.

## Features

### 🔍 Hover Information
Hover over any dependency in `package.json` to see its Project Modern score:

![Hover Demo](https://via.placeholder.com/600x300/1e293b/3b82f6?text=Hover+over+dependencies+to+see+scores)

- Composite score (0-10)
- Breakdown: Security, Maintenance, Popularity, Ecosystem
- GitHub stars and dependents
- Recommendation

### ⚠️ Diagnostics
Get warnings for low-scoring dependencies:

![Diagnostics Demo](https://via.placeholder.com/600x200/1e293b/ef4444?text=Warnings+for+low+scoring+packages)

- Red underline for packages scoring below threshold
- Hover for detailed explanation
- Configurable minimum score

### 📦 Sidebar Explorer
View all dependencies with scores in the sidebar:

![Sidebar Demo](https://via.placeholder.com/300x400/1e293b/22c55e?text=Package+explorer+with+scores)

- Sorted by score
- Color-coded icons
- Expand for details

### 🎯 Commands

| Command | Description |
|---------|-------------|
| `Project Modern: Search Package` | Evaluate any package |
| `Project Modern: Evaluate Project` | Audit all dependencies |
| `Project Modern: Compare Packages` | Side-by-side comparison |
| `Project Modern: Refresh` | Refresh evaluations |

## Requirements

- VS Code 1.80+
- Project Modern API running (or use mock data)

## Installation

### From Source

```bash
cd extensions/vscode
npm install
npm run compile
```

Then press F5 to open a new VS Code window with the extension loaded.

### From VSIX

```bash
npm run package
code --install-extension project-modern-0.1.0.vsix
```

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `projectModern.apiUrl` | `http://localhost:3000` | API endpoint |
| `projectModern.showDiagnostics` | `true` | Show warnings for low scores |
| `projectModern.minimumScore` | `6.0` | Minimum acceptable score |
| `projectModern.cacheEnabled` | `true` | Enable result caching |

## Usage

### Evaluate a Package

1. Open the command palette (`Ctrl+Shift+P`)
2. Type "Project Modern: Search Package"
3. Enter package name
4. View the detailed evaluation

### Audit Your Project

1. Open a project with `package.json`
2. Run "Project Modern: Evaluate Project"
3. See the summary with top and bottom packages

### Compare Packages

1. Run "Project Modern: Compare Packages"
2. Enter comma-separated package names
3. See side-by-side comparison table

## Data Sources

This extension integrates with:

- **OpenSSF Scorecard** - Security scoring (18 automated checks)
- **Libraries.io** - Package metadata and maintenance data
- **GitHub API** - Stars, forks, and activity metrics

Combined with our proprietary scoring algorithm.

## Development

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes
npm run watch

# Run tests
npm test

# Package extension
npm run package
```

## Architecture

```
src/
├── extension.ts          # Main entry point
├── api.ts               # API client
├── commands.ts          # Command implementations
└── providers/
    ├── hoverProvider.ts # Hover information
    ├── diagnostics.ts   # Warning diagnostics
    └── treeProvider.ts  # Sidebar explorer
```

## License

MIT
