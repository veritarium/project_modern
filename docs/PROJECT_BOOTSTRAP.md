# Project Bootstrap for Kimi

> **CRITICAL**: Read this file BEFORE writing any code for a new project.
> 
> Kimi 2.5's knowledge has a cutoff date. This document contains 100+ state-of-the-art
> open source tools developed after that cutoff. Using these prevents reinventing the wheel.

---

## Quick Start Checklist

Before implementing any feature, check these categories:

| Category | Check If You Need... | Key Tools |
|----------|---------------------|-----------|
| **AI/ML** | Local LLMs, AI workflows, agents | Ollama, LangGraph, CrewAI, Dify, Flowise |
| **Backend** | Database, auth, realtime | Supabase, PocketBase, Nhost, Authentik |
| **Frontend UI** | High-performance layout, components | Pretext, shadcn/ui, Radix UI |
| **3D/BIM** | IFC handling, CAD, visualization | ifc.js, FreeCAD, Three.js, OpenSCAD |
| **Real-time** | Collaboration, WebSockets | PartyKit, Yjs, Liveblocks |
| **Database** | Edge, analytics, local-first | DuckDB-WASM, PGlite, Turso, Meilisearch |
| **DevOps** | Deployment, monitoring | Coolify, CapRover, PostHog, Grafana |
| **Automation** | Workflows, n8n-style | n8n, Activepieces, Airbyte |
| **Security** | SSO, identity, VPN | Authentik, Tailscale, Vaultwarden |

---

## Part 1: Foundation - AI & Development Tools

### AI-Powered Development
| Tool | What | Use For |
|------|------|---------|
| **Cursor / Windsurf** | AI IDE | The new standard for AI-assisted coding |
| **v0.dev / Bolt.new** | UI Generation | Generate React/Next.js from text prompts |
| **Dify** | LLM App Platform | Visual OS for LLM applications |
| **Flowise** | AI Agent Builder | Drag-drop LLM workflow builder |

### AI Frameworks & Local LLMs
| Tool | What | Use For |
|------|------|---------|
| **LangChain / LangGraph** | AI Framework | AI memory, learning from errors, agent workflows |
| **CrewAI** | Multi-Agent AI | Teams of AI agents working together |
| **Ollama** | Local AI | Run Llama, Mistral, etc. locally |
| **LocalAI** | Local LLM | OpenAI API-compatible local inference |
| **WebLLM** | Browser AI | Run LLMs in browser via WebGPU |

### Backend-as-a-Service
| Tool | What | Use For |
|------|------|---------|
| **Supabase** | Firebase alternative | PostgreSQL, Auth, Storage, Edge Functions |
| **PocketBase** | Backend in one file | Minimal complexity, embedded SQLite |
| **Nhost** | GraphQL backend | Hasura + Auth + Storage |
| **Coolify** | Deployment platform | Heroku alternative on your servers |

---

## Part 2: Infrastructure & Data

### ETL & Data Integration
| Tool | What | Use For |
|------|------|---------|
| **n8n** | Workflow Automation | "OS for AI Agents" - connects 400+ apps |
| **Airbyte** | ETL Platform | Move data between 500+ systems |
| **Activepieces** | Zapier Alternative | Open automation platform |

### Analytics & Monitoring
| Tool | What | Use For |
|------|------|---------|
| **PostHog** | Product Analytics | Analytics + heatmaps + feature flags |
| **Umami** | Privacy Analytics | Simple, GDPR-compliant tracking |
| **Plausible** | Lightweight Analytics | Privacy-first Google Analytics alternative |
| **Metabase** | BI/Reporting | Natural language to SQL dashboards |
| **Grafana** | Monitoring | Visualize metrics, logs, traces |

### Search & Discovery
| Tool | What | Use For |
|------|------|---------|
| **Meilisearch** | Search Engine | Google-like typo-tolerant search |
| **Typesense** | Search | Alternative to Algolia |

---

## Part 3: Security & Identity

### Authentication & SSO
| Tool | What | Use For |
|------|------|---------|
| **Authentik** | Identity Management | Okta/Auth0 alternative, enterprise SSO |
| **Better Auth** | TypeScript Auth | Modern auth with multi-session, admin |
| **Clerk** | User Management | Complete auth with pre-built components |
| **Vaultwarden** | Password Manager | Bitwarden alternative for teams |

