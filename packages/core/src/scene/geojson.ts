import type {
  MarkerProps,
  PolygonProps,
  PolylineProps,
} from '../types/overlays.types';

export type GeoJSONProperties = Record<string, unknown>;
export type GeoJSONPosition = [number, number] | [number, number, number] | number[];

export interface GeoJSONPoint {
  type: 'Point';
  coordinates: GeoJSONPosition;
}

export interface GeoJSONMultiPoint {
  type: 'MultiPoint';
  coordinates: GeoJSONPosition[];
}

export interface GeoJSONLineString {
  type: 'LineString';
  coordinates: GeoJSONPosition[];
}

export interface GeoJSONMultiLineString {
  type: 'MultiLineString';
  coordinates: GeoJSONPosition[][];
}

export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: GeoJSONPosition[][];
}

export interface GeoJSONMultiPolygon {
  type: 'MultiPolygon';
  coordinates: GeoJSONPosition[][][];
}

export interface GeoJSONGeometryCollection {
  type: 'GeometryCollection';
  geometries: GeoJSONGeometry[];
}

export type GeoJSONSimpleGeometry =
  | GeoJSONPoint
  | GeoJSONMultiPoint
  | GeoJSONLineString
  | GeoJSONMultiLineString
  | GeoJSONPolygon
  | GeoJSONMultiPolygon;

export type GeoJSONGeometry = GeoJSONSimpleGeometry | GeoJSONGeometryCollection;

export interface GeoJSONFeature<P extends GeoJSONProperties = GeoJSONProperties> {
  type: 'Feature';
  id?: string | number;
  properties?: P | null;
  geometry: GeoJSONGeometry | null;
}

export interface GeoJSONFeatureCollection<P extends GeoJSONProperties = GeoJSONProperties> {
  type: 'FeatureCollection';
  features: Array<GeoJSONFeature<P>>;
}

export type GeoJSONData<P extends GeoJSONProperties = GeoJSONProperties> =
  | GeoJSONFeatureCollection<P>
  | GeoJSONFeature<P>
  | GeoJSONGeometry;

export interface GeoJSONLayerStyle {
  visible?: boolean;
  marker?: Partial<Omit<MarkerProps, 'position' | 'onMarkerPress'>>;
  polyline?: Partial<Omit<PolylineProps, 'points' | 'onPolylinePress'>>;
  polygon?: Partial<Omit<PolygonProps, 'points' | 'onPolygonPress'>>;
}

export type GeoJSONStyleResolver<P extends GeoJSONProperties = GeoJSONProperties> =
  | GeoJSONLayerStyle
  | ((feature: GeoJSONFeature<P>, featureIndex: number) => GeoJSONLayerStyle | undefined);

export interface FlattenedGeoJSONPart<P extends GeoJSONProperties = GeoJSONProperties> {
  key: string;
  feature: GeoJSONFeature<P>;
  geometry: GeoJSONSimpleGeometry;
}

function featureKey<P extends GeoJSONProperties>(
  feature: GeoJSONFeature<P>,
  fallback: string
): string {
  return feature.id == null ? fallback : String(feature.id);
}

function flattenGeometry<P extends GeoJSONProperties>(
  geometry: GeoJSONGeometry,
  feature: GeoJSONFeature<P>,
  keyBase: string,
  output: Array<FlattenedGeoJSONPart<P>>
) {
  if (geometry.type === 'GeometryCollection') {
    geometry.geometries.forEach((child, index) => {
      flattenGeometry(child, feature, `${keyBase}.g${index}`, output);
    });
    return;
  }

  output.push({ key: keyBase, feature, geometry });
}

/**
 * Convert FeatureCollection / Feature / Geometry into a flat list of renderable geometries.
 * This intermediate representation is engine-neutral and keeps GeoJSON coordinate order.
 */
export function flattenGeoJSON<P extends GeoJSONProperties = GeoJSONProperties>(
  data: GeoJSONData<P>
): Array<FlattenedGeoJSONPart<P>> {
  const output: Array<FlattenedGeoJSONPart<P>> = [];

  if (data.type === 'FeatureCollection') {
    data.features.forEach((feature, index) => {
      if (!feature.geometry) return;
      flattenGeometry(
        feature.geometry,
        feature,
        featureKey(feature, `feature-${index}`),
        output
      );
    });
    return output;
  }

  if (data.type === 'Feature') {
    if (!data.geometry) return output;
    flattenGeometry(data.geometry, data, featureKey(data, 'feature-0'), output);
    return output;
  }

  const feature: GeoJSONFeature<P> = {
    type: 'Feature',
    properties: null,
    geometry: data,
  };
  flattenGeometry(data, feature, 'geometry-0', output);
  return output;
}

function collectFromGeometry(geometry: GeoJSONGeometry, output: GeoJSONPosition[]) {
  switch (geometry.type) {
    case 'Point':
      output.push(geometry.coordinates);
      break;
    case 'MultiPoint':
    case 'LineString':
      output.push(...geometry.coordinates);
      break;
    case 'MultiLineString':
    case 'Polygon':
      geometry.coordinates.forEach((line) => output.push(...line));
      break;
    case 'MultiPolygon':
      geometry.coordinates.forEach((polygon) =>
        polygon.forEach((ring) => output.push(...ring))
      );
      break;
    case 'GeometryCollection':
      geometry.geometries.forEach((child) => collectFromGeometry(child, output));
      break;
  }
}

/**
 * Collect every GeoJSON coordinate in [longitude, latitude] order.
 * Useful for fitToCoordinates() and bounds calculations.
 */
export function collectGeoJSONPositions<P extends GeoJSONProperties = GeoJSONProperties>(
  data: GeoJSONData<P>
): GeoJSONPosition[] {
  const output: GeoJSONPosition[] = [];

  if (data.type === 'FeatureCollection') {
    data.features.forEach((feature) => {
      if (feature.geometry) collectFromGeometry(feature.geometry, output);
    });
  } else if (data.type === 'Feature') {
    if (data.geometry) collectFromGeometry(data.geometry, output);
  } else {
    collectFromGeometry(data, output);
  }

  return output;
}
