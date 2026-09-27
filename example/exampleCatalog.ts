import type { ComponentType } from 'react';
import AOIOverlayExample from './AOIOverlayExample';
import AdvancedOverlayExample from './AdvancedOverlayExample';
import DeliveryAddressPickerExample from './DeliveryAddressPickerExample';
import DeliveryRouteExample from './DeliveryRouteExample';
import DispatchWorkbenchExample from './DispatchWorkbenchExample';
import DynamicRouteTrackingExample from './DynamicRouteTrackingExample';
import EnterpriseCheckInExample from './EnterpriseCheckInExample';
import LegacyPlaygroundExample from './App';
import GeometryUtilsExample from './GeometryUtilsExample';
import InputTipsExample from './InputTipsExample';

import MapBasicsExample from './MapBasicsExample';
import MapDebugExample from './MapDebugExample';
import MayDayFiveDayTripExample from './MayDayFiveDayTripExample';
import MarkerStressTestExample from './MarkerStressTestExample';
import MarkerTravelCardExample from './MarkerTravelCardExample';
import MockLocationDetectionExample from './MockLocationDetectionExample';
import MultiFormatExample from './MultiFormatExample';
import OfflineMapExample from './OfflineMapExample';
import OverlayPlaygroundExample from './OverlayPlaygroundExample';
import POIMapSearchWebAPIExample from './POIMapSearchWebAPIExample';
import POISearchMapNativeExample from './POISearchMapNativeExample';
import POISearchNativeExample from './POISearchNativeExample';
import PermissionExample from './PermissionExample';
import PolylineExample from './PolylineExample';
import PrivacyInitializationExample from './PrivacyInitializationExample';
import RentalMapLabelExample from './RentalMapLabelExample';
import SearchModuleTest from './SearchModuleTest';
import SmoothMoveExample from './SmoothMoveExample';
import TestNewPermissionMethods from './TestNewPermissionMethods';
import TaxiLocationPickerExample from './TaxiLocationPickerExample';
import UseMapExample from './UseMapExample';
import WebAPIAdvancedTest from './WebAPIAdvancedTest';
import WebAPIExample from './WebAPIExample';
import ZoomAnchorMarkerStateExample from './ZoomAnchorMarkerStateExample';
import NavigationWithLocationExample from './navigationWithLocation';
import AISmartSearchExample from './AISmartSearchExample';

export const EXAMPLE_LIGHT_BACKGROUND = '#f8fafc';
export const EXAMPLE_DARK_BACKGROUND = '#0f172a';

export type ExampleDefinition = {
  id: string;
  title: string;
  description: string;
  outcome: string;
  component: ComponentType;
  requiresRuntimeGate?: boolean;
  immersive?: boolean;
  navigationBarColor?: string;
};

