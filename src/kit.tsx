import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';

const anton = loadAnton('normal', {weights: ['400'], subsets: ['latin']});
const mono = loadMono('normal', {weights: ['400', '700'], subsets: ['latin']});

export const FONT = {
  display: anton.fontFamily,
  mono: mono.fontFamily,
  // CJK はレンダリング環境（macOS）のシステムフォントを使う
  serifCJK: '"Songti TC", "Noto Serif TC", "Hiragino Mincho ProN", serif',
  sansCJK: '"Hiragino Sans", "PingFang TC", "Noto Sans JP", sans-serif',
};

export const COLOR = {
  ink: '#0A0A10',
  red: '#E5322D',
  gold: '#F2C14E',
  cream: '#F6F0E6',
  neon: '#FF3E7F',
  cyan: '#38E1FF',
};

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN = Easing.bezier(0.7, 0, 0.84, 0);
export const EASE_IN_OUT = Easing.bezier(0.83, 0, 0.17, 1);

export function progress(
  frame: number,
  start: number,
  duration: number,
  easing: (t: number) => number = EASE_OUT,
) {
  return interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });
}

/** 入場・退場をまとめた 0→1→0 のエンベロープ */
export function envelope(frame: number, inAt: number, outAt: number, dur = 18) {
  return progress(frame, inAt, dur) * (1 - progress(frame, outAt, dur, EASE_IN));
}

// ---------------------------------------------------------------------------
// Background
// ---------------------------------------------------------------------------

type BgProps = {
  src: string;
  duration: number;
  zoomFrom?: number;
  zoomTo?: number;
  panX?: number;
  panY?: number;
  filter?: string;
};

