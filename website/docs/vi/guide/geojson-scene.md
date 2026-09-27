---
title: GeoJSON Scene & Map Command Proxy
description: Render GeoJSON trực tiếp, nhóm lớp và điều khiển MapView theo mô hình command/proxy trong expo-gaode-map.
---

# GeoJSON Scene & Map Command Proxy

Bản cập nhật này lấy **ý tưởng kiến trúc** từ [helgasoft/amapro](https://github.com/helgasoft/amapro): wrapper mỏng, dữ liệu độc lập với engine và tách việc **khai báo đối tượng** khỏi **gửi lệnh runtime**.

Không mang R/htmlwidgets hoặc mã nguồn amapro vào core. Thay vào đó, expo-gaode-map triển khai lại các pattern phù hợp Expo / React Native bằng TypeScript.

## GeoJSONLayer

`GeoJSONLayer` nhận trực tiếp GeoJSON và chuyển sang overlay native:

| GeoJSON | Overlay |
| --- | --- |
| Point / MultiPoint | Marker |
| LineString / MultiLineString | Polyline |
| Polygon / MultiPolygon | Polygon |
| GeometryCollection | Tự tách thành geometry con |

```tsx
import { GeoJSONLayer, MapView } from 'expo-gaode-map';

<MapView style={{ flex: 1 }}>
  <GeoJSONLayer
    data={data}
    style={(feature) => ({
      marker: {
        pinColor: feature.properties?.kind === 'poi' ? 'blue' : 'red',
      },
    })}
  />
</MapView>
```

GeoJSON giữ đúng quy ước `[longitude, latitude]`.

## LayerGroup

```tsx
<LayerGroup visible={showLand} zoom={zoom} minZoom={10}>
  <GeoJSONLayer data={parcels} />
  <GeoJSONLayer data={labels} />
</LayerGroup>
```

Đây là lớp group ở React level nên có thể bao Marker, Polyline, Polygon, HeatMap hoặc GeoJSONLayer mà không buộc chúng dùng chung một native implementation.

## MapCommandProxy

Lệnh camera có thể phát sinh trước khi native MapView sẵn sàng. `MapCommandProxy` queue lệnh và chạy tuần tự sau `attach(ref)`.

```tsx
const proxy = createMapCommandProxy();

void proxy.setZoom(15, true);
void proxy.setCenter([106.7009, 10.7769], true);

// Sau khi MapView mount:
proxy.attach(mapRef);
```

Hỗ trợ `moveCamera`, `setCenter`, `setZoom`, `fitToCoordinates`, `getCameraPosition`, `getLatLng`, `takeSnapshot`.

## Utility GeoJSON

```ts
const parts = flattenGeoJSON(data);
const points = collectGeoJSONPositions(data);

await proxy.fitToCoordinates(points, {
  paddingPx: 64,
  minZoom: 10,
  maxZoom: 17,
});
```

## GeoJSONSource từ URL

Tương tự ý tưởng `GeoJSONSource` của amapro/Loca, core có loader thuần TypeScript:

```ts
import { loadGeoJSON } from 'expo-gaode-map';

const data = await loadGeoJSON(
  'https://example.com/data.geojson',
  {
    headers: {
      Authorization: 'Bearer ...',
    },
  }
);
```

`loadGeoJSON()` kiểm tra HTTP status và xác nhận payload thuộc một trong các họ GeoJSON mà `GeoJSONLayer` hỗ trợ. Có thể truyền `fetcher` riêng để dùng proxy/cache/offline gateway.

## Camera flyover timeline

Ý tưởng `viewControl.addAnimates` được chuyển thành timeline độc lập với engine:

```ts
import {
  createMapCommandProxy,
  playCameraTimeline,
} from 'expo-gaode-map';

const proxy = createMapCommandProxy();

await playCameraTimeline(proxy, [
  {
    camera: {
      target: { latitude: 10.7769, longitude: 106.7009 },
      zoom: 12,
      tilt: 20,
    },
    duration: 700,
  },
  {
    camera: {
      target: { latitude: 10.7828, longitude: 106.7116 },
      zoom: 15,
      tilt: 50,
      bearing: 35,
    },
    duration: 900,
  },
]);
```

Có thể dùng `CameraTimelineController` để dừng các keyframe tiếp theo. Animation native đang chạy không bị cắt giữa chừng vì `MapView` hiện chưa có API cancel camera animation.

## Roadmap lấy từ bài học amapro

amapro còn minh họa TileLayer, WMS/WMTS, ImageLayer, MassMarks, CanvasLayer và Loca 3D như PolygonLayer, ScatterLayer, PulseLinkLayer. Với gaode-map, các phần này sẽ đi theo adapter riêng thay vì nhồi vào native core:

1. **External Tile Adapter** — XYZ/WMTS/Image overlay.
2. **Scene Source Adapter** — GeoJSON URL, WMS, PMTiles/MVT.
3. **Web/Loca Engine Adapter** — chỉ dùng khi runtime là AMap JS/Loca.
4. **3D Scene Protocol** — polygon extrusion, animated link/flow, scatter/pulse, camera flyover.

## Ví dụ

Mở **“GeoJSON Scene & Command Proxy”** trong example app để thử FeatureCollection, style theo properties, bật/tắt nhóm layer, click feature, fit toàn bộ GeoJSON và camera flyover.

## Nguồn tham khảo

amapro dùng Apache-2.0. Bản cập nhật này tham khảo pattern kiến trúc init/item/command/proxy; phần TypeScript trong gaode-map là implementation riêng cho Expo/React Native.
