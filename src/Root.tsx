import {Composition} from 'remotion';
import {HongKong, TOTAL_FRAMES} from './HongKong';

export function RemotionRoot() {
  return (
    <Composition
      id="HongKong"
      component={HongKong}
      durationInFrames={TOTAL_FRAMES}
      fps={30}
      width={1920}
      height={1080}
    />
  );
}
