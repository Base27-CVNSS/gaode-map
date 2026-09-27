import {
  CameraTimelineController,
  playCameraTimeline,
  type CameraMoveTarget,
} from '../CameraTimeline';

describe('camera timeline', () => {
  it('plays keyframes in order', async () => {
    const target: CameraMoveTarget = {
      moveCamera: jest.fn(async () => undefined),
    };

    await playCameraTimeline(target, [
      { camera: { zoom: 11 }, duration: 0 },
      { camera: { zoom: 14, tilt: 45 }, duration: 0 },
    ]);

    expect(target.moveCamera).toHaveBeenNthCalledWith(1, { zoom: 11 }, 0);
    expect(target.moveCamera).toHaveBeenNthCalledWith(2, { zoom: 14, tilt: 45 }, 0);
  });

  it('honors cancellation before playback', async () => {
    const target: CameraMoveTarget = {
      moveCamera: jest.fn(async () => undefined),
    };
    const controller = new CameraTimelineController();
    controller.cancel();

    await playCameraTimeline(
      target,
      [{ camera: { zoom: 12 }, duration: 0 }],
      { controller }
    );

    expect(target.moveCamera).not.toHaveBeenCalled();
  });
});
