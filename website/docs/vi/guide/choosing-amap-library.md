---
title: Chọn thư viện AMap cho Expo
description: Cách chọn expo-gaode-map, expo-gaode-map-navigation, expo-gaode-map-web-api hoặc react-native-amap3d cho dự án Expo và React Native.
---

# Chọn thư viện AMap cho Expo

Với dự án Expo hoặc React Native mới cần AMap/Gaode Map, điểm bắt đầu hợp lý là `expo-gaode-map`. Nếu ứng dụng cần **lập tuyến và giao diện dẫn đường**, dùng `expo-gaode-map-navigation` thay cho gói core.

## Quyết định nhanh

| Nhu cầu | Gói |
| --- | --- |
| Bản đồ, định vị, lớp phủ, offline, tìm kiếm POI native | `expo-gaode-map` |
| Bản đồ + lập tuyến + UI dẫn đường | `expo-gaode-map-navigation` |
| Web API thuần JavaScript: geocoding, route, POI | `expo-gaode-map-web-api` |
| Dự án React Native cũ, ổn định, chưa chuyển Expo/New Architecture | Có thể tiếp tục đánh giá `react-native-amap3d` |

::: warning Không cài hai gói native nền cùng lúc
`expo-gaode-map` và `expo-gaode-map-navigation` bọc các lớp AMap SDK trùng nhau. Nếu cần navigation, chỉ cài `expo-gaode-map-navigation`.
:::

## So sánh thực dụng

| Hạng mục | expo-gaode-map | expo-gaode-map-navigation | react-native-amap3d |
| --- | --- | --- | --- |
| Trọng tâm | Map, location, overlay, search, offline | Map + route + navigation UI | Map component cộng đồng |
| Expo Modules | Có | Có | Không dựa trên Expo Modules |
| Config Plugin | Có | Có | Thường cần cấu hình thủ công |
| EAS / Dev Build | Phù hợp | Phù hợp | Cần kiểm tra tích hợp native |
| New Architecture | Có hỗ trợ rõ ràng | Có hỗ trợ rõ ràng | Phụ thuộc phiên bản/fork |
| Tìm kiếm native | Tích hợp sẵn | Tích hợp sẵn | Thường ghép thêm |
| Dẫn đường | Không phải gói navigation | Có | Không phải trọng tâm |
| Offline | Có API | Có khả năng phía map | Phụ thuộc phiên bản |

## Cài đặt

```bash
npm install expo-gaode-map
# hoặc
npm install expo-gaode-map-navigation
# tùy chọn
npm install expo-gaode-map-web-api
```

## Cấu hình Config Plugin

```json
{
  "expo": {
    "plugins": [
      [
        "expo-gaode-map",
        {
          "androidKey": "your-android-key",
          "iosKey": "your-ios-key"
        }
      ]
    ]
  }
}
```

Nếu dùng navigation, đổi tên plugin thành `expo-gaode-map-navigation`.

```bash
npx expo prebuild --clean
npx expo run:android
npx expo run:ios
```

## Bước tiếp theo

- [Bắt đầu nhanh](/vi/guide/getting-started)
- [Tổng quan API](/vi/api/)
- [Ví dụ](/vi/examples/)
