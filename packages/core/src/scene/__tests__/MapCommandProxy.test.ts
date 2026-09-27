import { MapCommandProxy } from '../MapCommandProxy';
import type { MapViewRef } from '../../types';

function createMapRef(): MapViewRef {
  return {
    moveCamera: jest.fn(async () => undefined),
    getLatLng: jest.fn(async () => ({ latitude: 10, longitude: 106 })),
    setCenter: jest.fn(async () => undefined),
    setZoom: jest.fn(async () => undefined),
    getCameraPosition: jest.fn(async () => ({
      target: { latitude: 10, longitude: 106 },
      zoom: 12,
    })),
    takeSnapshot: jest.fn(async () => 'snapshot.png'),
    fitToCoordinates: jest.fn(async () => undefined),
  };
}

describe('MapCommandProxy', () => {
  it('queues commands until a map ref is attached', async () => {
    const proxy = new MapCommandProxy();
    const ref = createMapRef();

    const centerPromise = proxy.setCenter([106.7, 10.78], true);
    const zoomPromise = proxy.setZoom(15, true);

    expect(proxy.pendingCount).toBe(2);
    proxy.attach(ref);

    await Promise.all([centerPromise, zoomPromise]);

    expect(ref.setCenter).toHaveBeenCalledWith([106.7, 10.78], true);
    expect(ref.setZoom).toHaveBeenCalledWith(15, true);
    expect(proxy.pendingCount).toBe(0);
  });

  it('executes immediately after attach', async () => {
    const proxy = new MapCommandProxy();
    const ref = createMapRef();
    proxy.attach(ref);

    const camera = await proxy.getCameraPosition();
    expect(camera.zoom).toBe(12);
  });
});
