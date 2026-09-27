# expo-gaode-map — Tài liệu tiếng Việt

> Bộ AMap (Gaode Map) định hướng production cho ứng dụng Expo và React Native.

`expo-gaode-map` là hệ thư viện AMap xây dựng trên **Expo Modules API**, cung cấp một stack thống nhất cho bản đồ, định vị, lớp phủ, tìm kiếm POI, dẫn đường, bản đồ ngoại tuyến và Web API.

> Bản Việt hóa giữ nguyên tên package, API, class, method và những thuật ngữ kỹ thuật cần đối chiếu trực tiếp với mã nguồn.

## Chọn gói

| Nhu cầu | Gói |
| --- | --- |
| Bản đồ + định vị + lớp phủ + offline + tìm kiếm native | `expo-gaode-map` |
| Bản đồ + lập tuyến + UI dẫn đường | `expo-gaode-map-navigation` |
| Geocoding, POI, route bằng Web API | `expo-gaode-map-web-api` |

**Không cài đồng thời** `expo-gaode-map` và `expo-gaode-map-navigation`.

## Cài đặt

```bash
npm install expo-gaode-map
# hoặc nếu cần navigation
npm install expo-gaode-map-navigation
# tùy chọn
npm install expo-gaode-map-web-api
```

## Cấu hình Expo

```json
{
  "expo": {
    "plugins": [
      [
        "expo-gaode-map",
        {
          "androidKey": "your-android-key",
          "iosKey": "your-ios-key",
          "enableLocation": true,
          "locationDescription": "Ứng dụng cần quyền vị trí để cung cấp chức năng bản đồ."
        }
      ]
    ]
  }
}
```

```bash
npx expo prebuild --clean
npx expo run:android
npx expo run:ios
```

## Sử dụng cơ bản

```tsx
import { MapView } from 'expo-gaode-map';

export default function App() {
  return (
    <MapView
      style={{ flex: 1 }}
      initialCameraPosition={{
        target: { latitude: 10.8231, longitude: 106.6297 },
        zoom: 12,
      }}
      myLocationEnabled
    />
  );
}
```

## Quyền riêng tư

```ts
import { ExpoGaodeMapModule } from 'expo-gaode-map';

if (!ExpoGaodeMapModule.getPrivacyStatus().isReady) {
  ExpoGaodeMapModule.setPrivacyConfig({
    hasShow: true,
    hasContainsPrivacy: true,
    hasAgree: true,
  });
}
```

## GeoJSON Scene & runtime command

Lấy cảm hứng kiến trúc từ `helgasoft/amapro`, core hiện có thêm lớp scene thuần TypeScript:

- `GeoJSONLayer`: render Point/MultiPoint/LineString/MultiLineString/Polygon/MultiPolygon/GeometryCollection.
- `LayerGroup`: bật/tắt một nhóm overlay và giới hạn theo zoom.
- `MapCommandProxy`: queue lệnh camera/map trước khi MapView sẵn sàng rồi chạy tuần tự khi attach ref.
- `flattenGeoJSON()` và `collectGeoJSONPositions()`: chuẩn hóa dữ liệu GIS trước khi đi xuống native engine.
- `loadGeoJSON()`: tải GeoJSON từ URL với fetcher tùy biến cho proxy/cache/offline gateway.
- `playCameraTimeline()`: camera flyover theo chuỗi keyframe, lấy ý tưởng từ Loca view animation nhưng chạy qua MapView native.

Xem [GeoJSON Scene & Map Command Proxy](./website/docs/vi/guide/geojson-scene.md).

## Tài liệu tiếng Việt

- [Tổng quan](./website/docs/vi/overview.md)
- [Chọn thư viện AMap](./website/docs/vi/guide/choosing-amap-library.md)
- [Bắt đầu nhanh](./website/docs/vi/guide/getting-started.md)
- [Tổng quan API](./website/docs/vi/api/index.md)
- [Ví dụ](./website/docs/vi/examples/index.md)

## Nguồn dự án

Liên kết upstream và tác giả gốc được giữ nguyên. Bản Việt hóa không thay đổi tên package hay quyền tác giả.

Giấy phép: MIT.
