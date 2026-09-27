import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Stack, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function ExamplesLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Quay lại",
        headerLeft: () => (
          <Pressable
            onPress={() => router.back()}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingRight: 8,
            }}
            hitSlop={8}
          >
            <View
              style={{
                width: 28,
                height: 28,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FontAwesome name="angle-left" size={24} color="#1677ff" />
            </View>
            <Text
              style={{
                color: "#1677ff",
                fontSize: 16,
                fontWeight: "500",
              }}
            >
              Quay lại
            </Text>
          </Pressable>
        ),
      }}
    >
      <Stack.Screen
        name="quick-start"
        options={{ title: "Kiểm tra tích hợp dẫn đường nhanh", }}
      />
      <Stack.Screen
        name="official"
        options={{ title: "Dẫn đường chính thức dạng black-box", }}
      />
      <Stack.Screen
        name="official-embedded"
        options={{ title: "UI dẫn đường chính thức nhúng",}}
      />
      {/* <Stack.Screen
        name="independent"
        options={{ title: "Xem trước tuyến độc lập", presentation: "card" }}
      /> */}
      <Stack.Screen
        name="independent-navigation"
        options={{ title: "Dẫn đường với lập tuyến độc lập",  }}
      />
      <Stack.Screen
        name="follow-web"
        options={{ title: "Theo tuyến Web API", }}
      />
      <Stack.Screen
        name="current-location"
        options={{ title: "Dẫn đường từ vị trí hiện tại", }}
      />
      <Stack.Screen
        name="route-picker"
        options={{ title: "Trang chọn tuyến tùy chỉnh", headerShown: false }}
      />
      <Stack.Screen
        name="events"
        options={{ title: "Bảng sự kiện dẫn đường", }}
      />
      <Stack.Screen
        name="ui-props"
        options={{ title: "Giao diện dẫn đường UI tùy chỉnh", }}
      />
    </Stack>
  );
}
