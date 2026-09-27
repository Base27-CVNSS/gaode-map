import type { CameraUpdate } from '../types';

export interface CameraMoveTarget {
  moveCamera(position: CameraUpdate, duration?: number): Promise<void>;
}

export interface CameraKeyframe {
  camera: CameraUpdate;
  duration?: number;
  hold?: number;
}

export interface PlayCameraTimelineOptions {
  loop?: boolean;
  controller?: CameraTimelineController;
  onFrame?: (frame: CameraKeyframe, index: number) => void;
}

export class CameraTimelineController {
  private stopped = false;

  get cancelled(): boolean {
    return this.stopped;
  }

  cancel(): void {
    this.stopped = true;
  }
}

function wait(ms: number, controller?: CameraTimelineController): Promise<void> {
  if (ms <= 0 || controller?.cancelled) return Promise.resolve();

  return new Promise((resolve) => {
    const startedAt = Date.now();
    const tick = () => {
      if (controller?.cancelled || Date.now() - startedAt >= ms) {
        resolve();
        return;
      }
      setTimeout(tick, Math.min(50, ms));
    };
    tick();
  });
}

/**
 * Play a camera flyover using the existing native moveCamera() API.
 *
 * Cancellation stops future keyframes. A native animation already in progress
 * is allowed to finish because MapView does not expose an animation cancel API.
 */
export async function playCameraTimeline(
  target: CameraMoveTarget,
  frames: CameraKeyframe[],
  options: PlayCameraTimelineOptions = {}
): Promise<void> {
  if (frames.length === 0) return;

  do {
    for (let index = 0; index < frames.length; index += 1) {
      if (options.controller?.cancelled) return;
      const frame = frames[index];
      if (!frame) continue;

      options.onFrame?.(frame, index);
      await target.moveCamera(frame.camera, frame.duration ?? 0);

      if (options.controller?.cancelled) return;
      await wait(frame.hold ?? 0, options.controller);
    }
  } while (options.loop && !options.controller?.cancelled);
}