export const EXAMPLE_REGISTRY: Record<string, ExampleDefinition> = {
  'privacy-init': {
    id: 'privacy-init',
    title: 'Quyền riêng tư & khởi tạo',
    description: 'Minh họa thứ tự khởi động khuyến nghị cho setPrivacyConfig, initSDK và yêu cầu quyền vị trí.',
    outcome: 'Hoàn tất khởi tạo SDK và chuẩn bị quyền',
    component: PrivacyInitializationExample,
    requiresRuntimeGate: false,
    navigationBarColor: EXAMPLE_DARK_BACKGROUND,
  },
  'map-basics': {
    id: 'map-basics',
    title: 'Chức năng bản đồ cơ bản',
    description: 'Tổng hợp cách dùng chuẩn cho MapView, sự kiện camera, nút định vị và theo dõi vị trí liên tục.',
    outcome: 'Mở trang tương tác bản đồ cơ bản',
    component: MapBasicsExample,
    navigationBarColor: EXAMPLE_DARK_BACKGROUND,
  },
  'overlay-playground': {
    id: 'overlay-playground',
    title: 'Playground lớp phủ cơ bản',
    description: 'Thử nghiệm Circle, Marker, Polyline, Polygon và fitToCoordinates trong một trang.',
    outcome: 'Mở trang kiểm thử lớp phủ cơ bản',
    component: OverlayPlaygroundExample,
    navigationBarColor: EXAMPLE_DARK_BACKGROUND,
  },
  'advanced-playground': {
    id: 'advanced-playground',
    title: 'Playground lớp phủ nâng cao',
    description: 'Thử nghiệm HeatMap, MultiPoint, Cluster, AreaMaskOverlay và chức năng chụp bản đồ.',
    outcome: 'Mở trang kiểm thử lớp phủ nâng cao',
    component: AdvancedOverlayExample,
    navigationBarColor: EXAMPLE_DARK_BACKGROUND,
  },
 
  'use-map': {
    id: 'use-map',
    title: 'useMap Hook',
    description: 'Minh họa cách lấy trực tiếp instance bản đồ trong cây MapView và điều khiển camera.',
    outcome: 'Mở ví dụ sử dụng Hook',
    component: UseMapExample,
  },
  'map-debug': {
    id: 'map-debug',
    title: 'Sự kiện gỡ lỗi bản đồ',
    description: 'Minh họa đếm sự kiện camera, bật/tắt native throttling và kiểm tra thao tác nhấn POI.',
    outcome: 'Mở bảng gỡ lỗi bản đồ',
    component: MapDebugExample,
  },
  polyline: {
    id: 'polyline',
    title: 'Polyline & quỹ đạo',
    description: 'Minh họa vẽ polyline, hiển thị tuyến và tổ chức các điểm quỹ đạo.',
    outcome: 'Mở trang render quỹ đạo',
    component: PolylineExample,
  },
  'smooth-move': {
    id: 'smooth-move',
    title: 'Marker di chuyển mượt',
    description: 'Minh họa cách dùng smoothMovePath và smoothMoveDuration.',
    outcome: 'Mở ví dụ di chuyển mượt',
    component: SmoothMoveExample,
  },
  'zoom-anchor-marker-state': {
    id: 'zoom-anchor-marker-state',
    title: 'Điểm neo zoom & trạng thái Marker',
    description: 'Minh họa zoom theo tâm bản đồ và chuyển cacheKey khi Marker tùy chỉnh được chọn/khôi phục.',
    outcome: 'Mở ví dụ zoom và trạng thái Marker',
    component: ZoomAnchorMarkerStateExample,
    navigationBarColor: EXAMPLE_DARK_BACKGROUND,
  },
 

  'rental-map-label': {
    id: 'rental-map-label',
    title: 'Nhãn giá bất động sản trên bản đồ',
    description: 'Tái hiện nhãn giá dạng bong bóng và dạng danh sách, tự chuyển theo mức zoom.',
    outcome: 'Mở trang so sánh kiểu nhãn',
    component: RentalMapLabelExample,
  },

  'multi-format': {
    id: 'multi-format',
    title: 'Nhiều định dạng tọa độ',
    description: 'Minh họa đầu vào tọa độ dạng object, mảng và phong cách GeoJSON.',
    outcome: 'Mở trang kiểm tra tương thích tọa độ',
    component: MultiFormatExample,
  },
  'aoi-mask': {
    id: 'aoi-mask',
    title: 'Mặt nạ vùng AOI',
    description: 'Minh họa AreaMaskOverlay và biên nhiều vòng cho bài toán làm nổi bật khu vực.',
    outcome: 'Mở trang render mặt nạ AOI',
    component: AOIOverlayExample,
  },
  'marker-stress-test': {
    id: 'marker-stress-test',
    title: 'Kiểm thử tải Marker hàng loạt trên iOS',
    description: 'Gắn 50–200 Marker tùy chỉnh, đổi style children hàng loạt và quan sát độ giật cùng áp lực bộ nhớ.',
    outcome: 'Mở trang kiểm thử hiệu năng Marker',
    component: MarkerStressTestExample,
    navigationBarColor: EXAMPLE_DARK_BACKGROUND,
  },
  'geometry-utils': {
    id: 'geometry-utils',
    title: 'Tính toán hình học',
    description: 'Minh họa khoảng cách, giản lược, điểm gần nhất, chiều dài tuyến và các phép hình học native.',
    outcome: 'Mở trang kiểm tra công cụ hình học',
    component: GeometryUtilsExample,
  },
  permissions: {
    id: 'permissions',
    title: 'Ví dụ quyền cơ bản',
    description: 'Minh họa kiểm tra quyền vị trí chính xác/xấp xỉ, vị trí hiện tại, điểm định vị và reverse geocoding.',
    outcome: 'Kiểm tra toàn bộ chuỗi định vị theo độ chính xác hiện tại',
    component: PermissionExample,
  },
  'new-permissions': {
    id: 'new-permissions',
    title: 'API quyền mới',
    description: 'Minh họa API quyền nâng cao và khả năng định vị nền.',
    outcome: '进入API quyền mới示例页',
    component: TestNewPermissionMethods,
  },
  'mock-location-detection': {
    id: 'mock-location-detection',
    title: 'Phát hiện vị trí giả lập',
    description: 'Minh họa isMock, trustedLevel, trường nguồn trên iOS và cấu hình mockEnable trên Android.',
    outcome: '进入Phát hiện vị trí giả lập页',
    component: MockLocationDetectionExample,
  },

  'offline-map': {
    id: 'offline-map',
    title: 'Bản đồ ngoại tuyến',
    description: 'Minh họa danh sách thành phố offline, tải xuống, tạm dừng, hủy và thông tin lưu trữ.',
    outcome: '进入Bản đồ ngoại tuyến管理页',
    component: OfflineMapExample,
  },


  'taxi-location-picker': {
    id: 'taxi-location-picker',
    title: 'Chọn điểm đón xe',
    description: 'Ghim cố định ở tâm bản đồ + danh sách POI lân cận, mô phỏng quy trình chọn điểm đón.',
    outcome: 'Mở trang chọn điểm đón',
    component: TaxiLocationPickerExample,
  },
  'web-api-basic': {
    id: 'web-api-basic',
    title: 'Web API cơ bản',
    description: 'Minh họa geocoding, reverse geocoding và khởi tạo Web API.',
    outcome: '进入 Web API cơ bản页',
    component: WebAPIExample,
  },

  'search-module': {
    id: 'search-module',
    title: 'Module tìm kiếm',
    description: '演示Module tìm kiếm调用、结果查看和调试日志。',
    outcome: '进入Module tìm kiếm调试页',
    component: SearchModuleTest,
  },
  'input-tips-web': {
    id: 'input-tips-web',
    title: 'Gợi ý nhập liệu (Web API)',
    description: 'Kiểm tra tập trung các API gợi ý như getTips/getPOITips/getBusTips.',
    outcome: 'Mở trang kiểm thử gợi ý nhập liệu',
    component: InputTipsExample,
  },
  'ai-smart-search': {
    id: 'ai-smart-search',
    title: 'AI gợi ý dọc tuyến',
    description: 'Chuyển hành trình ngôn ngữ tự nhiên thành tuyến, POI dọc đường và gợi ý có thể giải thích.',
    outcome: '进入 AI gợi ý dọc tuyến演示页',
    component: AISmartSearchExample,
    immersive: true,
    navigationBarColor: EXAMPLE_DARK_BACKGROUND,
  },
  'poi-search-native': {
    id: 'poi-search-native',
    title: 'Tìm POI (Native)',
    description: 'Dùng module search cho bốn kiểu: từ khóa, lân cận, loại và gợi ý nhập liệu.',
    outcome: 'Mở trang tìm POI native',
    component: POISearchNativeExample,
  },
  'poi-search-map-native': {
    id: 'poi-search-map-native',
    title: 'POI trên bản đồ (Native)',
    description: 'Đưa trực tiếp kết quả search lên Marker trên bản đồ để kiểm tra.',
    outcome: 'Mở trang liên kết tìm kiếm native với bản đồ',
    component: POISearchMapNativeExample,
  },
  'poi-search-map-web': {
    id: 'poi-search-map-web',
    title: 'POI trên bản đồ (Web API)',
    description: 'Đưa POI từ Web API lên bản đồ và kiểm tra tâm tìm kiếm lân cận.',
    outcome: 'Mở trang liên kết Web API với bản đồ',
    component: POIMapSearchWebAPIExample,
  },
  'delivery-route': {
    id: 'delivery-route',
    title: 'Bảng tuyến giao hàng',
    description: 'Mô phỏng tuyến hai chặng nhận hàng–giao hàng và bảng trạng thái.',
    outcome: 'Mở ví dụ tuyến giao hàng',
    component: DeliveryRouteExample,
  },
  'mayday-five-day-trip': {
    id: 'mayday-five-day-trip',
    title: 'Hành trình du lịch 5 ngày',
    description: 'Mẫu ứng dụng du lịch hoàn chỉnh: lịch theo ngày, tuyến bản đồ, Marker tùy chỉnh và bottom sheet sản phẩm.',
    outcome: 'Mở mẫu trực quan hành trình 5 ngày',
    component: MayDayFiveDayTripExample,
    immersive: true,
  },
  'delivery-address-picker': {
    id: 'delivery-address-picker',
    title: 'Bộ chọn địa chỉ giao hàng',
    description: 'Kéo bản đồ chọn điểm + autocomplete + POI lân cận, mô phỏng chọn địa chỉ nhận hàng.',
    outcome: 'Mở trang chọn địa chỉ giao hàng',
    component: DeliveryAddressPickerExample,
  },
  'dispatch-workbench': {
    id: 'dispatch-workbench',
    title: 'Bàn điều phối',
    description: 'Ví dụ điều phối tổng hợp: đơn hàng, vùng phục vụ, lập tuyến động và mô phỏng quỹ đạo tài xế.',
    outcome: '进入Bàn điều phối页',
    component: DispatchWorkbenchExample,
  },
  'dynamic-route-tracking': {
    id: 'dynamic-route-tracking',
    title: 'Theo dõi tuyến động',
    description: 'Lập tuyến động sau khi nhập địa chỉ, hiển thị giai đoạn hành trình và tiến độ.',
    outcome: '进入Theo dõi tuyến động页',
    component: DynamicRouteTrackingExample,
  },
  'enterprise-check-in': {
    id: 'enterprise-check-in',
    title: 'Chấm công doanh nghiệp',
    description: 'Hiển thị vùng chấm công, vị trí hiện tại, tuyến đi làm và trạng thái chấm công.',
    outcome: 'Mở trang chấm công doanh nghiệp',
    component: EnterpriseCheckInExample,
  },
 
  
  'legacy-playground': {
    id: 'legacy-playground',
    title: 'Demo tổng hợp (cũ)',
    description: 'Giữ trang debug tổng hợp cũ để hồi quy và tra cứu bổ sung.',
    outcome: 'Mở trang debug tổng hợp cũ',
    component: LegacyPlaygroundExample,
  },
};

