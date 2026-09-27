---
layout: home
title: Tổng quan expo-gaode-map
description: Tổng quan expo-gaode-map cho Expo và React Native: bản đồ, định vị, tìm kiếm, dẫn đường, bản đồ ngoại tuyến và Web API.

hero:
  name: "expo-gaode-map"
  text: "Tài liệu tiếng Việt"
  tagline: Bộ AMap hoàn chỉnh xây dựng trên Expo Modules
  image:
    src: /logo.svg
    alt: expo-gaode-map
  actions:
    - theme: brand
      text: Bắt đầu nhanh
      link: /vi/guide/getting-started
    - theme: alt
      text: Xem GitHub
      link: https://github.com/TomWq/expo-gaode-map

features:
  - icon: 🗺️
    title: Bản đồ đầy đủ
    details: Nhiều kiểu bản đồ, điều khiển cử chỉ, camera và lớp phủ
  - icon: 📍
    title: Định vị
    details: Định vị liên tục, định vị một lần và chuyển đổi tọa độ
  - icon: 🔍
    title: Tìm kiếm gốc
    details: POI, tìm quanh vị trí và các luồng tìm kiếm AMap
  - icon: 🚗
    title: Dẫn đường
    details: Lập tuyến và dẫn đường cho ô tô, đi bộ, xe đạp, xe tải và nhiều phương tiện
  - icon: 📥
    title: Bản đồ ngoại tuyến
    details: Tải, theo dõi tiến độ và quản lý dữ liệu bản đồ theo thành phố
  - icon: 🌐
    title: Web API
    details: Geocoding, lập tuyến, POI và dịch vụ AMap bằng JavaScript
  - icon: 🎨
    title: Lớp phủ phong phú
    details: Marker, Circle, Polyline, Polygon, HeatMap, Cluster và nhiều loại khác
  - icon: 📝
    title: TypeScript
    details: Hệ kiểu đầy đủ, phù hợp dự án quy mô lớn
  - icon: ⚡
    title: Kiến trúc React Native mới
    details: Hỗ trợ Fabric, TurboModules và kiến trúc cũ
---

## Chọn gói phù hợp

| Nhu cầu | Gói nên dùng |
| --- | --- |
| Bản đồ, định vị, lớp phủ, bản đồ ngoại tuyến, tìm kiếm POI gốc | `expo-gaode-map` |
| Bản đồ + lập tuyến + giao diện dẫn đường | `expo-gaode-map-navigation` |
| Geocoding, POI, lập tuyến bằng Web API | `expo-gaode-map-web-api` |

::: warning Chỉ chọn một gói native nền
Không cài đồng thời `expo-gaode-map` và `expo-gaode-map-navigation` vì hai gói cùng bọc các lớp SDK AMap native. Nếu cần dẫn đường, dùng `expo-gaode-map-navigation`; gói này đã bao gồm chức năng bản đồ.
:::

## Cài đặt nhanh

```bash
npm install expo-gaode-map
# hoặc, nếu cần dẫn đường:
npm install expo-gaode-map-navigation
# tùy chọn:
npm install expo-gaode-map-web-api
```

### Tương thích Expo

- **Expo SDK 54+**: dùng bản mới nhất.
- **Expo SDK 53 trở xuống**: dùng nhánh V1, ví dụ `npm install expo-gaode-map@v1`.
- Gói native AMap không chạy trong Expo Go; hãy dùng Development Build, EAS Build hoặc build native cục bộ.

## Quy trình triển khai khuyến nghị

1. Chọn đúng gói.
2. Tạo khóa AMap cho Android/iOS trên AMap Open Platform.
3. Khai báo Config Plugin trong `app.json`.
4. Hoàn tất luồng đồng ý quyền riêng tư trước khi dùng SDK trên lần cài đặt đầu.
5. Chạy `npx expo prebuild` rồi build ứng dụng.
6. Yêu cầu quyền vị trí khi thực sự cần.
7. Kiểm thử trên thiết bị thật.

## Vì sao đáng dùng?

- **Expo-first**: Expo Modules + Config Plugin.
- **Một hệ API nhất quán** cho bản đồ, tìm kiếm, dẫn đường và dữ liệu ngoại tuyến.
- **Hỗ trợ New Architecture** của React Native.
- **TypeScript rõ ràng**, giảm lỗi tích hợp.
- **Có ví dụ chạy được** trong `example/` và `example-navigation/`.
- **MIT**, phù hợp cả dự án thương mại theo điều kiện giấy phép.

## Đi tiếp

- [Chọn thư viện AMap](/vi/guide/choosing-amap-library)
- [Bắt đầu nhanh](/vi/guide/getting-started)
- [Tổng quan API](/vi/api/)
- [Ví dụ](/vi/examples/)
