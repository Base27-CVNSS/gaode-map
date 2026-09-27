import type { GeoJSONData, GeoJSONProperties } from './geojson';

export interface GeoJSONResponseLike {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

export type GeoJSONFetcher = (
  url: string,
  init?: { headers?: Record<string, string> }
) => Promise<GeoJSONResponseLike>;

export interface LoadGeoJSONOptions {
  headers?: Record<string, string>;
  fetcher?: GeoJSONFetcher;
}

function hasObjectShape(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}

/**
 * Shallow runtime guard for the GeoJSON object families supported by GeoJSONLayer.
 * Geometry coordinate depth is intentionally left to the renderer/type system.
 */
export function isGeoJSONData(value: unknown): value is GeoJSONData {
  if (!hasObjectShape(value) || typeof value.type !== 'string') return false;

  switch (value.type) {
    case 'FeatureCollection':
      return Array.isArray(value.features);
    case 'Feature':
      return 'geometry' in value;
    case 'GeometryCollection':
      return Array.isArray(value.geometries);
    case 'Point':
    case 'MultiPoint':
    case 'LineString':
    case 'MultiLineString':
    case 'Polygon':
    case 'MultiPolygon':
      return Array.isArray(value.coordinates);
    default:
      return false;
  }
}

function defaultFetcher(): GeoJSONFetcher {
  const candidate = (globalThis as unknown as { fetch?: GeoJSONFetcher }).fetch;
  if (!candidate) {
    throw new Error('Global fetch() is unavailable. Pass options.fetcher explicitly.');
  }
  return candidate.bind(globalThis);
}

/**
 * Load GeoJSON from an HTTP(S) endpoint and validate the top-level payload.
 */
export async function loadGeoJSON<P extends GeoJSONProperties = GeoJSONProperties>(
  url: string,
  options: LoadGeoJSONOptions = {}
): Promise<GeoJSONData<P>> {
  if (!url || typeof url !== 'string') {
    throw new Error('GeoJSON URL must be a non-empty string.');
  }

  const response = await (options.fetcher ?? defaultFetcher())(url, {
    headers: options.headers,
  });

  if (!response.ok) {
    throw new Error(`GeoJSON request failed with HTTP ${response.status}.`);
  }

  const payload = await response.json();
  if (!isGeoJSONData(payload)) {
    throw new Error('Response is not a supported GeoJSON object.');
  }

  return payload as GeoJSONData<P>;
}
