import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  clearIndependentRoute,
  ExpoGaodeMapModule,
  independentDriveRoute,
  independentRideRoute,
  independentWalkRoute,
  MapView,
  Marker,
  Polyline,
  getInputTips,
  initSearch,
  reGeocode,
  type IndependentRouteResult,
  type MapViewRef,
  type NaviPoint,
  type ExpoGaodeMapNaviViewRef,
  type RouteResult,
   type InputTip,
} from "expo-gaode-map-navigation";

import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  buildDemoScenario,
  ensureDemoSdkReady,
  formatDistance,
  formatDuration,
  getRoutePreviewPoints,
} from "@/lib/gaode-demo";
import { EmbeddedNaviView } from "@/lib/navigation-ui";
import { useHideNavigationHeader } from "@/lib/useHideNavigationHeader";

type RouteFieldValue = {
  label: string;
  point: NaviPoint;
  address?: string;
  poiId?: string;
};

type WaypointField = {
  key: string;
  input: string;
  selected: RouteFieldValue | null;
};

type RouteScene = "drive" | "ride" | "walk";
type RouteTone = "primary" | "success" | "warm" | "neutral";

const MAX_WAYPOINTS = 5;
const DEFAULT_CITY = "北京";
const FALLBACK_START_POINT: NaviPoint = {
  latitude: 39.908823,
  longitude: 116.39747,
};
const ROUTE_SCENE_OPTIONS: Array<{ key: RouteScene; label: string; icon: keyof typeof FontAwesome.glyphMap }> = [
  { key: "drive", label: "Ô tô", icon: "car" },
  { key: "ride", label: "Xe đạp", icon: "bicycle" },
  { key: "walk", label: "Đi bộ", icon: "male" },
];

function getRouteSceneLabel(scene: RouteScene): string {
  if (scene === "ride") {
    return "Xe đạp";
  }
  if (scene === "walk") {
    return "Đi bộ";
  }
  return "Ô tô";
}

function createWaypointField(index: number): WaypointField {
  return {
    key: `waypoint-${index}`,
    input: "",
    selected: null,
  };
}

function createFieldValue(point: NaviPoint, label: string, address?: string): RouteFieldValue {
  return {
    label,
    point,
    address,
  };
}

