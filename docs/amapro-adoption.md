# amapro → gaode-map: adoption notes

Reference: https://github.com/helgasoft/amapro

## Core idea

amapro keeps its API intentionally small while forwarding data, layers and runtime commands to AMap JS / Loca. expo-gaode-map is a native Android/iOS Expo Module, so the useful part to adopt is the architecture—not the browser dispatcher.

## Adopted now

| amapro pattern | gaode-map implementation |
| --- | --- |
| item / GeoJSON input | `GeoJSONLayer` + `flattenGeoJSON` |
| overlay grouping | `LayerGroup` |
| proxy runtime commands | `MapCommandProxy` |
| bounds from layer data | `collectGeoJSONPositions` + `fitToCoordinates` |
| thin public wrapper | scene API re-exported from core index |

## Deliberately not copied

- R/htmlwidgets/Shiny runtime
- dynamic JavaScript `eval` execution
- browser CanvasLayer
- Loca WebGL classes inside native core
- AMap JS plugin loader

## Next phases

### External tiles
URL tile template, WMTS adapter, image overlay, zoom range, opacity and explicit CRS metadata.

### Scene sources
GeoJSON inline/URL, XYZ/WMTS, WMS raster, PMTiles/MVT and offline package sources.

### 3D protocol
Define engine-neutral extruded polygons, animated links, scatter/pulse points and camera flyover timelines, then map them to AMap JS/Loca or native engines.

## License / provenance

amapro is Apache-2.0. This adoption uses public architectural ideas and API concepts. The TypeScript implementation added to gaode-map is independently written.
