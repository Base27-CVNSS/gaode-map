import { isGeoJSONData, loadGeoJSON } from '../GeoJSONSource';

describe('GeoJSONSource', () => {
  it('accepts supported GeoJSON families', () => {
    expect(isGeoJSONData({
      type: 'FeatureCollection',
      features: [],
    })).toBe(true);

    expect(isGeoJSONData({
      type: 'Point',
      coordinates: [106.7, 10.78],
    })).toBe(true);

    expect(isGeoJSONData({ type: 'Unknown', coordinates: [] })).toBe(false);
  });

  it('loads and validates GeoJSON through an injected fetcher', async () => {
    const fetcher = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        type: 'FeatureCollection',
        features: [],
      }),
    }));

    const result = await loadGeoJSON('https://example.test/data.geojson', {
      headers: { Authorization: 'Bearer test' },
      fetcher,
    });

    expect(result.type).toBe('FeatureCollection');
    expect(fetcher).toHaveBeenCalledWith(
      'https://example.test/data.geojson',
      { headers: { Authorization: 'Bearer test' } }
    );
  });

  it('rejects HTTP failures and invalid payloads', async () => {
    await expect(
      loadGeoJSON('https://example.test/fail.geojson', {
        fetcher: async () => ({
          ok: false,
          status: 503,
          json: async () => ({}),
        }),
      })
    ).rejects.toThrow('HTTP 503');

    await expect(
      loadGeoJSON('https://example.test/not-geojson.json', {
        fetcher: async () => ({
          ok: true,
          status: 200,
          json: async () => ({ hello: 'world' }),
        }),
      })
    ).rejects.toThrow('not a supported GeoJSON');
  });
});
