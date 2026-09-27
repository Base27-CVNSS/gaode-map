---
title: Ví dụ expo-gaode-map
description: Các ví dụ thực tế cho bản đồ, định vị, lớp phủ, tìm kiếm và điều khiển MapView.
---

# Ví dụ

Các ví dụ dưới đây tập trung vào mẫu tích hợp thường dùng. Với ứng dụng hoàn chỉnh, xem `example/` và `example-navigation/`.

## Bản đồ cơ bản

```tsx
import { MapView } from 'expo-gaode-map';

export default function MapScreen() {
  return (
    <MapView
      style={{ flex: 1 }}
      initialCameraPosition={{
        target: { latitude: 10.8231, longitude: 106.6297 },
        zoom: 12,
      }}
    />
  );
}
```

## Marker

```tsx
import { MapView, Marker } from 'expo-gaode-map';

<MapView style={{ flex: 1 }}>
  <Marker
    position={{ latitude: 10.8231, longitude: 106.6297 }}
    title="Điểm mẫu"
  />
</MapView>
```

## Theo dõi vị trí

```tsx
import { useEffect } from 'react';
import { ExpoGaodeMapModule } from 'expo-gaode-map';

export function useLocationTracking() {
  useEffect(() => {
    ExpoGaodeMapModule.start();

    const sub = ExpoGaodeMapModule.addLocationListener(
      'onLocationUpdate',
      location => console.log(location)
    );

    return () => {
      sub.remove();
      ExpoGaodeMapModule.stop();
    };
  }, []);
}
```

## Điều khiển MapView bằng ref

```tsx
import { useRef } from 'react';
import { Button } from 'react-native';
import { MapView, type MapViewRef } from 'expo-gaode-map';

export default function ControlledMap() {
  const mapRef = useRef<MapViewRef>(null);

  return (
    <>
      <MapView ref={mapRef} style={{ flex: 1 }} />
      <Button
        title="Phóng to"
        onPress={() => mapRef.current?.setZoom(15, true)}
      />
    </>
  );
}
```

## Tìm POI quanh vị trí

```tsx
import { searchNearby } from 'expo-gaode-map';

const result = await searchNearby({
  center: { latitude: 10.8231, longitude: 106.6297 },
  keyword: 'cafe',
  radius: 1500,
});
```

## Xem thêm

- [Bản đồ cơ bản — English](/en/examples/basic-map)
- [Theo dõi vị trí — English](/en/examples/location-tracking)
- [Hình học — English](/en/examples/geometry)
- [Lớp phủ — English](/en/examples/overlays)
- [Tìm kiếm — English](/en/examples/search)
- [Tổng quan API tiếng Việt](/vi/api/)
