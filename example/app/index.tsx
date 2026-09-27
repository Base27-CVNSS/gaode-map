import React from 'react';
import { Link } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EXAMPLE_REGISTRY, EXAMPLE_SECTIONS } from '../exampleCatalog';
import {
  EXAMPLE_ANDROID_KEY,
  EXAMPLE_IOS_KEY,
  EXAMPLE_WEB_API_KEY,
} from '../exampleConfig';
import { StatusBar } from 'expo-status-bar';

const SCREEN_BACKGROUND = '#f8fafc';

function ExampleLinkCard({
  id,
}: {
  id: keyof typeof EXAMPLE_REGISTRY;
}) {
  const entry = EXAMPLE_REGISTRY[id];

  return (
    <Link href={`/examples/${id}`} asChild>
      <Pressable style={styles.linkCard}>
        <View style={styles.outcomeBadge}>
          <Text style={styles.outcomeBadgeText}>{entry.outcome}</Text>
        </View>
        <Text style={styles.linkTitle}>{entry.title}</Text>
        <Text style={styles.linkBody}>{entry.description}</Text>
      </Pressable>
    </Link>
  );
}

export default function ExampleCenterScreen() {
  const openDocs = React.useCallback(() => {
    void Linking.openURL('https://tomwq.github.io/expo-gaode-map/');
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
      >
        <View style={styles.hero}>
          <Text style={styles.title}>Trung tâm ví dụ</Text>
          <Text style={styles.subtitle}>
            Các ví dụ được nhóm theo kịch bản và kết quả đầu ra. Bạn có thể biết trước mình sẽ thấy gì rồi mới mở ví dụ chi tiết, không phải dò trong một danh sách dài.
          </Text>
        </View>

        {EXAMPLE_SECTIONS.map((section) => (
          <View key={section.key} style={styles.card}>
            <Text style={styles.cardTitle}>{section.title}</Text>
            <Text style={styles.cardDescription}>{section.description}</Text>
            {section.entries.map((id) => (
              <ExampleLinkCard key={id} id={id} />
            ))}
          </View>
        ))}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Biến môi trường hiện tại</Text>
          <Text style={styles.item}>Android Key: {EXAMPLE_ANDROID_KEY ? 'Đã cấu hình' : 'Chưa cấu hình'}</Text>
          <Text style={styles.item}>iOS Key: {EXAMPLE_IOS_KEY ? 'Đã cấu hình' : 'Chưa cấu hình'}</Text>
          <Text style={styles.item}>Web Key: {EXAMPLE_WEB_API_KEY ? 'Đã cấu hình' : 'Chưa cấu hình'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thứ tự nên xem</Text>
          <Text style={styles.item}>1. Xem “Quyền riêng tư & khởi tạo” để xác nhận SDK và chuỗi quyền hoạt động đúng.</Text>
          <Text style={styles.item}>2. Tiếp theo xem “Chức năng bản đồ cơ bản” và “Playground lớp phủ cơ bản”.</Text>
          <Text style={styles.item}>3. Khi cần gỡ lỗi sâu, mở “Sự kiện gỡ lỗi bản đồ” và “Trang tổng hợp cũ”.</Text>
          <Text style={styles.item}>4. Nếu chỉ kiểm tra API, vào thẳng “Web API & tìm kiếm”.</Text>
        </View>

        <Pressable style={styles.button} onPress={openDocs}>
          <Text style={styles.buttonText}>Mở tài liệu đầy đủ</Text>
        </Pressable>
      </ScrollView>
      <StatusBar style='dark' />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SCREEN_BACKGROUND,
  },
  scroll: {
    flex: 1,
    backgroundColor: SCREEN_BACKGROUND,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
    gap: 16,
  },
  hero: {
    borderRadius: 24,
    padding: 24,
    backgroundColor: '#111827',
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: '#f8fafc',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 23,
    color: '#cbd5e1',
  },
  card: {
    borderRadius: 20,
    padding: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  cardDescription: {
    marginBottom: 12,
    fontSize: 13,
    lineHeight: 20,
    color: '#64748b',
  },
  item: {
    fontSize: 14,
    lineHeight: 22,
    color: '#475569',
    marginBottom: 6,
  },
  linkCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dbe3ef',
    backgroundColor: '#f8fafc',
    padding: 16,
    marginBottom: 12,
  },
  outcomeBadge: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#dbeafe',
  },
  outcomeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  linkTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  linkBody: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: '#475569',
  },
  button: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#1d4ed8',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});
