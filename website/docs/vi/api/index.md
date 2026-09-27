---
title: Tài liệu API expo-gaode-map
description: Chỉ mục API tiếng Việt cho MapView, định vị, lớp phủ, tìm kiếm, dẫn đường, offline và Web API.
---

# Tổng quan API

## Trước khi gọi API

1. Cấu hình key native đúng nền tảng.
2. Hoàn tất privacy consent trước lần sử dụng SDK đầu tiên.
3. Yêu cầu quyền runtime khi cần vị trí.
4. Không cài đồng thời `expo-gaode-map` và `expo-gaode-map-navigation`.

## API cốt lõi

- [MapView — English](/en/api/mapview)
- [Component & Hooks — English](/en/api/components)
- [Định vị — English](/en/api/location)
- [Hình học — English](/en/api/geometry)
- [Lớp phủ — English](/en/api/overlays)
- [Kiểu dữ liệu — English](/en/api/types)

## Scene & GeoJSON

- `GeoJSONLayer` — render GeoJSON bằng overlay native.
- `LayerGroup` — nhóm và bật/tắt lớp logic.
- `MapCommandProxy` — queue lệnh trước khi MapView sẵn sàng.
- `loadGeoJSON` — nạp GeoJSON từ URL/fetcher tùy biến.
- `playCameraTimeline` — flyover theo camera keyframe.

[Xem hướng dẫn GeoJSON Scene & Proxy](/vi/guide/geojson-scene)

## API mở rộng

- [Tìm kiếm — English](/en/api/search)
- [Dẫn đường — English](/en/api/navigation)
- [Bản đồ ngoại tuyến — English](/en/api/offline-map)
- [Web API — English](/en/api/web-api)

## MapView tối thiểu

```tsx
import { MapView } from 'expo-gaode-map';

<MapView
  style={{ flex: 1 }}
  initialCameraPosition={{
    target: { latitude: 10.8231, longitude: 106.6297 },
    zoom: 12,
  }}
  myLocationEnabled
/>
```

## Định vị

```tsx
import { ExpoGaodeMapModule } from 'expo-gaode-map';

const permission = await ExpoGaodeMapModule.requestLocationPermission();

if (permission.granted) {
  const location = await ExpoGaodeMapModule.getCurrentLocation();
  console.log(location);
}
```

## Tìm kiếm

```tsx
import { searchPOI, searchNearby } from 'expo-gaode-map';

const poi = await searchPOI({
  keyword: 'cafe',
  city: 'Ho Chi Minh City',
});

const nearby = await searchNearby({
  center: { latitude: 10.8231, longitude: 106.6297 },
  keyword: 'restaurant',
  radius: 2000,
});
```

## Tài liệu liên quan

- [Bắt đầu nhanh](/vi/guide/getting-started)
- [Ví dụ](/vi/examples/)
