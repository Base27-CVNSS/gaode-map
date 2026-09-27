import * as React from 'react';
import Marker from '../components/overlays/Marker';
import Polygon from '../components/overlays/Polygon';
import Polyline from '../components/overlays/Polyline';
import {
  flattenGeoJSON,
  type GeoJSONData,
  type GeoJSONFeature,
  type GeoJSONLayerStyle,
  type GeoJSONProperties,
  type GeoJSONStyleResolver,
} from './geojson';

export interface GeoJSONLayerProps<P extends GeoJSONProperties = GeoJSONProperties> {
  data: GeoJSONData<P>;
  visible?: boolean;
  style?: GeoJSONStyleResolver<P>;
  onFeaturePress?: (feature: GeoJSONFeature<P>, featureIndex: number) => void;
}

const DEFAULT_STYLE: GeoJSONLayerStyle = {
  marker: { pinColor: 'blue' },
  polyline: { strokeColor: '#1677FF', strokeWidth: 4 },
  polygon: {
    strokeColor: '#1677FF',
    strokeWidth: 2,
    fillColor: '#221677FF',
  },
};

function resolveFeatureTitle<P extends GeoJSONProperties>(feature: GeoJSONFeature<P>) {
  const value = feature.properties?.name ?? feature.properties?.title;
  return typeof value === 'string' ? value : undefined;
}

/**
 * Declarative GeoJSON renderer backed by expo-gaode-map native overlays.
 */
export function GeoJSONLayer<P extends GeoJSONProperties = GeoJSONProperties>({
  data,
  visible = true,
  style,
  onFeaturePress,
}: GeoJSONLayerProps<P>) {
  const parts = React.useMemo(() => flattenGeoJSON(data), [data]);

  if (!visible) return null;

  return (
    <>
      {parts.map((part, featureIndex) => {
        const resolved =
          typeof style === 'function'
            ? style(part.feature, featureIndex) ?? DEFAULT_STYLE
            : style ?? DEFAULT_STYLE;

        if (resolved.visible === false) return null;

        const markerStyle = { ...DEFAULT_STYLE.marker, ...resolved.marker };
        const polylineStyle = { ...DEFAULT_STYLE.polyline, ...resolved.polyline };
        const polygonStyle = { ...DEFAULT_STYLE.polygon, ...resolved.polygon };

        switch (part.geometry.type) {
          case 'Point':
            return (
              <Marker
                key={part.key}
                {...markerStyle}
                title={markerStyle.title ?? resolveFeatureTitle(part.feature)}
                position={part.geometry.coordinates}
                onMarkerPress={() => onFeaturePress?.(part.feature, featureIndex)}
              />
            );
          case 'MultiPoint':
            return (
              <React.Fragment key={part.key}>
                {part.geometry.coordinates.map((position, index) => (
                  <Marker
                    key={`${part.key}.p${index}`}
                    {...markerStyle}
                    title={markerStyle.title ?? resolveFeatureTitle(part.feature)}
                    position={position}
                    onMarkerPress={() => onFeaturePress?.(part.feature, featureIndex)}
                  />
                ))}
              </React.Fragment>
            );
          case 'LineString':
            return (
              <Polyline
                key={part.key}
                {...polylineStyle}
                points={part.geometry.coordinates}
                onPolylinePress={() => onFeaturePress?.(part.feature, featureIndex)}
              />
            );
          case 'MultiLineString':
            return (
              <React.Fragment key={part.key}>
                {part.geometry.coordinates.map((points, index) => (
                  <Polyline
                    key={`${part.key}.l${index}`}
                    {...polylineStyle}
                    points={points}
                    onPolylinePress={() => onFeaturePress?.(part.feature, featureIndex)}
                  />
                ))}
              </React.Fragment>
            );
          case 'Polygon':
            return (
              <Polygon
                key={part.key}
                {...polygonStyle}
                points={part.geometry.coordinates}
                onPolygonPress={() => onFeaturePress?.(part.feature, featureIndex)}
              />
            );
          case 'MultiPolygon':
            return (
              <React.Fragment key={part.key}>
                {part.geometry.coordinates.map((rings, index) => (
                  <Polygon
                    key={`${part.key}.m${index}`}
                    {...polygonStyle}
                    points={rings}
                    onPolygonPress={() => onFeaturePress?.(part.feature, featureIndex)}
                  />
                ))}
              </React.Fragment>
            );
        }
      })}
    </>
  );
}

export default React.memo(GeoJSONLayer) as typeof GeoJSONLayer;