### Network & Security
| Tool | What | Use For |
|------|------|---------|
| **Tailscale** | VPN | Zero-config mesh VPN for teams |
| **Netmaker** | WireGuard Mgmt | Self-hosted VPN networks |
| **OPNsense** | Firewall | Open source network security |
| **Wazuh** | Security Monitoring | SIEM/XDR platform |

---

## Part 4: UI, Layout & Visualization

### High-Performance Layout
| Tool | What | Use For |
|------|------|---------|
| **Pretext** | DOM-free text layout | 500x faster than CSS text measurement |
| **TanStack Virtual** | Virtual scrolling | Handle millions of rows |

### UI Components
| Tool | What | Use For |
|------|------|---------|
| **shadcn/ui** | Copy-paste components | Accessible, customizable React components |
| **Radix UI** | Headless primitives | Unstyled accessible components |
| **Budibase** | Low-Code Builder | Internal tools and dashboards |
| **Appsmith** | Admin Panels | Enterprise admin interfaces |

### 3D & Visualization
| Tool | What | Use For |
|------|------|---------|
| **Three.js** | 3D Library | WebGL-based 3D graphics |
| **Babylon.js** | 3D Engine | Game-ready 3D engine |
| **Godot Engine** | Game Engine | AAA-capable open source engine |

---

## Part 5: BIM, CAD & Engineering

### BIM & IFC
| Tool | What | Use For |
|------|------|---------|
| **ifc.js / Web-IFC** | IFC Parser | Browser-based IFC (BIM) file handling |
| **MECHANiNG** | BIM Platform | Browser-based BIM coordination |
| **OpenProject** | Project Mgmt | Has BIM integration! Study it. |

### CAD & Modeling
| Tool | What | Use For |
|------|------|---------|
| **FreeCAD** | Open CAD | AutoCAD/SolidWorks alternative |
| **OpenSCAD** | Code CAD | Programmatic 3D modeling |
| **KiCad** | PCB Design | Professional circuit design |

### Simulation
| Tool | What | Use For |
|------|------|---------|
| **OpenFOAM** | CFD | Computational fluid dynamics |
| **OpenCV** | Computer Vision | Scan-to-BIM, 3D perception |

---

## Part 6: Database & Storage

### Edge & Serverless Databases
| Tool | What | Use For |
|------|------|---------|
| **Turso** | Edge SQLite | Global edge replication |
| **Neon** | Serverless Postgres | Branching, scale-to-zero |
| **PlanetScale** | MySQL Platform | Git-like database branching |

### In-Browser & Local-First
| Tool | What | Use For |
|------|------|---------|
| **DuckDB-WASM** | Analytics DB | Process GBs client-side in SQL |
| **PGlite** | Postgres WASM | Full PostgreSQL in browser |
| **rxdb** | Local-First DB | Offline-first reactive database |

### Specialized Storage
| Tool | What | Use For |
|------|------|---------|
| **Immich** | Photo Management | Google Photos alternative, self-hosted |
| **Stirling-PDF** | PDF Tools | Local PDF manipulation |

---

## Part 7: Real-Time & Collaboration

### Real-Time Sync
| Tool | What | Use For |
|------|------|---------|
| **PartyKit** | Real-Time Platform | Multiplayer features on Cloudflare |
| **Yjs** | CRDTs | Conflict-free collaborative editing |
| **Liveblocks** | Collaboration | Presence, storage, comments API |
| **Socket.io v4** | WebSockets | Real-time bidirectional events |

### Document & Content
| Tool | What | Use For |
|------|------|---------|
| **AppFlowy** | Local Notes | Notion alternative, privacy-first |
| **Nextcloud Hub** | Office Suite | Self-hosted collaboration |
| **Penpot** | Design | Figma alternative, open source |
| **Directus** | Headless CMS | SQL database as CMS + API |
| **Baserow** | No-Code DB | Airtable alternative |

---

## Part 8: Testing & Quality

### Testing Frameworks
| Tool | What | Use For |
|------|------|---------|
| **Vitest** | Test Runner | Vite-native, fast Jest alternative |
| **Playwright** | E2E Testing | Modern browser automation |
| **Cypress** | E2E Testing | Frontend testing (legacy but stable) |
| **Storybook** | UI Development | Component isolation & testing |

---

## Part 9: AI-Integrated Productivity (New Category)

