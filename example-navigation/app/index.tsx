import React from "react";
import { Link, type Href } from "expo-router";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EXAMPLE_ANDROID_KEY, EXAMPLE_IOS_KEY, EXAMPLE_WEB_API_KEY } from "@/exampleConfig";

type ExampleEntry = {
  href: Href;
  title: string;
  body: string;
  outcome: string;
};

type ExampleSection = {
  title: string;
  description: string;
  entries: ExampleEntry[];
};

const EXAMPLE_SECTIONS: ExampleSection[] = [
  {
    title: "Chính thức / black-box",
    description: "Mở trực tiếp trang dẫn đường chính thức của AMap, không dùng UI nhúng tùy chỉnh của demo.",
    entries: [
      {
        href: "/examples/official",
        title: "Dẫn đường chính thức dạng black-box",
        body: "Kiểm tra `openOfficialNaviPage`，可直接调起官方路线页或官方导航页。",
        outcome: "Trang cuối: trang tuyến / dẫn đường chính thức",
      },
    ],
  },
  {
    title: "Dẫn đường nhúng",
    description: "Các luồng đều đi vào trang dẫn đường trong app; khác nhau ở cách tính tuyến, nguồn UI và khả năng chọn tuyến tùy chỉnh.",
    entries: [
      {
        href: "/examples/quick-start",
        title: "Kiểm tra tích hợp dẫn đường nhanh",
        body: "Luồng ngắn nhất để kiểm tra privacy consent, khởi tạo SDK, lấy vị trí và khởi động dẫn đường.",
        outcome: "最终页: 固定Dẫn đường nhúng页",
      },
      {
        href: "/examples/official-embedded",
        title: "UI dẫn đường chính thức nhúng",
        body: "Chỉ dùng `ExpoGaodeMapNaviView` mà không chồng HUD tùy chỉnh; dùng để quan sát UI nhúng chính thức.",
        outcome: "最终页: 官方Dẫn đường nhúng页",
      },
      {
        href: "/examples/current-location",
        title: "Dẫn đường từ vị trí hiện tại",
        body: "Không truyền điểm đầu; dùng vị trí hiện tại để dẫn đường tới đích.",
        outcome: "最终页: 固定Dẫn đường nhúng页",
      },
      {
        href: "/examples/independent-navigation",
        title: "Dẫn đường với lập tuyến độc lập",
        body: "先独立算路，再从候选路线里选一条启动导航，重点Kiểm tra `startNavigationWithIndependentPath`。",
        outcome: "最终页: 独立路径Dẫn đường nhúng页",
      },
      {
        href: "/examples/route-picker",
        title: "Trang chọn tuyến tùy chỉnh",
        body: "Hỗ trợ điểm đầu, điểm cuối, nhiều điểm trung gian và nhiều tuyến ứng viên trước khi vào dẫn đường.",
        outcome: "最终页: Trang chọn tuyến tùy chỉnh -> Dẫn đường nhúng页",
      },
      {
        href: "/examples/ui-props",
        title: "Giao diện dẫn đường UI tùy chỉnh",
        body: "Tập trung vào việc tự vẽ UI dựa trên `ExpoGaodeMapNaviView` để tạo HUD, HUD làn đường và thanh tình trạng giao thông.",
        outcome: "最终页: 自定义Dẫn đường nhúng页",
      },
    ],
  },
  {
    title: "Tính tuyến & tích hợp",
    description: "Tập trung kiểm tra chiến lược tính tuyến, khớp tuyến và sự kiện hơn là chỉ xem màn hình dẫn đường cuối.",
    entries: [
      {
        href: "/examples/follow-web",
        title: "Theo tuyến Web API",
        body: "Tính tuyến bằng Web API trước, sau đó khớp gần đúng sang tuyến native có thể dẫn đường.",
        outcome: "最终页: 匹配结果 + Dẫn đường nhúng页",
      },
      {
        href: "/examples/events",
        title: "Bảng sự kiện dẫn đường",
        body: "Theo dõi theo thời gian thực giọng nói, cập nhật thông tin, tính lại tuyến và sự kiện tới đích để tích hợp/gỡ lỗi.",
        outcome: "最终页: 事件观测页 + Dẫn đường nhúng页",
      },
    ],
  },
];