export type ExampleId = keyof typeof EXAMPLE_REGISTRY;

export type ExampleSection = {
  key: string;
  title: string;
  description: string;
  entries: ExampleId[];
};

export const EXAMPLE_SECTIONS: ExampleSection[] = [
  {
    key: 'start',
    title: 'Bắt đầu & luồng khuyến nghị',
    description: 'Chạy thông luồng khởi tạo và chức năng lõi trước, rồi mới đi vào khả năng chuyên sâu để giảm chi phí gỡ lỗi.',
    entries: ['privacy-init', 'map-basics', 'overlay-playground', 'advanced-playground'],
  },
  {
    key: 'map-location',
    title: 'Bản đồ & định vị',
    description: 'Tập trung điều khiển bản đồ, quyền vị trí và offline để xác nhận độ ổn định nền tảng.',
    entries: [
      'use-map',
      'map-debug',
      'permissions',
      'new-permissions',
      'mock-location-detection',
      'offline-map',
      'taxi-location-picker',
    ],
  },
  {
    key: 'overlay',
    title: 'Lớp phủ & hiển thị',
    description: 'Bao quát điểm/đường/vùng và Marker phức tạp để kiểm tra render và tương tác.',
    entries: [
      'polyline',
      'smooth-move',
      'zoom-anchor-marker-state',
   
      'rental-map-label',
     
      'multi-format',
      'aoi-mask',
    ],
  },
  {
    key: 'web-api',
    title: 'Web API & tìm kiếm',
    description: 'Tập trung gọi dịch vụ và tích hợp dữ liệu; có thể kiểm tra độc lập không cần render bản đồ.',
    entries: [
      'web-api-basic',
      'search-module',
      'input-tips-web',
      'ai-smart-search',
      'poi-search-native',
      'poi-search-map-native',
      'poi-search-map-web',
    ],
  },
  {
    key: 'biz-scenarios',
    title: 'Kịch bản nghiệp vụ',
    description: 'Các trang thiên nghiệp vụ để kiểm tra tuyến nhiều chặng, phân vùng và bảng tác vụ.',
    entries: [
      'mayday-five-day-trip',
      'delivery-route',
      'delivery-address-picker',
      'dispatch-workbench',
      'dynamic-route-tracking',
      'enterprise-check-in',
     
    ],
  },
  {
    key: 'tooling',
    title: 'Công cụ & tương thích',
    description: 'Dùng để kiểm tra hình học, tương thích nền tảng và hiệu năng.',
    entries: ['marker-stress-test', 'geometry-utils'],
  },
  {
    key: 'legacy',
    title: 'Trang tổng hợp cũ',
    description: 'Giữ trang tổng hợp cũ để đối chiếu hồi quy.',
    entries: ['legacy-playground'],
  },
];
