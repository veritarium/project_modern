# ifc.js (Web-IFC)

> High-performance IFC (Industry Foundation Classes) parser for JavaScript  
> WebAssembly-based, runs in browser and Node.js

## Quick Facts

| Attribute | Value |
|-----------|-------|
| **Category** | bim-cad |
| **Organization** | IFC.js (formerly IFC.js, now part of That Open Company) |
| **Language** | C++ (WASM) + TypeScript |
| **License** | MPL-2.0 |
| **GitHub** | https://github.com/IFCjs/web-ifc |
| **NPM** | `web-ifc` |

## What It Is

ifc.js is a WebAssembly port of IFC parsing capabilities, allowing browser-based BIM applications to read and write IFC files (IFC2x3 and IFC4) without server processing.

### Architecture

```
IFC File → Web-IFC (WASM) → Geometry + Properties → Three.js/Babylon.js → Render
```

## Why Use It

### Compared to Alternatives

| Solution | Pros | Cons |
|----------|------|------|
| **ifc.js** | Browser-native, fast, open source | WASM download (~1MB) |
| **ifcopenshell** | Mature, Python bindings | Requires server, heavy |
| **Autodesk Forge** | Enterprise support | Proprietary, expensive |
| **SimpleBIM** | GUI tools | Desktop only, paid |

### Key Benefits

1. **Zero Server**: Process IFC files client-side
2. **Fast**: WASM performance near native C++
3. **Open**: Full control over parsing pipeline
4. **Compatible**: IFC2x3 and IFC4 support

## When to Use

### ✅ Perfect For

- Browser-based BIM viewers
- IFC file validation web apps
- Model comparison tools
- Property extraction utilities
- Web-based coordination platforms

### ❌ Not For

- Heavy geometry processing (use server-side)
- IFC authoring (limited creation API)
- Complex MEP systems (some entities not supported)

## Installation

```bash
npm install web-ifc three  # Three.js for rendering
```

## Basic Usage

```typescript
import { IfcAPI } from 'web-ifc'

const ifcApi = new IfcAPI()

// Initialize (load WASM)
await ifcApi.Init()

// Load IFC file
const response = await fetch('/model.ifc')
const ifcData = await response.arrayBuffer()
const modelID = ifcApi.OpenModel(new Uint8Array(ifcData))

// Get all elements of a type
const walls = ifcApi.GetLineIDsWithType(modelID, IFCPROJECT) // or IFCWALL, etc.

// Get properties
for (let i = 0; i < walls.size(); i++) {
  const wallID = walls.get(i)
  const wall = ifcApi.GetLine(modelID, wallID)
  console.log(wall.Name?.value)
}

// Cleanup
ifcApi.CloseModel(modelID)
```

## Geometry Extraction

```typescript
import { IfcAPI } from 'web-ifc'
import * as THREE from 'three'

async function loadIFCGeometry(url: string) {
  const ifcApi = new IfcAPI()
  await ifcApi.Init()
  
  const response = await fetch(url)
  const ifcData = await response.arrayBuffer()
  const modelID = ifcApi.OpenModel(new Uint8Array(ifcData))
  
  // Get all geometry
  const meshes = ifcApi.LoadAllGeometry(modelID)
  
  const scene = new THREE.Scene()
  
  for (let i = 0; i < meshes.size(); i++) {
    const mesh = meshes.get(i)
    const geometry = ifcApi.GetGeometry(modelID, mesh.geometryExpressID)
    const verts = ifcApi.GetVertexArray(geometry.GetVertexData(), geometry.GetVertexDataSize())
    const indices = ifcApi.GetIndexArray(geometry.GetIndexData(), geometry.GetIndexDataSize())
    
    // Create Three.js mesh
    const threeGeo = new THREE.BufferGeometry()
    threeGeo.setAttribute('position', new THREE.BufferAttribute(verts, 3))
    threeGeo.setIndex(new THREE.BufferAttribute(indices, 1))
    
    const material = new THREE.MeshStandardMaterial({ color: 0xcccccc })
    const threeMesh = new THREE.Mesh(threeGeo, material)
    scene.add(threeMesh)
  }
  
  return scene
}
```

## MECHANiNG Integration

```typescript
// Example: BIM element with properties
export class BIMElement {
  constructor(
    public id: number,
    public type: string,
    public geometry: THREE.BufferGeometry,
    public properties: Record<string, any>
  ) {}
}

export class IFCViewer {
  private ifcApi = new IfcAPI()
  private elements: Map<number, BIMElement> = new Map()
  
  async loadModel(url: string) {
    await this.ifcApi.Init()
    
    const response = await fetch(url)
    const data = await response.arrayBuffer()
    const modelID = this.ifcApi.OpenModel(new Uint8Array(data))
    
    // Extract elements with properties
    const allElements = this.ifcApi.GetAllLines(modelID)
    
    for (let i = 0; i < allElements.size(); i++) {
      const expressID = allElements.get(i)
      const element = await this.parseElement(modelID, expressID)
      if (element) this.elements.set(expressID, element)
    }
  }
  
  private async parseElement(modelID: number, expressID: number): Promise<BIMElement | null> {
    const line = this.ifcApi.GetLine(modelID, expressID)
    
    // Get properties
    const psets = await this.ifcApi.GetPropertySets(modelID, expressID)
    const properties = this.extractProperties(psets)
    
    // Get geometry if available
    let geometry: THREE.BufferGeometry | undefined
    try {
      const placedGeometry = this.ifcApi.GetPlacements(modelID, expressID)
      // ... geometry extraction
    } catch (e) {
      // No geometry for this element
    }
    
    return new BIMElement(expressID, line.constructor.name, geometry!, properties)
  }
}
```

## Resources

- **Documentation**: https://ifcjs.github.io/info/
- **Examples**: https://github.com/IFCjs/examples
- **Playground**: https://ifcjs.github.io/web-ifc-playground/
- **Discord**: https://discord.gg/g7UV47hS

## See Also

- `three-ifc-viewer` - Higher-level Three.js integration
- `@thatopen/components` - That Open Company's component library
- `bim-fragment` - Optimized geometry format for BIM

---

*Last verified: 2026-04-03*
