---
title: Bắt đầu với AMap trên Expo
description: Cài expo-gaode-map, cấu hình khóa AMap, Config Plugin, quyền riêng tư, quyền vị trí và build Android/iOS.
---

# Bắt đầu nhanh

Hướng dẫn này đưa bạn từ dự án Expo/React Native đến màn hình AMap chạy được với cấu hình phù hợp cho production.

## Yêu cầu

- Node.js >= 16
- Expo SDK >= 50
- React Native >= 0.73
- Khóa AMap phù hợp cho Android/iOS
- Development Build, EAS Build hoặc native build; **không dùng Expo Go** cho SDK native AMap

## 1. Chọn gói

```bash
npm install expo-gaode-map
# Nếu cần dẫn đường, dùng gói này THAY CHO expo-gaode-map
npm install expo-gaode-map-navigation
# Tùy chọn: Web API
npm install expo-gaode-map-web-api
```

::: warning Tương thích phiên bản
Expo SDK 54+ nên dùng bản mới nhất. Expo SDK 53 trở xuống nên dùng V1, ví dụ:

```bash
npm install expo-gaode-map@v1
```
:::

## 2. Lấy API Key

1. Truy cập [AMap Open Platform](https://lbs.amap.com/).
2. Tạo ứng dụng.
3. Tạo key riêng cho Android và iOS.
4. Đảm bảo package name / Bundle ID trùng với cấu hình đã đăng ký.

## 3. Cấu hình bằng Config Plugin

```json
{
  "expo": {
    "plugins": [
      [
        "expo-gaode-map",
        {
          "iosKey": "your-ios-api-key",
          "androidKey": "your-android-api-key",
          "enableLocation": true,
          "locationDescription": "Ứng dụng cần quyền vị trí để cung cấp chức năng bản đồ và định vị."
        }
      ]
    ]
  }
}
```

```bash
npx expo prebuild
npx expo run:android
# hoặc
npx expo run:ios
```

## 4. Quyền riêng tư và khởi tạo

```ts
import { ExpoGaodeMapModule } from 'expo-gaode-map';

if (!ExpoGaodeMapModule.getPrivacyStatus().isReady) {
  ExpoGaodeMapModule.setPrivacyConfig({
    hasShow: true,
    hasContainsPrivacy: true,
    hasAgree: true,
    privacyVersion: '2026-09-27',
  });
}
```

Nếu key native đã được ghi bằng Config Plugin, thông thường **không cần truyền lại** `androidKey` hoặc `iosKey` trong JavaScript.

Chỉ khi dùng Web API:

```ts
ExpoGaodeMapModule.initSDK({
  webKey: 'your-web-api-key',
});
```

## 5. Hiển thị bản đồ

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
    />
  );
}
```

## 6. Yêu cầu quyền vị trí

```tsx
import { ExpoGaodeMapModule } from 'expo-gaode-map';

let permission = await ExpoGaodeMapModule.checkLocationPermission();

if (!permission.granted) {
  permission = await ExpoGaodeMapModule.requestLocationPermission();
}

if (permission.granted) {
  const location = await ExpoGaodeMapModule.getCurrentLocation();
  console.log(location);
}
```

## 7. Marker và Circle

```tsx
import { MapView, Marker, Circle } from 'expo-gaode-map';

export default function MapScreen() {
  const center = { latitude: 10.8231, longitude: 106.6297 };

  return (
    <MapView
      style={{ flex: 1 }}
      initialCameraPosition={{ target: center, zoom: 13 }}
    >
      <Marker position={center} title="Điểm mẫu" />
      <Circle
        center={center}
        radius={1000}
        fillColor="#220066FF"
        strokeColor="#FF0066FF"
      />
    </MapView>
  );
}
```

## 8. Tìm POI

```tsx
import { searchPOI, searchNearby } from 'expo-gaode-map';

const result = await searchPOI({
  keyword: 'hotel',
  city: 'Ho Chi Minh City',
  pageSize: 20,
});

const nearby = await searchNearby({
  keyword: 'restaurant',
  center: { latitude: 10.8231, longitude: 106.6297 },
  radius: 1000,
});
```

## 9. Tích hợp với AI

```bash
npx skills add TomWq/expo-gaode-map-skill
```

## Lỗi thường gặp

### Bản đồ không hiển thị

- Kiểm tra API key và nền tảng.
- Kiểm tra package name/Bundle ID.
- Chạy lại `prebuild` sau khi đổi Config Plugin.
- Kiểm tra privacy consent và kết nối mạng.

### Không lấy được vị trí

- Kiểm tra quyền runtime.
- Kiểm tra Location Services.
- Kiểm tra mô tả quyền trong `Info.plist` trên iOS.

### Lỗi build

```bash
cd ios && pod deintegrate && pod install && cd ..
cd android && ./gradlew clean && cd ..
npx expo prebuild --clean
```

## Tiếp theo

- [Chọn thư viện AMap](/vi/guide/choosing-amap-library)
- [Tổng quan API](/vi/api/)
- [Ví dụ](/vi/examples/)
- [Khởi tạo chi tiết — English](/en/guide/initialization)
- [Dẫn đường — English](/en/guide/navigation)
