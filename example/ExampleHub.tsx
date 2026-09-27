import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AOIOverlayExample from './AOIOverlayExample';
import AdvancedOverlayExample from './AdvancedOverlayExample';
import LegacyPlaygroundExample from './App';
import ExampleRuntimeGate from './ExampleRuntimeGate';
import GeometryUtilsExample from './GeometryUtilsExample';

import MapBasicsExample from './MapBasicsExample';
import MapDebugExample from './MapDebugExample';

import MarkerTravelCardExample from './MarkerTravelCardExample';
import MultiFormatExample from './MultiFormatExample';
import OfflineMapExample from './OfflineMapExample';
import OverlayPlaygroundExample from './OverlayPlaygroundExample';
import PermissionExample from './PermissionExample';

import PolylineExample from './PolylineExample';
import PrivacyInitializationExample from './PrivacyInitializationExample';

import RentalMapLabelExample from './RentalMapLabelExample';
import SearchModuleTest from './SearchModuleTest';
import SmoothMoveExample from './SmoothMoveExample';
import TestNewPermissionMethods from './TestNewPermissionMethods';
import UseMapExample from './UseMapExample';
import WebAPIAdvancedTest from './WebAPIAdvancedTest';
import WebAPIExample from './WebAPIExample';
import NavigationWithLocationExample from './navigationWithLocation';
import AISmartSearchExample from './AISmartSearchExample';

type ExampleCategory =
  | 'featured'
  | 'map'
  | 'overlay'
  | 'location'
  | 'web-api'
  | 'tooling'
  | 'legacy';

type ExampleDefinition = {
  id: string;
  title: string;
  description: string;
  category: ExampleCategory;
  component: React.ComponentType;
  requiresRuntimeGate?: boolean;
};

/**
 * Danh mục ví dụ.
 * Gom các trang example rời rạc về một điểm truy cập có thể duyệt,
 * giúp tìm nhanh cách dùng thực tế tương ứng với từng API.
 */
const EXAMPLES: ExampleDefinition[] = [
  {
    id: 'privacy-init',
    title: 'Quyền riêng tư & khởi tạo',
    description: 'Minh họa thứ tự khởi động khuyến nghị cho setPrivacyConfig, initSDK và yêu cầu quyền vị trí.',
    category: 'featured',
    component: PrivacyInitializationExample,
    requiresRuntimeGate: false,
  },
  {
    id: 'map-basics',
    title: 'Chức năng bản đồ cơ bản',
    description: 'Tổng hợp cách dùng chuẩn cho MapView, sự kiện camera, nút định vị và theo dõi vị trí liên tục.',
    category: 'featured',
    component: MapBasicsExample,
  },
  {
    id: 'overlay-playground',
    title: 'Playground lớp phủ cơ bản',
    description: 'Thử nghiệm Circle, Marker, Polyline, Polygon và fitToCoordinates trong một trang.',
    category: 'featured',
    component: OverlayPlaygroundExample,
  },
  {
    id: 'advanced-playground',
    title: 'Playground lớp phủ nâng cao',
    description: 'Thử nghiệm HeatMap, MultiPoint, Cluster, AreaMaskOverlay và chức năng chụp bản đồ.',
    category: 'featured',
    component: AdvancedOverlayExample,
  },

  {
    id: 'use-map',
    title: 'useMap Hook',
    description: 'Minh họa cách lấy trực tiếp instance bản đồ trong cây MapView và điều khiển camera.',
    category: 'map',
    component: UseMapExample,
  },
  {
    id: 'map-debug',
    title: 'Sự kiện gỡ lỗi bản đồ',
    description: 'Minh họa đếm sự kiện camera, bật/tắt native throttling và kiểm tra thao tác nhấn POI.',
    category: 'map',
    component: MapDebugExample,
  },
  {
    id: 'polyline',
    title: 'Polyline & quỹ đạo',
    description: 'Minh họa vẽ polyline, hiển thị tuyến và tổ chức các điểm quỹ đạo.',
    category: 'overlay',
    component: PolylineExample,
  },
  {
    id: 'smooth-move',
    title: 'Marker di chuyển mượt',
    description: 'Minh họa cách dùng smoothMovePath và smoothMoveDuration.',
    category: 'overlay',
    component: SmoothMoveExample,
  },
 

  {
    id: 'rental-map-label',
    title: 'Nhãn giá bất động sản trên bản đồ',
    description:
      'Tái hiện hai kiểu Marker dạng nhãn giá bong bóng và nhãn danh sách, hỗ trợ tự chuyển theo mức zoom hoặc chuyển thủ công.',
    category: 'overlay',
    component: RentalMapLabelExample,
  },

  {
    id: 'multi-format',
    title: 'Nhiều định dạng tọa độ',
    description: 'Minh họa đầu vào tọa độ dạng object, mảng và phong cách GeoJSON.',
    category: 'overlay',
    component: MultiFormatExample,
  },
  {
    id: 'aoi-mask',
    title: 'Mặt nạ vùng AOI',
    description: 'Minh họa AreaMaskOverlay và biên nhiều vòng cho bài toán làm nổi bật khu vực.',
    category: 'overlay',
    component: AOIOverlayExample,
  },
  {
    id: 'geometry-utils',
    title: 'Tính toán hình học',
    description: 'Minh họa khoảng cách, giản lược, điểm gần nhất, chiều dài tuyến và các phép hình học native.',
    category: 'tooling',
    component: GeometryUtilsExample,
  },
  {
    id: 'permissions',
    title: 'Ví dụ quyền cơ bản',
    description: 'Minh họa kiểm tra, yêu cầu và quy trình quyền vị trí thường gặp.',
    category: 'location',
    component: PermissionExample,
  },
  {
    id: 'new-permissions',
    title: 'API quyền mới',
    description: 'Minh họa API quyền nâng cao và khả năng định vị nền.',
    category: 'location',
    component: TestNewPermissionMethods,
  },

  {
    id: 'offline-map',
    title: 'Bản đồ ngoại tuyến',
    description: 'Minh họa danh sách thành phố offline, tải xuống, tạm dừng, hủy và thông tin lưu trữ.',
    category: 'location',
    component: OfflineMapExample,
  },
  {
    id: 'ai-smart-search',
    title: 'AI gợi ý dọc tuyến',
    description: 'Chuyển hành trình ngôn ngữ tự nhiên thành tuyến, POI dọc đường và gợi ý có thể giải thích.',
    category: 'web-api',
    component: AISmartSearchExample,
  },
  {
    id: 'web-api-basic',
    title: 'Web API cơ bản',
    description: 'Minh họa geocoding, reverse geocoding và khởi tạo Web API.',
    category: 'web-api',
    component: WebAPIExample,
  },

  {
    id: 'search-module',
    title: 'Module tìm kiếm',
    description: 'Minh họa gọi module tìm kiếm, xem kết quả và log gỡ lỗi.',
    category: 'web-api',
    component: SearchModuleTest,
  },

  {
    id: 'legacy-playground',
    title: 'Demo tổng hợp (cũ)',
    description: 'Giữ trang debug tổng hợp cũ để hồi quy và tra cứu bổ sung.',
    category: 'legacy',
    component: LegacyPlaygroundExample,
  },
];

