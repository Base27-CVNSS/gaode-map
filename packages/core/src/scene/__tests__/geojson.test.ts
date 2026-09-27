import {
  collectGeoJSONPositions,
  flattenGeoJSON,
  type GeoJSONFeatureCollection,
} from '../geojson';

describe('GeoJSON scene utilities', () => {
  const data: GeoJSONFeatureCollection = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        id: 'point',
        properties: { name: 'A' },
        geometry: { type: 'Point', coordinates: [106.7, 10.78] },
      },
      {
        type: 'Feature',
        id: 'multi-line',
        properties: {},
        geometry: {
          type: 'MultiLineString',
          coordinates: [
            [[106.7, 10.78], [106.71, 10.79]],
            [[106.72, 10.8], [106.73, 10.81]],
          ],
        },
      },
      {
        type: 'Feature',
        id: 'collection',
        properties: {},
        geometry: {
          type: 'GeometryCollection',
          geometries: [
            { type: 'Point', coordinates: [106.74, 10.82] },
            {
              type: 'Polygon',
              coordinates: [[
                [106.74, 10.82],
                [106.75, 10.82],
                [106.75, 10.83],
                [106.74, 10.82],
              ]],
            },
          ],
        },
      },
    ],
  };

  it('flattens geometry collections but preserves multi geometries', () => {
    expect(flattenGeoJSON(data).map((part) => part.geometry.type)).toEqual([
      'Point',
      'MultiLineString',
      'Point',
      'Polygon',
    ]);
  });

  it('collects all GeoJSON positions', () => {
    const positions = collectGeoJSONPositions(data);
    expect(positions).toHaveLength(10);
    expect(positions[0]).toEqual([106.7, 10.78]);
  });
});
