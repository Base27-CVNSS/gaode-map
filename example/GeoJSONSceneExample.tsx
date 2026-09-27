import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  collectGeoJSONPositions,
  createMapCommandProxy,
  GeoJSONLayer,
  LayerGroup,
  MapUI,
  MapView,
  type GeoJSONFeatureCollection,
  type MapViewRef,
} from 'expo-gaode-map';

const HCMC_SCENE: GeoJSONFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'center',
      properties: { name: 'Trung tâm TP.HCM', kind: 'poi' },
      geometry: { type: 'Point', coordinates: [106.7009, 10.7769] },
    },
    {
      type: 'Feature',
      id: 'corridor',
      properties: { name: 'Hành lang minh họa', kind: 'route' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [106.6908, 10.7715],
          [106.7009, 10.7769],
          [106.7116, 10.7828],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'zone',
      properties: { name: 'Vùng GeoJSON minh họa', kind: 'zone' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [106.6962, 10.7732],
          [106.7057, 10.7732],
          [106.7066, 10.7811],
          [106.6971, 10.7820],
          [106.6962, 10.7732],
        ]],
      },
    },
  ],
};

const ALL_POINTS = collectGeoJSONPositions(HCMC_SCENE);

export default function GeoJSONSceneExample() {
  const proxy = React.useMemo(() => createMapCommandProxy(), []);
  const [visible, setVisible] = React.useState(true);
  const [selected, setSelected] = React.useState('Chạm vào một đối tượng GeoJSON');

  const attachMap = React.useCallback(
    (ref: MapViewRef | null) => {
      if (ref) proxy.attach(ref);
      else proxy.detach();
    },
    [proxy]
  );

  React.useEffect(() => {
    void proxy.fitToCoordinates(ALL_POINTS, {
      paddingPx: 70,
      duration: 450,
      minZoom: 11,
      maxZoom: 16,
    });
  }, [proxy]);

  return (
    <MapView
      ref={attachMap}
      style={styles.map}
      buildingsEnabled
      trafficEnabled
      initialCameraPosition={{
        target: { latitude: 10.7769, longitude: 106.7009 },
        zoom: 13,
        tilt: 35,
      }}
    >
      <LayerGroup visible={visible}>
        <GeoJSONLayer
          data={HCMC_SCENE}
          style={(feature) => {
            const kind = feature.properties?.kind;
            if (kind === 'route') {
              return {
                polyline: {
                  strokeColor: '#1D4ED8',
                  strokeWidth: 6,
                },
              };
            }
            if (kind === 'zone') {
              return {
                polygon: {
                  strokeColor: '#DC2626',
                  strokeWidth: 2,
                  fillColor: '#33F59E0B',
                },
              };
            }
            return { marker: { pinColor: 'blue' } };
          }}
          onFeaturePress={(feature) => {
            const name = feature.properties?.name;
            setSelected(typeof name === 'string' ? name : 'Đối tượng GeoJSON');
          }}
        />
      </LayerGroup>

      <MapUI>
        <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          <View style={styles.panel}>
            <Text style={styles.title}>GeoJSON Scene</Text>
            <Text style={styles.body}>{selected}</Text>
            <View style={styles.actions}>
              <Pressable style={styles.button} onPress={() => setVisible((value) => !value)}>
                <Text style={styles.buttonText}>{visible ? 'Ẩn lớp' : 'Hiện lớp'}</Text>
              </Pressable>
              <Pressable
                style={styles.button}
                onPress={() =>
                  void proxy.fitToCoordinates(ALL_POINTS, {
                    paddingPx: 70,
                    duration: 400,
                    minZoom: 11,
                    maxZoom: 16,
                  })
                }
              >
                <Text style={styles.buttonText}>Fit GeoJSON</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </MapUI>
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  panel: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 18,
    borderRadius: 18,
    padding: 16,
    backgroundColor: 'rgba(15,23,42,0.92)',
  },
  title: { color: '#fff', fontSize: 18, fontWeight: '800' },
  body: { marginTop: 6, color: '#CBD5E1', fontSize: 13 },
  actions: { marginTop: 12, flexDirection: 'row', gap: 10 },
  button: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#2563EB',
  },
  buttonText: { color: '#fff', fontWeight: '700' },
});