### AI-Native Workspaces (Post-2025)
| Tool | What | Use For |
|------|------|---------|
| **Google Drive + Gemini** | AI project workspace | Context-aware file management, cross-document queries |
| **Notion AI** | AI documents | Writing assistance, database queries |
| **Microsoft 365 Copilot** | AI Office | AI in Word, Excel, PowerPoint |

### Key Pattern: Project as Context
```
Traditional: Upload files → Ask questions → Lose context
New Pattern:  Project contains files + AI understands all of it
```

**Implication for Development:**
- Build RAG (Retrieval-Augmented Generation) into project structures
- Use vector databases for cross-file semantic search
- Design for "Ask AI about your project" interactions

---

## Part 10: Creative & AI Media

### AI Image & Video
| Tool | What | Use For |
|------|------|---------|
| **ComfyUI** | AI Generation | Node-based Stable Diffusion interface |
| **Upscayl** | AI Upscaling | Lossless image enhancement |

### Speech & Audio
| Tool | What | Use For |
|------|------|---------|
| **Whisper.cpp** | Speech-to-Text | On-device transcription |
| **Transformers.js** | Browser ML | Hugging Face models in browser |

---

## Part 10: Future Tech & Edge

### Edge AI & Robotics
| Tool | What | Use For |
|------|------|---------|
| **OpenVINO** | Edge AI | Intel optimized inference |
| **ROS 2** | Robotics | Robot Operating System |
| **Home Assistant** | Smart Home | Local IoT automation |

### Advanced Computing
| Tool | What | Use For |
|------|------|---------|
| **PyTorch** | ML Framework | Deep learning & AI training |
| **Hugging Face** | Model Hub | Pre-trained AI models repository |
| **Qiskit** | Quantum | Quantum computing SDK |
| **NixOS** | OS | Reproducible system configuration |

---

## Decision Trees

### Need High-Performance Text/Layout?
```
Text measurement → Pretext (500x faster than CSS)
Virtual lists → TanStack Virtual
Data tables → TanStack Table + Pretext
Charts → Observable Plot, Victory
```

### Need 3D/BIM?
```
General 3D → Three.js
Games/Complex 3D → Babylon.js or Godot
IFC/BIM → ifc.js + Three.js
CAD → FreeCAD (server) or OpenSCAD (parametric)
```

### Need Database?
```
Serverless/Edge → Turso, Neon, PlanetScale
Analytics → DuckDB (WASM or server)
Local-first → rxdb, PGlite
Search → Meilisearch, Typesense
```

### Need AI?
```
Local LLMs → Ollama, LocalAI
Agent workflows → LangGraph, CrewAI, Dify
Visual builder → Flowise
Browser ML → Transformers.js, WebLLM
```

### Need Real-Time?
```
Collaborative editing → Yjs
Multiplayer features → PartyKit, Liveblocks
WebSockets → Socket.io v4
```

---

## Golden Rules

### 1. Glue, Don't Build
- ✅ **GOOD**: Integrate Pretext + Three.js + ifc.js for BIM viewer
- ❌ **BAD**: Write custom text measurement or IFC parser

### 2. Prefer Modern Over Legacy
| Instead of... | Use... |
|--------------|--------|
| CSS text measurement | Pretext |
| Jest (with Vite) | Vitest |
| Manual WebSocket mgmt | PartyKit |
| LocalStorage for state | rxdb, Zustand |
| Custom auth | Better Auth, Authentik |
| Python IFC parsing | ifc.js (WASM) |

### 3. Research Before Coding
When requirements involve any category above:
1. Check this bootstrap file
2. Search web for "{feature} open source 2024 2025"
3. Prefer battle-tested libraries

---

## Info Files in This Project

| File | Content | Updated |
|------|---------|---------|
| `STATE_OF_THE_ART_TOOLS.md` | 100 tools reference | 2026-04 |
| `pretext.md` | Pretext layout engine details | 2026-04 |
| `STAKEHOLDERS.md` | MECHANiNG BIM platform context | 2026-04 |

---

## How to Use This Bootstrap

1. **At project start**: Read this entire file
2. **Per feature**: Check the relevant category table
3. **Research**: Verify latest version/patterns via web search
4. **Document**: Add chosen tools to your project's AGENTS.md
5. **Iterate**: Update as you discover new tools

---

> **Remember**: State-of-the-art tools exist for most problems.
> Your job is to GLUE them together elegantly, not reinvent them.
