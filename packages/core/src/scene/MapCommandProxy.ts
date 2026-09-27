import type {
  CameraPosition,
  CameraUpdate,
  LatLng,
  LatLngPoint,
  MapViewRef,
  Point,
} from '../types';
import type { FitToCoordinatesOptions } from '../types/route-playback.types';

type CommandRunner<T> = (ref: MapViewRef) => Promise<T>;

interface PendingCommand {
  run: CommandRunner<unknown>;
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
}

/**
 * Typed runtime proxy for MapView.
 * Commands issued before attach() are queued and flushed in order.
 */
export class MapCommandProxy {
  private ref: MapViewRef | null = null;
  private queue: PendingCommand[] = [];
  private flushing = false;

  get attached(): boolean {
    return this.ref != null;
  }

  get pendingCount(): number {
    return this.queue.length;
  }

  attach(ref: MapViewRef): void {
    this.ref = ref;
    void this.flush();
  }

  detach(ref?: MapViewRef): void {
    if (!ref || this.ref === ref) this.ref = null;
  }

  clearPending(reason: unknown = new Error('MapCommandProxy queue cleared')): void {
    const pending = this.queue.splice(0);
    pending.forEach((command) => command.reject(reason));
  }

  private dispatch<T>(run: CommandRunner<T>): Promise<T> {
    if (this.ref && !this.flushing && this.queue.length === 0) {
      return run(this.ref);
    }

    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        run: run as CommandRunner<unknown>,
        resolve: (value) => resolve(value as T),
        reject,
      });
      void this.flush();
    });
  }

  private async flush(): Promise<void> {
    if (this.flushing || !this.ref) return;
    this.flushing = true;

    try {
      while (this.ref && this.queue.length > 0) {
        const command = this.queue.shift();
        if (!command) break;

        try {
          const value = await command.run(this.ref);
          command.resolve(value);
        } catch (error) {
          command.reject(error);
        }
      }
    } finally {
      this.flushing = false;
      if (this.ref && this.queue.length > 0) void this.flush();
    }
  }

  moveCamera(position: CameraUpdate, duration?: number): Promise<void> {
    return this.dispatch((ref) => ref.moveCamera(position, duration));
  }

  setCenter(center: LatLngPoint, animated?: boolean): Promise<void> {
    return this.dispatch((ref) => ref.setCenter(center, animated));
  }

  setZoom(zoom: number, animated?: boolean): Promise<void> {
    return this.dispatch((ref) => ref.setZoom(zoom, animated));
  }

  fitToCoordinates(points: LatLngPoint[], options?: FitToCoordinatesOptions): Promise<void> {
    return this.dispatch((ref) => ref.fitToCoordinates(points, options));
  }

  getCameraPosition(): Promise<CameraPosition> {
    return this.dispatch((ref) => ref.getCameraPosition());
  }

  takeSnapshot(): Promise<string> {
    return this.dispatch((ref) => ref.takeSnapshot());
  }

  getLatLng(point: Point): Promise<LatLng> {
    return this.dispatch((ref) => ref.getLatLng(point));
  }
}

export function createMapCommandProxy(): MapCommandProxy {
  return new MapCommandProxy();
}