export function KenBurnsBg({
  src,
  duration,
  zoomFrom = 1.06,
  zoomTo = 1.14,
  panX = 0,
  panY = 0,
  filter,
}: BgProps) {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, duration], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.sin),
  });
  const scale = interpolate(t, [0, 1], [zoomFrom, zoomTo]);
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: COLOR.ink}}>
      <Img
        src={staticFile(`bg/${src}`)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale}) translate(${panX * t}px, ${panY * t}px)`,
          filter,
        }}
      />
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Character (chroma keyed PNG sequence, 24fps source)
// ---------------------------------------------------------------------------

const SOURCE_FPS = 24;
const SOURCE_FRAMES = 144;

type CharacterProps = {
  id: string;
  /** キャラ中心の X 座標（px） */
  centerX: number;
  /** 動画フレーム全体の高さ（px）。人物はその約 87% */
  height: number;
  /** 足元の Y 座標（px） */
  footY: number;
  startOffset?: number;
  flip?: boolean;
  tint?: string;
};

export function Character({
  id,
  centerX,
  height,
  footY,
  startOffset = 0,
  flip = false,
  tint = 'none',
}: CharacterProps) {
  const frame = useCurrentFrame();
  const srcFrame = Math.min(
    SOURCE_FRAMES,
    Math.max(1, Math.floor(((frame + startOffset) * SOURCE_FPS) / 30) + 1),
  );
  const width = (height * 960) / 544;
  // ソース動画内で足元はおよそ高さの 93% の位置
  const top = footY - height * 0.93;
  const enter = progress(frame, 4, 26);
  return (
    <AbsoluteFill>
      {/* 接地影 */}
      <div
        style={{
          position: 'absolute',
          left: centerX - height * 0.17,
          top: footY - height * 0.025,
          width: height * 0.34,
          height: height * 0.05,
          borderRadius: '50%',
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 70%)',
          opacity: enter,
        }}
      />
      <Img
        src={staticFile(`chara/${id}/${String(srcFrame).padStart(3, '0')}.png`)}
        style={{
          position: 'absolute',
          left: centerX - width / 2,
          top: top + (1 - enter) * 60,
          width,
          height,
          opacity: enter,
          transform: flip ? 'scaleX(-1)' : undefined,
          filter: `drop-shadow(0 18px 30px rgba(0,0,0,0.35)) ${tint}`,
        }}
      />
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Kinetic type primitives
// ---------------------------------------------------------------------------

type SplitTextProps = {
  text: string;
  start: number;
  stagger?: number;
  duration?: number;
  exitAt?: number;
  style?: React.CSSProperties;
  from?: 'bottom' | 'top';
  rotate?: number;
};

/** 1 文字ずつマスクの下からせり上がる */
export function SplitText({
  text,
  start,
  stagger = 2,
  duration = 22,
  exitAt,
  style,
  from = 'bottom',
  rotate = 8,
}: SplitTextProps) {
  const frame = useCurrentFrame();
  const dir = from === 'bottom' ? 1 : -1;
  return (
    <div style={{display: 'flex', whiteSpace: 'pre', ...style}}>
      {[...text].map((ch, i) => {
        const p = progress(frame, start + i * stagger, duration);
        const out =
          exitAt === undefined ? 0 : progress(frame, exitAt + i * stagger * 0.6, 14, EASE_IN);
        const y = (1 - p) * 110 * dir - out * 110 * dir;
        return (
          <span key={i} style={{display: 'inline-block', overflow: 'hidden', lineHeight: 1}}>
            <span
              style={{
                display: 'inline-block',
                transform: `translateY(${y}%) rotate(${(1 - p) * rotate * dir}deg)`,
                transformOrigin: 'left bottom',
              }}
            >
              {ch}
            </span>
          </span>
        );
      })}
    </div>
  );
}

/** 文字を 1 字ずつフェード＋ブラーで出す（字幕用） */
export function TypeIn({
  text,
  start,
  speed = 1.2,
  exitAt,
  style,
}: {
  text: string;
  start: number;
  speed?: number;
  exitAt?: number;
  style?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();
  const out = exitAt === undefined ? 0 : progress(frame, exitAt, 14, EASE_IN);
  return (
    <div style={{...style, opacity: 1 - out}}>
      {[...text].map((ch, i) => {
        const p = progress(frame, start + i * speed, 10);
        return (
          <span
            key={i}
            style={{
              opacity: p,
              filter: `blur(${(1 - p) * 8}px)`,
              display: 'inline-block',
              transform: `translateY(${(1 - p) * 10}px)`,
              whiteSpace: 'pre',
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
}

/** 横に流れる巨大アウトライン文字 */
export function Marquee({
  text,
  y,
  size,
  speed,
  stroke = 'rgba(255,255,255,0.55)',
  fill = 'transparent',
  opacity = 1,
  font = FONT.display,
}: {
  text: string;
  y: number;
  size: number;
  speed: number;
  stroke?: string;
  fill?: string;
  opacity?: number;
  font?: string;
}) {
  const frame = useCurrentFrame();
  const fadeIn = progress(frame, 0, 24);
  return (
    <div
      style={{
        position: 'absolute',
        top: y,
        left: 0,
        whiteSpace: 'nowrap',
        fontFamily: font,
        fontSize: size,
        lineHeight: 1,
        color: fill,
        WebkitTextStroke: `2px ${stroke}`,
        transform: `translateX(${-400 + frame * speed}px)`,
        opacity: opacity * fadeIn,
        letterSpacing: '0.02em',
      }}
    >
      {`${text}  ${text}  ${text}  ${text}`}
    </div>
  );
}

/** 伸びる罫線 */
export function Rule({
  start,
  width,
  color = COLOR.cream,
  thickness = 2,
  exitAt,
  style,
}: {
  start: number;
  width: number;
  color?: string;
  thickness?: number;
  exitAt?: number;
  style?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();
  const p = progress(frame, start, 24, EASE_IN_OUT);
  const out = exitAt === undefined ? 0 : progress(frame, exitAt, 16, EASE_IN_OUT);
  return (
    <div
      style={{
        width,
        height: thickness,
        background: color,
        transform: `scaleX(${p - out})`,
        transformOrigin: out > 0 ? 'right' : 'left',
        ...style,
      }}
    />
  );
}

/** フィルムグレイン＋ビネット */
export function Finish({vignette = 0.55}: {vignette?: number}) {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,${vignette}) 100%)`,
        }}
      />
      <svg width="1920" height="1080" style={{position: 'absolute', opacity: 0.09, mixBlendMode: 'overlay'}}>
        <filter id={`grain-${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
      </svg>
    </AbsoluteFill>
  );
}

/** 斜めワイプでシーンを登場させる（clip-path） */
export function WipeIn({
  children,
  duration = 16,
  color = COLOR.red,
}: {
  children: React.ReactNode;
  duration?: number;
  color?: string;
}) {
  const frame = useCurrentFrame();
  const p = progress(frame, 0, duration, EASE_IN_OUT);
  const x = -15 + p * 140;
  const clip = `polygon(0% 0%, ${x + 15}% 0%, ${x - 15}% 100%, 0% 100%)`;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{clipPath: p >= 1 ? undefined : clip}}>{children}</AbsoluteFill>
      {p > 0 && p < 1 ? (
        <AbsoluteFill style={{clipPath: `polygon(${x + 15}% 0%, ${x + 19}% 0%, ${x - 11}% 100%, ${x - 15}% 100%)`, background: color}} />
      ) : null}
    </AbsoluteFill>
  );
}

/** 画面四隅の UI クローム */
export function Chrome({label, index, total = 5}: {label: string; index?: number; total?: number}) {
  const frame = useCurrentFrame();
  const o = progress(frame, 8, 20);
  const blink = Math.floor(frame / 15) % 2 === 0 ? 1 : 0.25;
  const base: React.CSSProperties = {
    position: 'absolute',
    fontFamily: FONT.mono,
    fontSize: 20,
    letterSpacing: '0.18em',
    color: COLOR.cream,
    opacity: o * 0.9,
    textShadow: '0 1px 8px rgba(0,0,0,0.5)',
  };
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{...base, left: 72, top: 56}}>
        <span style={{color: COLOR.red, opacity: blink}}>●</span>&nbsp;&nbsp;HONG KONG — 香港
      </div>
      <div style={{...base, right: 72, top: 56}}>{label}</div>
      <div style={{...base, left: 72, bottom: 52}}>22.3193° N / 114.1694° E</div>
      {index !== undefined ? (
        <div style={{...base, right: 72, bottom: 52}}>
          {String(index).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </div>
      ) : null}
    </AbsoluteFill>
  );
}

export function rand(seed: string) {
  return random(seed);
}