function ExampleLinkCard({ href, title, body, outcome }: ExampleEntry) {
  return (
    <Link href={href} asChild>
      <Pressable style={styles.linkCard}>
        <View style={styles.outcomeBadge}>
          <Text style={styles.outcomeBadgeText}>{outcome}</Text>
        </View>
        <Text style={styles.linkTitle}>{title}</Text>
        <Text style={styles.linkBody}>{body}</Text>
      </Pressable>
    </Link>
  );
}

export default function ExampleCenterScreen() {
  const openDocs = React.useCallback(() => {
    void Linking.openURL("https://tomwq.github.io/expo-gaode-map/api/navigation.html");
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.title}>Trung tâm ví dụ</Text>
          <Text style={styles.subtitle}>
            现在按“最终会打开什么页面”来分组。这样你能先判断它到底是Chính thức / black-box、官方嵌入式，还是自定义Dẫn đường nhúng，而不是只看名字猜。
          </Text>
        </View>

        {EXAMPLE_SECTIONS.map((section) => (
          <View key={section.title} style={styles.card}>
            <Text style={styles.cardTitle}>{section.title}</Text>
            <Text style={styles.cardDescription}>{section.description}</Text>
            {section.entries.map((entry) => (
              <ExampleLinkCard key={entry.title} {...entry} />
            ))}
          </View>
        ))}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Biến môi trường hiện tại</Text>
          <Text style={styles.item}>Android Key: {EXAMPLE_ANDROID_KEY ? "Đã cấu hình" : "Chưa cấu hình"}</Text>
          <Text style={styles.item}>iOS Key: {EXAMPLE_IOS_KEY ? "Đã cấu hình" : "Chưa cấu hình"}</Text>
          <Text style={styles.item}>Web Key: {EXAMPLE_WEB_API_KEY ? "Đã cấu hình" : "Chưa cấu hình"}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thứ tự nên xem</Text>
          <Text style={styles.item}>1. 先看“Kiểm tra tích hợp dẫn đường nhanh”，确认 SDK、隐私和定位链路没问题。</Text>
          <Text style={styles.item}>2. 如果你要官方页，直接看“Dẫn đường chính thức dạng black-box”。</Text>
          <Text style={styles.item}>3. 如果你要自己做导航页，优先看“Giao diện dẫn đường UI tùy chỉnh”和“Trang chọn tuyến tùy chỉnh”。</Text>
          <Text style={styles.item}>4. 如果你要研究独立路径组，再看“Dẫn đường với lập tuyến độc lập”。</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>当前工程已接入内容</Text>
          <Text style={styles.item}>• 本地依赖：`file:../packages/navigation`</Text>
          <Text style={styles.item}>• Config Plugin：`expo-gaode-map-navigation`</Text>
          <Text style={styles.item}>• iOS 后台定位：已在插件配置里开启</Text>
          <Text style={styles.item}>• 快速接入验证页：`app/examples/quick-start.tsx`</Text>
        </View>

        <Pressable style={styles.button} onPress={openDocs}>
          <Text style={styles.buttonText}>Mở tài liệu dẫn đường</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: 20,
    gap: 16,
  },
  hero: {
    borderRadius: 24,
    padding: 24,
    backgroundColor: "#111827",
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: "#f8fafc",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 23,
    color: "#cbd5e1",
  },
  card: {
    borderRadius: 20,
    padding: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
  },
  cardDescription: {
    marginBottom: 12,
    fontSize: 13,
    lineHeight: 20,
    color: "#64748b",
  },
  item: {
    fontSize: 14,
    lineHeight: 22,
    color: "#475569",
    marginBottom: 6,
  },
  linkCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    backgroundColor: "#f8fafc",
    padding: 16,
    marginBottom: 12,
  },
  outcomeBadge: {
    alignSelf: "flex-start",
    marginBottom: 10,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#dbeafe",
  },
  outcomeBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1d4ed8",
  },
  linkTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
  },
  linkBody: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: "#475569",
  },
  button: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "#1d4ed8",
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
});