const CATEGORY_LABELS: Record<ExampleCategory, string> = {
  featured: 'Điểm bắt đầu',
  map: 'Bản đồ & camera',
  overlay: 'Lớp phủ & khu vực',
  location: 'Định vị & quyền',
  'web-api': 'Web API / tìm kiếm',
  tooling: 'Công cụ & hiệu năng',
  legacy: 'Trang tổng hợp cũ',
};

function ExamplePreview({
  title,
  description,
  onPress,
}: {
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </Pressable>
  );
}

export default function ExampleHub() {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const selectedExample = React.useMemo(
    () => EXAMPLES.find((example) => example.id === selectedId) ?? null,
    [selectedId]
  );
  const SelectedComponent = selectedExample?.component;
  const needsRuntimeGate = selectedExample?.requiresRuntimeGate !== false;
  const ViewerContent = selectedExample ? (
    <View style={styles.viewerContainer}>
      {SelectedComponent ? <SelectedComponent /> : null}
      <SafeAreaView pointerEvents="box-none" style={styles.viewerOverlay} edges={['bottom']}>
        <Pressable style={styles.backButton} onPress={() => setSelectedId(null)}>
          <Text style={styles.backButtonText}>Về danh mục</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  ) : null;

  if (selectedExample) {
    return needsRuntimeGate ? (
      <ExampleRuntimeGate>{ViewerContent}</ExampleRuntimeGate>
    ) : (
      ViewerContent
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.title}>Trung tâm ví dụ expo-gaode-map</Text>
          <Text style={styles.subtitle}>
            Các ví dụ chính trong project example được nhóm theo năng lực, ưu tiên tách các
            API thường dùng thành từng lối vào riêng để giảm thời gian dò mã trong trang tổng hợp.
          </Text>
        </View>

        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Ranh giới giữa core và navigation</Text>
          <Text style={styles.noticeText}>
            Bản đồ trong `core` và `navigation` vẫn là hai implementation riêng, không gộp native MapView.
            Danh mục này ưu tiên luồng `core + web-api`; các ví dụ liên quan navigation SDK
            nên tiếp tục xem trong project navigation riêng.
          </Text>
        </View>

        {Object.entries(CATEGORY_LABELS).map(([category, label]) => {
          const items = EXAMPLES.filter((example) => example.category === category);
          if (!items.length) {
            return null;
          }

          return (
            <View key={category} style={styles.section}>
              <Text style={styles.sectionTitle}>{label}</Text>
              {items.map((example) => (
                <ExamplePreview
                  key={example.id}
                  title={example.title}
                  description={example.description}
                  onPress={() => setSelectedId(example.id)}
                />
              ))}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7fb',
  },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  hero: {
    borderRadius: 28,
    padding: 22,
    backgroundColor: '#dbeafe',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 24,
    color: '#475569',
  },
  noticeCard: {
    marginTop: 18,
    borderRadius: 20,
    padding: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe3ef',
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  noticeText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 21,
    color: '#475569',
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  card: {
    marginBottom: 12,
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe3ef',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  cardDescription: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 22,
    color: '#475569',
  },
  viewerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  viewerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingTop:
      Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 14 : 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
});