async function withTimeout<T>(task: Promise<T>, timeoutMs: number, fallback: () => T): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;

  try {
    return await Promise.race([
      task,
      new Promise<T>((resolve) => {
        timer = setTimeout(() => resolve(fallback()), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

function getBestPointLabel(result: Awaited<ReturnType<typeof reGeocode>>, fallback: string): string {
  return (
    result.pois[0]?.name ||
    result.addressComponent.building ||
    result.addressComponent.neighborhood ||
    result.formattedAddress ||
    fallback
  );
}

async function resolvePointPresentation(
  point: NaviPoint,
  fallback: string
): Promise<{ label: string; address?: string; city?: string }> {
  try {
    const result = await withTimeout(
      reGeocode({
        location: point,
        radius: 200,
        requireExtension: true,
      }),
      2500,
      () => ({
        formattedAddress: fallback,
        addressComponent: {
          province: "",
          city: "",
          district: "",
          township: "",
          neighborhood: "",
          building: "",
          cityCode: "",
          adCode: "",
          streetNumber: {
            street: "",
            number: "",
            direction: "",
            distance: 0,
          },
          businessAreas: [],
        },
        pois: [],
        roads: [],
        roadCrosses: [],
        aois: [],
      })
    );

    return {
      label: getBestPointLabel(result, fallback),
      address: result.formattedAddress || undefined,
      city: result.addressComponent.city || undefined,
    };
  } catch {
    return { label: fallback };
  }
}

function getRouteTone(
  route: RouteResult,
  mainPathIndex: number,
  index: number,
  scene: RouteScene
): RouteTone {
  if (index === mainPathIndex) {
    return "primary";
  }
  if (scene !== "drive") {
    if (route.distance <= 4000) {
      return "warm";
    }
    return "neutral";
  }
  if (route.trafficLightCount != null && route.trafficLightCount <= 6) {
    return "success";
  }
  if (route.distance <= 6000) {
    return "warm";
  }
  return "neutral";
}

function buildRouteLabel(
  route: RouteResult,
  index: number,
  mainPathIndex: number,
  shortestDistanceIndex: number,
  fewestLightsIndex: number,
  scene: RouteScene
): string {
  if (index === mainPathIndex) {
    return "Khuyến nghị";
  }
  if (scene !== "drive") {
    if (index === shortestDistanceIndex) {
      return "Quãng đường ngắn";
    }
    return `Phương án ${index + 1}`;
  }
  if (index === fewestLightsIndex) {
    return "Ít đèn tín hiệu";
  }
  if (index === shortestDistanceIndex) {
    return "Quãng đường ngắn";
  }
  if ((route.tollCost ?? 0) === 0) {
    return "Ít phí";
  }
  return `Phương án ${index + 1}`;
}

function buildMarkerText(kind: "from" | "to" | "waypoint", index?: number): string {
  if (kind === "from") {
    return "Đ";
  }
  if (kind === "to") {
    return "C";
  }
  return String((index ?? 0) + 1);
}

function resolveTipTitle(tip: InputTip): string {
  return tip.name?.trim() || tip.address?.trim() || "Địa điểm chưa đặt tên";
}

function resolveTipSubtitle(tip: InputTip): string {
  return [tip.address, tip.adName, tip.cityName].filter(Boolean).join(" · ");
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function inverseLerp(value: number, min: number, max: number): number {
  if (max <= min) {
    return 0;
  }
  return clamp((value - min) / (max - min), 0, 1);
}

function mix(start: number, end: number, amount: number): number {
  return start + (end - start) * amount;
}

function getRouteDistanceScale(distanceMeters: number): number {
  if (!Number.isFinite(distanceMeters) || distanceMeters <= 0) {
    return 0;
  }

  const logDistance = Math.log10(distanceMeters + 1);
  return inverseLerp(logDistance, Math.log10(1500), Math.log10(1500000));
}

function getRouteLineStyle(
  variant: "selected" | "other",
  zoom: number
) {
  const compact =
    zoom < 11.8
      ? {
          selectedHaloWidth: 11.5,
          selectedMainWidth: 8.2,
          selectedCoreWidth: 5,
          fallbackHaloWidth: 4.8,
          fallbackMainWidth: 2.6,
        }
      : zoom < 12.8
        ? {
            selectedHaloWidth: 13.5,
            selectedMainWidth: 9.6,
            selectedCoreWidth: 5.9,
            fallbackHaloWidth: 5.4,
            fallbackMainWidth: 3.1,
          }
        : {
            selectedHaloWidth: 15.5,
            selectedMainWidth: 11.4,
            selectedCoreWidth: 7,
            fallbackHaloWidth: 6.2,
            fallbackMainWidth: 3.6,
          };

  if (variant === "selected") {
    return {
      haloColor: "rgba(255,255,255,0.96)",
      mainColor: "#5b8cff",
      coreColor: null,
      haloWidth: compact.selectedHaloWidth,
      mainWidth: compact.selectedMainWidth,
      coreWidth: 0,
    };
  }

  return {
    haloColor: "rgba(255,255,255,0.42)",
    mainColor: "rgba(148,163,184,0.58)",
    coreColor: null,
    haloWidth: compact.fallbackHaloWidth,
    mainWidth: compact.fallbackMainWidth,
    coreWidth: 0,
  };
}

function getPreviewFitOptions(selectedRoute: RouteResult | null) {
  if (!selectedRoute) {
    return {
      duration: 380,
      paddingFactor: 0.62,
      minZoom: 11.7,
      maxZoom: 14.2,
      singlePointZoom: 15.8,
    };
  }

  const distance = selectedRoute.distance ?? 0;
  const routeScale = getRouteDistanceScale(distance);

  return {
    duration: Math.round(mix(420, 520, routeScale)),
    paddingFactor: mix(0.5, 1.08, routeScale),
    minZoom: mix(12.2, 4.2, routeScale),
    maxZoom: mix(17, 8.8, routeScale),
    singlePointZoom: mix(15.8, 14.8, routeScale),
  };
}

function getPreviewBounds(points: NaviPoint[]) {
  const latitudes = points.map((point) => point.latitude);
  const longitudes = points.map((point) => point.longitude);
  const north = Math.max(...latitudes);
  const south = Math.min(...latitudes);
  const east = Math.max(...longitudes);
  const west = Math.min(...longitudes);

  return {
    north,
    south,
    east,
    west,
    center: {
      latitude: (north + south) / 2,
      longitude: (east + west) / 2,
    },
  };
}

const MERCATOR_MAX_LATITUDE = 85.05112878;
const MERCATOR_TILE_SIZE = 256;

function projectToWorldPixel(point: NaviPoint, zoom: number) {
  const scale = MERCATOR_TILE_SIZE * 2 ** zoom;
  const latitude = clamp(point.latitude, -MERCATOR_MAX_LATITUDE, MERCATOR_MAX_LATITUDE);
  const sinLatitude = Math.sin((latitude * Math.PI) / 180);

  return {
    x: ((point.longitude + 180) / 360) * scale,
    y:
      (0.5 -
        Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI)) *
      scale,
  };
}

function unprojectWorldPixel(pixel: { x: number; y: number }, zoom: number): NaviPoint {
  const scale = MERCATOR_TILE_SIZE * 2 ** zoom;
  const longitude = (pixel.x / scale) * 360 - 180;
  const mercatorY = 0.5 - pixel.y / scale;
  const latitude =
    (90 -
      (360 * Math.atan(Math.exp(-mercatorY * 2 * Math.PI))) / Math.PI);

  return {
    latitude: clamp(latitude, -MERCATOR_MAX_LATITUDE, MERCATOR_MAX_LATITUDE),
    longitude,
  };
}

function getViewportAdjustedTarget(
  center: NaviPoint,
  zoom: number,
  windowWidth: number,
  windowHeight: number,
  topBlocked: number,
  bottomBlocked: number
): NaviPoint {
  const visibleHeight = windowHeight - topBlocked - bottomBlocked;
  if (visibleHeight <= 0) {
    return center;
  }

  const screenCenter = {
    x: windowWidth / 2,
    y: windowHeight / 2,
  };
  const visibleCenter = {
    x: windowWidth / 2,
    y: topBlocked + visibleHeight / 2,
  };
  const centerPixel = projectToWorldPixel(center, zoom);

  return unprojectWorldPixel(
    {
      x: centerPixel.x + screenCenter.x - visibleCenter.x,
      y: centerPixel.y + screenCenter.y - visibleCenter.y,
    },
    zoom
  );
}

export default function RoutePickerExampleScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const mapRef = React.useRef<MapViewRef>(null);
  const naviRef = React.useRef<ExpoGaodeMapNaviViewRef>(null);
  const activeTokenRef = React.useRef<number | null>(null);
  const waypointSeedRef = React.useRef(2);

  const [bootstrapping, setBootstrapping] = React.useState(true);
  const [planning, setPlanning] = React.useState(false);
  const [tipLoading, setTipLoading] = React.useState(false);
  const [city, setCity] = React.useState(DEFAULT_CITY);
  const [statusText, setStatusText] = React.useState("Đang khởi tạo bản đồ và tìm kiếm");
  const [fromInput, setFromInput] = React.useState("");
  const [fromSelection, setFromSelection] = React.useState<RouteFieldValue | null>(null);
  const [toInput, setToInput] = React.useState("");
  const [toSelection, setToSelection] = React.useState<RouteFieldValue | null>(null);
  const [waypoints, setWaypoints] = React.useState<WaypointField[]>([createWaypointField(1)]);
  const [activeFieldId, setActiveFieldId] = React.useState<string | null>(null);
  const [tips, setTips] = React.useState<InputTip[]>([]);
  const [routeResult, setRouteResult] = React.useState<IndependentRouteResult | null>(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = React.useState(0);
  const [showNaviView, setShowNaviView] = React.useState(false);
  const [previewZoom, setPreviewZoom] = React.useState(13.2);
  const [routeScene, setRouteScene] = React.useState<RouteScene>("drive");
  const [requestedNaviType, setRequestedNaviType] = React.useState(
    Platform.OS === "android" ? 0 : 1
  );
  const [topPanelHeight, setTopPanelHeight] = React.useState(0);
  const [bottomPanelHeight, setBottomPanelHeight] = React.useState(0);

  useHideNavigationHeader(true);

  const routeSceneLabel = React.useMemo(() => getRouteSceneLabel(routeScene), [routeScene]);
  const routes = routeResult?.routes ?? [];
  const selectedRoute = routes[selectedRouteIndex] ?? null;
  const previewRoutes = React.useMemo(
    () =>
      selectedRoute
        ? [
            {
              route: selectedRoute,
              index: selectedRouteIndex,
            },
          ]
        : [],
    [selectedRoute, selectedRouteIndex]
  );
  const supportsEmbeddedNavigation = true;
  const usesTravelView = Platform.OS === "android" && routeScene !== "drive";
  const selectedPoints = React.useMemo(() => {
    const points: NaviPoint[] = [];
    if (fromSelection?.point) {
      points.push(fromSelection.point);
    }
    for (const waypoint of waypoints) {
      if (waypoint.selected?.point) {
        points.push(waypoint.selected.point);
      }
    }
    if (toSelection?.point) {
      points.push(toSelection.point);
    }
    return points;
  }, [fromSelection, toSelection, waypoints]);

  const previewPoints = React.useMemo(() => {
    if (selectedRoute) {
      return getRoutePreviewPoints(selectedRoute);
    }
    return selectedPoints;
  }, [selectedPoints, selectedRoute]);

  const activeKeyword = React.useMemo(() => {
    if (!activeFieldId) {
      return "";
    }
    if (activeFieldId === "from") {
      return fromInput;
    }
    if (activeFieldId === "to") {
      return toInput;
    }
    const waypoint = waypoints.find((item) => item.key === activeFieldId);
    return waypoint?.input ?? "";
  }, [activeFieldId, fromInput, toInput, waypoints]);

  const shortestDistanceIndex = React.useMemo(() => {
    if (routes.length === 0) {
      return -1;
    }
    return routes.reduce((bestIndex, route, index, currentRoutes) => {
      if (bestIndex < 0) {
        return index;
      }
      return route.distance < currentRoutes[bestIndex].distance ? index : bestIndex;
    }, -1);
  }, [routes]);

  const fewestLightsIndex = React.useMemo(() => {
    if (routes.length === 0) {
      return -1;
    }
    return routes.reduce((bestIndex, route, index, currentRoutes) => {
      const routeLights = route.trafficLightCount ?? Number.MAX_SAFE_INTEGER;
      if (bestIndex < 0) {
        return index;
      }
      const bestLights = currentRoutes[bestIndex].trafficLightCount ?? Number.MAX_SAFE_INTEGER;
      return routeLights < bestLights ? index : bestIndex;
    }, -1);
  }, [routes]);

  React.useEffect(() => {
    ExpoGaodeMapModule.setPrivacyConfig({
        hasShow: true,
        hasContainsPrivacy: true,
        hasAgree: true,
      });
    return () => {
      if (activeTokenRef.current != null) {
        void clearIndependentRoute({ token: activeTokenRef.current }).catch(() => {});
      }
    };
  }, []);

  const focusSelectedPoint = React.useCallback(async (point: NaviPoint) => {
    if (!mapRef.current) {
      return;
    }

    try {
      const camera = await mapRef.current.getCameraPosition();
      await mapRef.current.moveCamera(
        {
          target: point,
          zoom: Math.max(camera.zoom ?? 0, 13.5),
          bearing: camera.bearing,
          tilt: camera.tilt,
        },
        260
      );
    } catch {
      // ignore focus failures and keep the current map state
    }
  }, []);

  const fitPreviewCamera = React.useCallback(async () => {
    if (!mapRef.current || previewPoints.length === 0 || windowWidth <= 0 || windowHeight <= 0) {
      return;
    }

    const fitOptions = getPreviewFitOptions(selectedRoute);
    const topBlocked = Math.max(insets.top, 12) + topPanelHeight + 10;
    const bottomBlocked = Math.max(insets.bottom, 14) + bottomPanelHeight + 10;
    const visibleHeight = windowHeight - topBlocked - bottomBlocked;

    if (previewPoints.length === 1) {
      const camera = await mapRef.current.getCameraPosition();
      await mapRef.current.moveCamera(
        {
          target: previewPoints[0],
          zoom: fitOptions.singlePointZoom,
          bearing: camera.bearing,
          tilt: camera.tilt,
        },
        fitOptions.duration
      );
      return;
    }

    if (visibleHeight <= 120) {
      return;
    }

    const viewportWidthPx = Math.max(1, windowWidth);
    const viewportHeightPx = Math.max(1, visibleHeight);
    const routeDistance = selectedRoute?.distance ?? 0;
    const routeScale = getRouteDistanceScale(routeDistance);
    const blockedRatio = Math.min(0.5, (topBlocked + bottomBlocked) / Math.max(windowHeight, 1));
    const bounds = getPreviewBounds(previewPoints);
    const latitudeSpan = Math.max(0.0001, bounds.north - bounds.south);
    const longitudeSpan = Math.max(0.0001, bounds.east - bounds.west);
    const routeVerticality = latitudeSpan / longitudeSpan;
    const viewportAspectRatio = viewportHeightPx / Math.max(viewportWidthPx, 1);
    const distancePaddingBoost = mix(0, 0.05, routeScale);
    const androidVerticalPaddingBoost = Math.max(0, Math.min(0.05, (routeVerticality - 1.2) * 0.035));
    const androidTallScreenBoost = Math.max(0, Math.min(0.025, (viewportAspectRatio - 1.45) * 0.035));
    const platformPaddingScale = Platform.select({
      ios: 0.125,
      android: 0.08 + androidVerticalPaddingBoost + androidTallScreenBoost,
      default: 0.1,
    }) ?? 0.1;
    const paddingScale = Math.max(
      0.055,
      Math.min(
        0.28,
        platformPaddingScale +
          blockedRatio * (Platform.OS === "android" ? 0.115 : 0.1) +
          distancePaddingBoost
      )
    );
    const paddingPx = Math.round(Math.min(viewportWidthPx, viewportHeightPx) * paddingScale);
    const rawZoom = ExpoGaodeMapModule.calculateFitZoom(previewPoints, {
      viewportWidthPx,
      viewportHeightPx,
      paddingPx,
      minZoom: fitOptions.minZoom,
      maxZoom: fitOptions.maxZoom,
    });
    const zoomBias = Platform.select({
      ios: 0,
      android: Math.max(
        -0.015,
        Math.min(0.06, 0.03 + blockedRatio * 0.045 - androidVerticalPaddingBoost * 0.55)
      ),
      default: 0,
    }) ?? 0;
    const zoom = Math.min(fitOptions.maxZoom, Math.max(fitOptions.minZoom, rawZoom + zoomBias));
    const target = getViewportAdjustedTarget(
      bounds.center,
      zoom,
      windowWidth,
      windowHeight,
      topBlocked,
      bottomBlocked
    );
    const camera = await mapRef.current.getCameraPosition();

    await mapRef.current.moveCamera(
      {
        target,
        zoom,
        bearing: camera.bearing,
        tilt: camera.tilt,
      },
      fitOptions.duration
    );
  }, [
    bottomPanelHeight,
    insets.bottom,
    insets.top,
    previewPoints,
    selectedRoute,
    topPanelHeight,
    windowHeight,
    windowWidth,
  ]);

  React.useEffect(() => {
    if (activeFieldId) {
      return;
    }

    if (!routeResult || !selectedRoute) {
      return;
    }

    if (previewPoints.length === 0) {
      return;
    }

    let cancelled = false;

    const timer = setTimeout(() => {
      void (async () => {
        try {
          await fitPreviewCamera();
        } catch {
          try {
            await mapRef.current?.fitToCoordinates(
              previewPoints,
              getPreviewFitOptions(selectedRoute)
            );

            if (cancelled) {
              return;
            }
          } catch {
            // keep silent; planning UI already handles route errors elsewhere
          }
        }
      })();
    }, 160);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [activeFieldId, fitPreviewCamera, previewPoints, routeResult, selectedRoute]);

  React.useEffect(() => {
    if (!activeFieldId) {
      setTips([]);
      setTipLoading(false);
      return;
    }

    const keyword = activeKeyword.trim();
    if (keyword.length < 2) {
      setTips([]);
      setTipLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setTipLoading(true);
      void getInputTips({
        keyword,
        city: city.trim() || undefined,
      })
        .then((result) => {
          console.log('result',JSON.stringify(result));
          setTips((result.tips ?? []).filter((tip) => tip.location != null));
        })
        .catch(() => {
          setTips([]);
        })
        .finally(() => {
          setTipLoading(false);
        });
    }, 260);

    return () => clearTimeout(timer);
  }, [activeFieldId, activeKeyword, city]);

  React.useEffect(() => {
    if (!showNaviView || !routeResult) {
      return;
    }

    const timer = setTimeout(() => {
      const selectedRouteId =
        typeof selectedRoute?.routeId === "number"
          ? selectedRoute.routeId
          : typeof selectedRoute?.id === "number"
            ? selectedRoute.id
            : undefined;
      void naviRef.current
        ?.startNavigationWithIndependentPath(routeResult.token, {
          routeId: selectedRouteId,
          routeIndex: selectedRouteIndex,
          naviType: requestedNaviType,
        })
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : String(error);
          setShowNaviView(false);
          if (
            Platform.OS === "android" &&
            message.includes("AMap SDK không chấp nhận nhóm tuyến này")
          ) {
            Alert.alert(
              "Android hiện chưa hỗ trợ dẫn đường độc lập mô phỏng tại đây",
              "Nhóm tuyến độc lập này bị AMap Android SDK hiện tại từ chối khi khởi động dẫn đường mô phỏng. Hãy chuyển về GPS navigation để kiểm tra trang chọn tuyến tùy chỉnh."
            );
            return;
          }
          Alert.alert("Không thể khởi động dẫn đường", message);
        });
    }, 360);

    return () => clearTimeout(timer);
  }, [requestedNaviType, routeResult, selectedRoute, selectedRouteIndex, showNaviView]);

  React.useEffect(() => {
    const initialize = async () => {
      try {
        ExpoGaodeMapModule.setPrivacyConfig({
          hasShow: true,
          hasContainsPrivacy: true,
          hasAgree: true,
        })
        setBootstrapping(true);
        initSearch();
        const currentLocation = await withTimeout(
          ensureDemoSdkReady(),
          6000,
          () => FALLBACK_START_POINT
        );
        setBootstrapping(false);
        const demoScenario = buildDemoScenario(currentLocation);

        const [fromMeta, waypointMeta, toMeta] = await Promise.all([
          resolvePointPresentation(currentLocation, "Vị trí của tôi"),
          resolvePointPresentation(demoScenario.waypoints[0], "Điểm trung gian mẫu"),
          resolvePointPresentation(demoScenario.to, "Điểm đến mẫu"),
        ]);

        setCity(fromMeta.city || DEFAULT_CITY);
        setFromSelection(createFieldValue(currentLocation, fromMeta.label, fromMeta.address));
        setFromInput(fromMeta.label);
        setToSelection(createFieldValue(demoScenario.to, toMeta.label, toMeta.address));
        setToInput(toMeta.label);
        setWaypoints([
          {
            key: "waypoint-1",
            input: waypointMeta.label,
            selected: createFieldValue(
              demoScenario.waypoints[0],
              waypointMeta.label,
              waypointMeta.address
            ),
          },
        ]);
        waypointSeedRef.current = 2;
        setStatusText(
          currentLocation === FALLBACK_START_POINT
            ? "Định vị phản hồi chậm nên đã chuyển sang điểm mẫu mặc định tại Bắc Kinh. Bạn cũng có thể chọn thủ công điểm đầu, điểm cuối và điểm trung gian rồi lập tuyến."
            : "Đã điền một tuyến mẫu. Bạn có thể lập tuyến ngay hoặc thay bằng điểm đầu, điểm cuối và nhiều điểm trung gian của riêng mình."
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setStatusText(`Khởi tạo thất bại: ${message}`);
        Alert.alert("Khởi tạo thất bại", message);
      } finally {
        setBootstrapping(false);
      }
    };

    void initialize();
  }, []);

  const resetRoutePreview = React.useCallback(async () => {
    const token = activeTokenRef.current;
    activeTokenRef.current = null;
    setRouteResult(null);
    setSelectedRouteIndex(0);

    if (token != null) {
      await clearIndependentRoute({ token }).catch(() => {});
    }
  }, []);

  const setWaypointInput = React.useCallback((waypointKey: string, value: string) => {
    setWaypoints((current) =>
      current.map((item) =>
        item.key === waypointKey
          ? {
              ...item,
              input: value,
              selected: item.selected?.label === value ? item.selected : null,
            }
          : item
      )
    );
    if (routeResult) {
      void resetRoutePreview();
    }
  }, [resetRoutePreview, routeResult]);

  const handleSwap = React.useCallback(() => {
    setFromInput(toInput);
    setFromSelection(toSelection);
    setToInput(fromInput);
    setToSelection(fromSelection);
    void resetRoutePreview();
    setStatusText("Đã hoán đổi điểm đầu và điểm cuối. Hãy lập tuyến lại để cập nhật các tuyến ứng viên.");
  }, [fromInput, fromSelection, resetRoutePreview, toInput, toSelection]);

  const handleRouteSceneChange = React.useCallback(
    (nextScene: RouteScene) => {
      if (nextScene === routeScene) {
        return;
      }
      setShowNaviView(false);
      void resetRoutePreview();
      setRouteScene(nextScene);
      setStatusText(`Đã chuyển sang chế độ ${getRouteSceneLabel(nextScene)}. Hãy lập tuyến lại.`);
    },
    [resetRoutePreview, routeScene]
  );

  const applySelectedField = React.useCallback(
    (fieldId: string, value: RouteFieldValue) => {
      Keyboard.dismiss();
      void resetRoutePreview();
      if (fieldId === "from") {
        setFromInput(value.label);
        setFromSelection(value);
      } else if (fieldId === "to") {
        setToInput(value.label);
        setToSelection(value);
      } else {
        setWaypoints((current) =>
          current.map((item) =>
            item.key === fieldId
              ? {
                  ...item,
                  input: value.label,
                  selected: value,
                }
              : item
          )
        );
      }
      setActiveFieldId(null);
      setTips([]);
      void focusSelectedPoint(value.point);
    },
    [focusSelectedPoint, resetRoutePreview]
  );

  const handleTipPress = React.useCallback(
    (tip: InputTip) => {
      if (!activeFieldId || !tip.location) {
        return;
      }

      applySelectedField(activeFieldId, {
        label: resolveTipTitle(tip),
        address: tip.address,
        poiId: tip.id,
        point: tip.location,
      });
      setStatusText(`Đã chọn ${resolveTipTitle(tip)}. Bạn có thể lập tuyến lại.`);
    },
    [activeFieldId, applySelectedField]
  );

  const handleUseCurrentLocation = React.useCallback(async () => {
    try {
      setBootstrapping(true);
      const currentLocation = await ensureDemoSdkReady();
      const presentation = await resolvePointPresentation(currentLocation, "Vị trí của tôi");
      setFromSelection(createFieldValue(currentLocation, presentation.label, presentation.address));
      setFromInput(presentation.label);
      void resetRoutePreview();
      void focusSelectedPoint(currentLocation);
      setCity(presentation.city || city);
      setStatusText("Điểm đầu đã được cập nhật thành vị trí hiện tại.");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      Alert.alert("Không lấy được vị trí", message);
    } finally {
      setBootstrapping(false);
    }
  }, [city, focusSelectedPoint, resetRoutePreview]);

  const handleAddWaypoint = React.useCallback(() => {
    if (routeResult) {
      void resetRoutePreview();
      setStatusText("Đã thêm điểm trung gian. Hãy chọn điểm mới rồi lập tuyến lại.");
    }

    setWaypoints((current) => {
      if (current.length >= MAX_WAYPOINTS) {
        return current;
      }
      const nextField = createWaypointField(waypointSeedRef.current);
      waypointSeedRef.current += 1;
      return [...current, nextField];
    });
  }, [resetRoutePreview, routeResult]);

  const handleRemoveWaypoint = React.useCallback((waypointKey: string) => {
    setWaypoints((current) => current.filter((item) => item.key !== waypointKey));
    void resetRoutePreview();
    if (activeFieldId === waypointKey) {
      setActiveFieldId(null);
      setTips([]);
    }
  }, [activeFieldId, resetRoutePreview]);

  const planRoutes = React.useCallback(async () => {
    if (!fromSelection?.point || !toSelection?.point) {
      Alert.alert("Thiếu thông tin", "Hãy chọn điểm đầu và điểm cuối trước.");
      return;
    }

    const typedButUnresolvedWaypoint = waypoints.find(
      (item) => item.input.trim().length > 0 && !item.selected?.point
    );
    if (typedButUnresolvedWaypoint) {
      Alert.alert("Điểm trung gian chưa được xác nhận", "Hãy chọn điểm trung gian từ gợi ý tìm kiếm hoặc xóa dòng này.");
      return;
    }

    try {
      Keyboard.dismiss();
      setPlanning(true);
      await resetRoutePreview();

      const routePoints = {
        from: {
          ...fromSelection.point,
          name: fromSelection.label,
          poiId: fromSelection.poiId,
        },
        to: {
          ...toSelection.point,
          name: toSelection.label,
          poiId: toSelection.poiId,
        },
        waypoints: waypoints
          .map((item) => item.selected)
          .filter((item): item is RouteFieldValue => Boolean(item?.point))
          .map((item) => ({
            ...item.point,
            name: item.label,
            poiId: item.poiId,
          })),
      };

      const result =
        routeScene === "drive"
          ? await independentDriveRoute({
              ...routePoints,
              avoidCongestion: true,
              restriction: false,
            })
          : routeScene === "ride"
            ? await independentRideRoute({
                ...routePoints,
                multiple: true,
              })
            : await independentWalkRoute({
                ...routePoints,
                multiple: true,
              });

      activeTokenRef.current = result.token;
      setRouteResult(result);
      setSelectedRouteIndex(result.mainPathIndex);
      const sceneSpecificHint =
        Platform.OS === "android" && routeScene !== "drive"
            ? "Khi bắt đầu dẫn đường trên Android, hệ thống sẽ chuyển sang chế độ tương thích TravelView."
            : "";
      setStatusText(
        result.count > 1
          ? `Đã tạo ${result.count} tuyến ${routeSceneLabel}. Các thẻ bên dưới chuyển giữa những tuyến thực tế có thể dẫn đường. ${sceneSpecificHint}`
          : `Hiện chỉ có 1 tuyến ${routeSceneLabel}, thường do ràng buộc tuyến chặt hoặc SDK không trả thêm phương án. ${sceneSpecificHint}`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setStatusText(`Lập tuyến thất bại: ${message}`);
      Alert.alert("Lập tuyến thất bại", message);
    } finally {
      setPlanning(false);
    }
  }, [
    fromSelection,
    resetRoutePreview,
    routeScene,
    routeSceneLabel,
    supportsEmbeddedNavigation,
    toSelection,
    waypoints,
  ]);

  const stopNavigation = React.useCallback(async () => {
    try {
      await naviRef.current?.stopNavigation();
    } catch {}
    setShowNaviView(false);
  }, []);

  const handleStartNavigation = React.useCallback(() => {
    if (!selectedRoute) {
      return;
    }
    setShowNaviView(true);
  }, [selectedRoute]);

  const selectedWaypointMarkers = waypoints
    .map((item) => item.selected)
    .filter((item): item is RouteFieldValue => Boolean(item?.point))
    .map((item, index) => ({
      latitude: item.point.latitude,
      longitude: item.point.longitude,
      title: `Điểm trung gian ${index + 1}`,
    }));
  const selectedWaypointCount = selectedWaypointMarkers.length;
  const previewMarkerRevision = routeResult?.token ?? "draft";
  const shouldUseCustomWaypointMarkersOnAndroid =
    Platform.OS === "android" && routeScene === "drive" && selectedWaypointMarkers.length > 0;

  if (showNaviView && routeResult) {
    return (
      <EmbeddedNaviView
        ref={naviRef}
        style={styles.naviContainer}
        naviType={requestedNaviType}
        isNaviTravelView={usesTravelView}
        customWaypointMarkers={
          shouldUseCustomWaypointMarkersOnAndroid ? selectedWaypointMarkers : undefined
        }
        routeMarkerVisible={
          shouldUseCustomWaypointMarkersOnAndroid
            ? {
                showStartEndVia: false,
                showFootFerry: true,
                showForbidden: true,
                showRouteStartIcon: false,
                showRouteEndIcon: false,
              }
            : undefined
        }
        showCamera
        enableVoice
        showTrafficBar={routeScene === "drive"}
        showTrafficButton={routeScene === "drive"}
        showDriveCongestion={routeScene === "drive"}
        showTrafficLightView={routeScene === "drive"}
        laneInfoVisible={routeScene === "drive"}
        modeCrossDisplay={routeScene === "drive"}
        eyrieCrossDisplay={routeScene === "drive"}
        secondActionVisible={routeScene === "drive"}
        backupOverlayVisible={false}
        showBackupRoute={false}
        naviStatusBarEnabled={false}
        driveViewEdgePadding={{ top: 12, left: 0, right: 0, bottom: 120 }}
        screenAnchor={{ x: 0.5, y: 0.78 }}
        onExitPress={() => void stopNavigation()}
        onNaviEnd={() => {
          void stopNavigation();
        }}
        onCalculateRouteFailure={(event) => {
          Alert.alert("Dẫn đường thất bại", event.nativeEvent.error || "Lỗi không xác định");
          void stopNavigation();
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.mapView}
        initialCameraPosition={{
          target: fromSelection?.point ?? {
            latitude: 39.908823,
            longitude: 116.39747,
          },
          zoom: 13,
        }}
        trafficEnabled
        myLocationEnabled
        compassEnabled
        onCameraIdle={(event) => {
          setPreviewZoom(event.nativeEvent.cameraPosition.zoom ?? 13.2);
        }}
      >
        {previewRoutes.map(({ route, index }) => {
          const line = getRouteLineStyle("selected", previewZoom);
          const points = getRoutePreviewPoints(route);
          const zBase = 24;

          return (
            <React.Fragment key={`route-${route.id}-${index}`}>
              <Polyline
                points={points}
                strokeWidth={line.haloWidth}
                strokeColor={line.haloColor}
                zIndex={zBase}
              />
              <Polyline
                points={points}
                strokeWidth={line.mainWidth}
                strokeColor={line.mainColor}
                zIndex={zBase + 1}
              />
              {line.coreColor ? (
                <Polyline
                  points={points}
                  strokeWidth={line.coreWidth}
                  strokeColor={line.coreColor}
                  zIndex={zBase + 2}
                />
              ) : null}
            </React.Fragment>
          );
        })}

        {fromSelection?.point ? (
          <Marker
            key={`from-${fromSelection.point.latitude}-${fromSelection.point.longitude}`}
            position={fromSelection.point}
            anchor={{ x: 0.5, y: 0.92 }}
            zIndex={50}
            cacheKey={`preview-from-${fromSelection.point.latitude.toFixed(6)}-${fromSelection.point.longitude.toFixed(6)}`}
          >
            <View style={[styles.mapMarker, styles.startMarker]}>
              <Text style={styles.mapMarkerText}>{buildMarkerText("from")}</Text>
            </View>
          </Marker>
        ) : null}

        {waypoints.map((waypoint, index) =>
          waypoint.selected?.point ? (
            <Marker
              key={`marker-${waypoint.key}-${previewMarkerRevision}-${waypoint.selected.point.latitude}-${waypoint.selected.point.longitude}`}
              position={waypoint.selected.point}
              anchor={{ x: 0.5, y: 1 }}
              zIndex={60 + index}
              cacheKey={`preview-waypoint-${waypoint.key}-${previewMarkerRevision}-${waypoint.selected.point.latitude.toFixed(6)}-${waypoint.selected.point.longitude.toFixed(6)}`}
            >
              <View style={styles.waypointBadge}>
                <View style={styles.waypointBadgeBody}>
                  <Text style={styles.waypointBadgeText}>
                    {selectedWaypointCount > 1 ? `TG${index + 1}` : "Trung gian"}
                  </Text>
                </View>
              </View>
            </Marker>
          ) : null
        )}

        {toSelection?.point ? (
          <Marker
            key={`to-${toSelection.point.latitude}-${toSelection.point.longitude}`}
            position={toSelection.point}
            anchor={{ x: 0.5, y: 0.92 }}
            zIndex={55}
            cacheKey={`preview-to-${toSelection.point.latitude.toFixed(6)}-${toSelection.point.longitude.toFixed(6)}`}
          >
            <View style={[styles.mapMarker, styles.endMarker]}>
              <Text style={styles.mapMarkerText}>{buildMarkerText("to")}</Text>
            </View>
          </Marker>
        ) : null}
      </MapView>
      <View
        pointerEvents="box-none"
        style={[
          styles.overlayLayer,
          {
            paddingTop: Math.max(insets.top, 12),
            paddingBottom: Math.max(insets.bottom, 14),
          },
        ]}
      >
        <View
          style={styles.topPanel}
          onLayout={(event) => {
            setTopPanelHeight(event.nativeEvent.layout.height);
          }}
        >
          <View style={styles.formCard}>
              <View style={styles.formCardHeader}>
                <Pressable style={styles.inlineBackButton} onPress={() => router.back()} hitSlop={8}>
                  <FontAwesome name="angle-left" size={18} color="#0f3c83" />
                  <Text style={styles.inlineBackText}>Quay lại</Text>
                </Pressable>
              <Text style={styles.formTitle}>Chọn tuyến tùy chỉnh</Text>
                <Pressable style={styles.swapButton} onPress={handleSwap}>
                  <FontAwesome name="exchange" size={14} color="#0f3c83" />
                </Pressable>
              </View>

              <View style={styles.sceneSwitchRow}>
                {ROUTE_SCENE_OPTIONS.map((option) => {
                  const isActive = option.key === routeScene;
                  return (
                    <Pressable
                      key={option.key}
                      style={[styles.sceneChip, isActive && styles.sceneChipActive]}
                      onPress={() => handleRouteSceneChange(option.key)}
                    >
                      <FontAwesome
                        name={option.icon}
                        size={12}
                        color={isActive ? "#ffffff" : "#5a7188"}
                      />
                      <Text style={[styles.sceneChipText, isActive && styles.sceneChipTextActive]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.fieldRow}>
              <View style={[styles.fieldDot, styles.startDot]} />
              <TextInput
                value={fromInput}
                onChangeText={(value) => {
                  setFromInput(value);
                  if (fromSelection?.label !== value) {
                    setFromSelection(null);
                  }
                }}
                onFocus={() => setActiveFieldId("from")}
                placeholder="Nhập điểm đầu"
                placeholderTextColor="#8aa0b8"
                style={styles.input}
              />
              <Pressable style={styles.inlineAction} onPress={() => void handleUseCurrentLocation()}>
                <FontAwesome name="location-arrow" size={14} color="#1269ff" />
              </Pressable>
            </View>

            {waypoints.map((waypoint, index) => (
              <View key={waypoint.key} style={styles.fieldRow}>
                <View style={[styles.fieldDot, styles.waypointDot]} />
                <TextInput
                  value={waypoint.input}
                  onChangeText={(value) => setWaypointInput(waypoint.key, value)}
                  onFocus={() => setActiveFieldId(waypoint.key)}
                  placeholder={`Nhập điểm trung gian ${index + 1}`}
                  placeholderTextColor="#8aa0b8"
                  style={styles.input}
                />
                <Pressable
                  style={styles.inlineAction}
                  onPress={() => handleRemoveWaypoint(waypoint.key)}
                >
                  <FontAwesome name="minus" size={14} color="#5b728b" />
                </Pressable>
              </View>
            ))}

            <View style={styles.fieldRow}>
              <View style={[styles.fieldDot, styles.endDot]} />
              <TextInput
                value={toInput}
                onChangeText={(value) => {
                  setToInput(value);
                  if (toSelection?.label !== value) {
                    setToSelection(null);
                  }
                }}
                onFocus={() => setActiveFieldId("to")}
                placeholder="Nhập điểm cuối"
                placeholderTextColor="#8aa0b8"
                style={styles.input}
              />
              <View style={styles.inlineActionPlaceholder} />
            </View>

            <View style={styles.formActions}>
              <View style={styles.cityChip}>
                <FontAwesome name="map-marker" size={12} color="#4a6178" />
                <TextInput
                  value={city}
                  onChangeText={setCity}
                  placeholder="Thành phố"
                  placeholderTextColor="#7b91a7"
                  style={styles.cityInput}
                />
              </View>

              <Pressable
                style={[
                  styles.secondaryAction,
                  waypoints.length >= MAX_WAYPOINTS && styles.disabledButton,
                ]}
                onPress={handleAddWaypoint}
                disabled={waypoints.length >= MAX_WAYPOINTS}
              >
                <FontAwesome name="plus" size={12} color="#0f3c83" />
                <Text style={styles.secondaryActionText}>Điểm trung gian</Text>
              </Pressable>

              <Pressable
                style={[styles.primaryAction, planning && styles.disabledButton]}
                onPress={() =>  planRoutes()}
                disabled={planning}
              >
                <FontAwesome name="road" size={13} color="#ffffff" />
                <Text style={styles.primaryActionText}>
                  {planning ? "Đang lập tuyến" : "Lập tuyến"}
                </Text>
              </Pressable>
            </View>
          </View>

          {activeFieldId && (tipLoading || tips.length > 0 || activeKeyword.trim().length >= 2) ? (
            <View style={styles.suggestionCard}>
              <View style={styles.suggestionHeader}>
                <Text style={styles.suggestionTitle}>Gợi ý địa điểm</Text>
                {tipLoading ? <Text style={styles.suggestionHint}>Đang tìm kiếm...</Text> : null}
              </View>

              {tips.length > 0 ? (
                <ScrollView
                  style={styles.tipList}
                  contentContainerStyle={styles.tipListContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled
                >
                  {tips.map((tip) => (
                    <Pressable
                      key={`${tip.id}-${tip.name}`}
                      style={styles.tipRow}
                      onPress={() => handleTipPress(tip)}
                    >
                      <View style={styles.tipIcon}>
                        <FontAwesome name="search" size={12} color="#1269ff" />
                      </View>
                      <View style={styles.tipBody}>
                        <Text style={styles.tipTitle}>{resolveTipTitle(tip)}</Text>
                        <Text style={styles.tipSubtitle}>{resolveTipSubtitle(tip)}</Text>
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              ) : (
                <Text style={styles.emptySuggestionText}>
                  {tipLoading ? "Đang tải gợi ý..." : "Nhập thêm ít nhất 2 ký tự hoặc thử từ khóa khác."}
                </Text>
              )}
            </View>
          ) : null}
        </View>
        <View
          style={styles.bottomPanel}
          onLayout={(event) => {
            setBottomPanelHeight(event.nativeEvent.layout.height);
          }}
        >
          <View style={styles.routeSheet}>
            <View style={styles.routeSheetHeader}>
              <View style={styles.inlineStatus}>
                <Text style={styles.inlineStatusLabel}>Trạng thái</Text>
                <Text numberOfLines={1} style={styles.inlineStatusText}>
                  {statusText}
                </Text>
              </View>

              {supportsEmbeddedNavigation ? (
                <View style={styles.compactModeRow}>
                  <Pressable
                    style={[styles.compactModeChip, requestedNaviType === 0 && styles.modeChipActive]}
                    onPress={() => setRequestedNaviType(0)}
                  >
                    <Text
                      style={[styles.compactModeText, requestedNaviType === 0 && styles.modeChipTextActive]}
                    >
                      GPS
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.compactModeChip, requestedNaviType === 1 && styles.modeChipActive]}
                    onPress={() => setRequestedNaviType(1)}
                  >
                    <Text
                      style={[styles.compactModeText, requestedNaviType === 1 && styles.modeChipTextActive]}
                    >
                      Mô phỏng
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.previewOnlyHint}>
                  <Text style={styles.previewOnlyHintText}>Chế độ hiện tại mới hỗ trợ xem trước</Text>
                </View>
              )}
            </View>

            {routes.length > 0 ? (
              <View style={styles.routeCardRow}>
                {routes.slice(0, 3).map((route, index) => {
                  const tone = getRouteTone(
                    route,
                    routeResult?.mainPathIndex ?? 0,
                    index,
                    routeScene
                  );
                  const label = buildRouteLabel(
                    route,
                    index,
                    routeResult?.mainPathIndex ?? 0,
                    shortestDistanceIndex,
                    fewestLightsIndex,
                    routeScene
                  );

                  return (
                    <Pressable
                      key={`route-card-${route.id}-${index}`}
                      style={[
                        styles.routeCard,
                        tone === "primary" && styles.routeCardPrimary,
                        tone === "success" && styles.routeCardSuccess,
                        tone === "warm" && styles.routeCardWarm,
                        index === selectedRouteIndex && styles.routeCardSelected,
                      ]}
                      onPress={() => setSelectedRouteIndex(index)}
                    >
                      <Text style={styles.routeLabel}>{label}</Text>
                      <Text style={styles.routeDuration}>{formatDuration(route.duration)}</Text>
                      <Text style={styles.routeDistance}>{formatDistance(route.distance)}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <View style={styles.routePlaceholder}>
                <Text style={styles.routePlaceholderTitle}>Các tuyến ứng viên sẽ hiển thị tại đây</Text>
                <Text style={styles.routePlaceholderBody}>
                  Trang này hỗ trợ điểm đầu, điểm cuối và nhiều điểm trung gian. Sau khi lập tuyến, tối đa 3 tuyến có thể chuyển đổi sẽ hiển thị bên dưới.
                </Text>
              </View>
            )}

            <View style={styles.footerRow}>
              <View style={styles.routeMetaBlock}>
                <Text style={styles.routeMetaTitle}>
                  {selectedRoute ? `Đã chọn ${buildRouteLabel(
                    selectedRoute,
                    selectedRouteIndex,
                    routeResult?.mainPathIndex ?? 0,
                    shortestDistanceIndex,
                    fewestLightsIndex,
                    routeScene
                  )}` : "Chưa lập tuyến"}
                </Text>
                <Text style={styles.routeMetaText}>
                  {selectedRoute
                    ? routeScene === "drive"
                      ? [
                          selectedRoute.trafficLightCount != null
                            ? `${selectedRoute.trafficLightCount} đèn tín hiệu`
                            : null,
                          selectedRoute.tollCost != null
                            ? `Phí khoảng ${selectedRoute.tollCost.toFixed(0)} CNY`
                            : null,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "Chưa có tóm tắt bổ sung cho tuyến này"
                      : [
                          `Xem trước tuyến ${routeSceneLabel} độc lập`,
                          supportsEmbeddedNavigation
                            ? "Có thể tiếp tục vào dẫn đường nhúng ngay trên trang"
                            : "Trang hiện hỗ trợ xem trước; luồng dẫn đường sẽ được hoàn thiện sau",
                        ].join(" · ")
                    : "Hãy lập tuyến trước, sau đó chọn một phương án để bắt đầu dẫn đường."}
                </Text>
              </View>

              <Pressable
                style={[
                  styles.startButton,
                  !selectedRoute && styles.disabledButton,
                  selectedRoute && !supportsEmbeddedNavigation && styles.previewOnlyButton,
                ]}
                onPress={handleStartNavigation}
                disabled={!selectedRoute}
              >
                <Text style={styles.startButtonText}>
                  {selectedRoute && !supportsEmbeddedNavigation ? "Chỉ xem trước" : "Bắt đầu dẫn đường"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#d8e6f6",
  },
  mapView:{
     ...StyleSheet.absoluteFill,
  },
  overlayLayer: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 10,
    gap: 10,
  },
  naviContainer: {
    flex: 1,
  },
  topPanel: {
    gap: 6,
  },
  swapButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef5ff",
    borderWidth: 1,
    borderColor: "#d3e3fb",
  },
  formCard: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.94)",
    gap: 2,
    boxShadow: "0px 10px 24px rgba(15, 23, 42, 0.08)",
  },
  formCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  sceneSwitchRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  sceneChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 13,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "#f3f7fb",
  },
  sceneChipActive: {
    backgroundColor: "#1269ff",
  },
  sceneChipText: {
    color: "#5a7188",
    fontSize: 11,
    fontWeight: "700",
  },
  sceneChipTextActive: {
    color: "#ffffff",
  },
  inlineBackButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    width: 72,
  },
  inlineBackText: {
    color: "#0f3c83",
    fontSize: 13,
    fontWeight: "800",
  },
  formTitle: {
    flex: 1,
    textAlign: "center",
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "800",
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    // minHeight: 38,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#d5e1ef",
  },
  fieldDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  startDot: {
    backgroundColor: "#22c55e",
  },
  waypointDot: {
    backgroundColor: "#f59e0b",
  },
  endDot: {
    backgroundColor: "#ef4444",
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: "#0f172a",
    paddingVertical: 8,
  },
  inlineAction: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eaf2ff",
  },
  inlineActionPlaceholder: {
    width: 24,
    height: 24,
  },
  formActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  cityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minWidth: 68,
    borderRadius: 13,
    backgroundColor: "#f3f7fb",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  cityInput: {
    minWidth: 36,
    fontSize: 11,
    fontWeight: "600",
    color: "#294867",
  },
  secondaryAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 13,
    backgroundColor: "#f3f7fb",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  secondaryActionText: {
    color: "#0f3c83",
    fontSize: 11,
    fontWeight: "700",
  },
  primaryAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: "auto",
    borderRadius: 15,
    backgroundColor: "#1269ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  primaryActionText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
  },
  disabledButton: {
    opacity: 0.5,
  },
  suggestionCard: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(247,251,255,0.96)",
  },
  tipList: {
    maxHeight: 180,
  },
  tipListContent: {
    paddingBottom: 2,
  },
  suggestionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  suggestionTitle: {
    color: "#0f172a",
    fontSize: 13,
    fontWeight: "800",
  },
  suggestionHint: {
    color: "#5f7590",
    fontSize: 11,
    fontWeight: "600",
  },
  tipRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#dbe7f5",
  },
  tipIcon: {
    width: 24,
    alignItems: "center",
    paddingTop: 2,
  },
  tipBody: {
    flex: 1,
  },
  tipTitle: {
    color: "#10233d",
    fontSize: 14,
    fontWeight: "700",
  },
  tipSubtitle: {
    marginTop: 3,
    color: "#60758d",
    fontSize: 11,
    lineHeight: 16,
  },
  emptySuggestionText: {
    color: "#60758d",
    fontSize: 11,
    lineHeight: 16,
    paddingVertical: 6,
  },
  bottomPanel: {
    gap: 0,
  },
  modeChipActive: {
    backgroundColor: "#0f3c83",
  },
  modeChipTextActive: {
    color: "#ffffff",
  },
  routeSheet: {
    borderRadius: 24,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.96)",
    gap: 10,
    boxShadow: "0px 12px 28px rgba(15, 23, 42, 0.1)",
  },
  routeSheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inlineStatus: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "#0f172a",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inlineStatusLabel: {
    color: "#9fc7ff",
    fontSize: 9,
    fontWeight: "700",
  },
  inlineStatusText: {
    marginTop: 2,
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
  },
  compactModeRow: {
    flexDirection: "row",
    gap: 6,
  },
  previewOnlyHint: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#eef3f8",
  },
  previewOnlyHintText: {
    color: "#5a7188",
    fontSize: 10,
    fontWeight: "700",
  },
  compactModeChip: {
    minWidth: 54,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "#eef3f8",
  },
  compactModeText: {
    color: "#45627f",
    fontSize: 11,
    fontWeight: "700",
  },
  routeCardRow: {
    flexDirection: "row",
    gap: 8,
  },
  routeCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: "#eef3f8",
    borderWidth: 1,
    borderColor: "#d7e3ef",
  },
  routeCardPrimary: {
    backgroundColor: "#edf4ff",
  },
  routeCardSuccess: {
    backgroundColor: "#edf9f0",
  },
  routeCardWarm: {
    backgroundColor: "#fff5e9",
  },
  routeCardSelected: {
    borderColor: "#1269ff",
    boxShadow: "0px 10px 24px rgba(11, 79, 194, 0.16)",
  },
  routeLabel: {
    color: "#50667c",
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
  },
  routeDuration: {
    marginTop: 8,
    color: "#12243c",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  routeDistance: {
    marginTop: 4,
    color: "#5c7288",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  routePlaceholder: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: "#f1f6fb",
  },
  routePlaceholderTitle: {
    color: "#10233d",
    fontSize: 13,
    fontWeight: "800",
  },
  routePlaceholderBody: {
    marginTop: 6,
    color: "#60758d",
    fontSize: 11,
    lineHeight: 16,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  routeMetaBlock: {
    flex: 1,
  },
  routeMetaTitle: {
    color: "#10233d",
    fontSize: 13,
    fontWeight: "800",
  },
  routeMetaText: {
    marginTop: 4,
    color: "#60758d",
    fontSize: 11,
    lineHeight: 16,
  },
  startButton: {
    minWidth: 116,
    borderRadius: 16,
    // paddingHorizontal: 18,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1269ff",
  },
  previewOnlyButton: {
    backgroundColor: "#6d86ad",
  },
  startButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
  mapMarker: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  mapMarkerText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
  },
  startMarker: {
    backgroundColor: "#22c55e",
  },
  waypointMarker: {
    backgroundColor: "#f59e0b",
  },
  endMarker: {
    backgroundColor: "#ef4444",
  },
  waypointBadge: {
    alignItems: "center",
  },
  waypointBadgeBody: {
    minWidth: 44,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#2f67ff",
    borderWidth: 2,
    borderColor: "#ffffff",
    boxShadow: "0px 4px 10px rgba(21, 53, 127, 0.18)",
  },
  waypointBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
  },
});
