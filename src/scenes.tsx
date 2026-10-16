import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {
  Character,
  Chrome,
  COLOR,
  EASE_IN,
  EASE_IN_OUT,
  envelope,
  Finish,
  FONT,
  KenBurnsBg,
  Marquee,
  progress,
  Rule,
  SplitText,
  TypeIn,
} from './kit';

// ---------------------------------------------------------------------------
// キャラクター合成シーン
// ---------------------------------------------------------------------------

export type CharaSceneProps = {
  duration: number;
  index: number;
  bg: string;
  chara: string;
  side: 'left' | 'right';
  word: string;
  kanji: string;
  copyJa: string;
  copyEn: string;
  place: string;
  bgFilter?: string;
  charaTint?: string;
  accent?: string;
  footY?: number;
};

export function CharaScene({
  duration,
  index,
  bg,
  chara,
  side,
  word,
  kanji,
  copyJa,
  copyEn,
  place,
  bgFilter,
  charaTint,
  accent = COLOR.red,
  footY = 1010,
}: CharaSceneProps) {
  const frame = useCurrentFrame();
  const exitAt = duration - 26;
  const charaX = side === 'right' ? 1390 : 530;
  const textLeft = side === 'right' ? 120 : 1000;
  const kanjiScale = interpolate(frame, [0, duration], [1.08, 1]);
  const kanjiIn = envelope(frame, 6, exitAt, 30);
  const scrimDir = side === 'right' ? '90deg' : '270deg';

  return (
    <AbsoluteFill>
      <KenBurnsBg src={bg} duration={duration} filter={bgFilter} panX={side === 'right' ? -30 : 30} />
      <AbsoluteFill
        style={{
          background: `linear-gradient(${scrimDir}, rgba(8,8,14,0.72) 0%, rgba(8,8,14,0.35) 45%, rgba(8,8,14,0) 70%)`,
        }}
      />

      {/* 奥レイヤー：巨大漢字と流れるアウトライン文字（キャラの後ろ） */}
      <div
        style={{
          position: 'absolute',
          left: charaX - 330,
          top: 90,
          width: 660,
          textAlign: 'center',
          fontFamily: FONT.serifCJK,
          fontWeight: 900,
          fontSize: 420,
          lineHeight: 1,
          color: accent,
          opacity: 0.85 * kanjiIn,
          writingMode: 'vertical-rl',
          transform: `scale(${kanjiScale})`,
          textShadow: '0 20px 60px rgba(0,0,0,0.35)',
          letterSpacing: '-0.02em',
          height: 900,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {kanji}
      </div>
      <Marquee text={word} y={640} size={300} speed={side === 'right' ? -3 : 3} opacity={0.5 * (1 - progress(frame, exitAt, 20, EASE_IN))} />

      <Character id={chara} centerX={charaX} height={1000} footY={footY} tint={charaTint} />

      {/* 手前レイヤー：見出しブロック */}
      <div style={{position: 'absolute', left: textLeft, top: 250, width: 800}}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            fontFamily: FONT.mono,
            fontSize: 22,
            letterSpacing: '0.3em',
            color: COLOR.cream,
            opacity: envelope(frame, 6, exitAt),
          }}
        >
          <span style={{color: accent, fontWeight: 700}}>{String(index).padStart(2, '0')}</span>
          <Rule start={8} width={80} color={accent} exitAt={exitAt} />
          <span>{place}</span>
        </div>
        <SplitText
          text={word}
          start={12}
          stagger={2.5}
          exitAt={exitAt}
          style={{
            fontFamily: FONT.display,
            fontSize: 230,
            color: COLOR.cream,
            marginTop: 18,
            letterSpacing: '0.01em',
            textShadow: '0 10px 40px rgba(0,0,0,0.35)',
          }}
        />
        <div style={{display: 'flex', alignItems: 'center', gap: 26, marginTop: 26}}>
          <Seal text={kanji} start={30} exitAt={exitAt} color={accent} />
          <div>
            <TypeIn
              text={copyJa}
              start={36}
              speed={1.4}
              exitAt={exitAt}
              style={{fontFamily: FONT.sansCJK, fontWeight: 700, fontSize: 40, color: COLOR.cream, letterSpacing: '0.06em', whiteSpace: 'nowrap'}}
            />
            <TypeIn
              text={copyEn}
              start={52}
              speed={0.6}
              exitAt={exitAt}
              style={{
                fontFamily: FONT.mono,
                fontSize: 20,
                color: COLOR.cream,
                opacity: 0.75,
                letterSpacing: '0.16em',
                marginTop: 12,
                textTransform: 'uppercase',
              }}
            />
          </div>
        </div>
      </div>

      <Finish />
      <Chrome label={`CHAPTER ${String(index).padStart(2, '0')}`} index={index} />
    </AbsoluteFill>
  );
}

/** 赤い落款風のスタンプ */
function Seal({text, start, exitAt, color}: {text: string; start: number; exitAt: number; color: string}) {
  const frame = useCurrentFrame();
  const p = progress(frame, start, 14, EASE_IN_OUT);
  const out = progress(frame, exitAt, 12, EASE_IN);
  const s = interpolate(p, [0, 0.7, 1], [2.2, 0.92, 1]);
  return (
    <div
      style={{
        width: 118,
        height: 118,
        flexShrink: 0,
        background: color,
        color: COLOR.cream,
        fontFamily: FONT.serifCJK,
        fontWeight: 900,
        fontSize: 50,
        lineHeight: 1.02,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        borderRadius: 6,
        transform: `scale(${s * (1 - out)}) rotate(${(1 - p) * -14}deg)`,
        opacity: p,
        boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
        writingMode: 'vertical-rl',
      }}
    >
      {text}
    </div>
  );
}

// ---------------------------------------------------------------------------
// オープニング
// ---------------------------------------------------------------------------

export function Intro({duration}: {duration: number}) {
  const frame = useCurrentFrame();
  const bgReveal = progress(frame, 18, 40, EASE_IN_OUT);
  const exitAt = duration - 20;
  const lineW = interpolate(frame, [0, 22], [0, 1], {extrapolateRight: 'clamp', easing: EASE_IN_OUT});
  const hongX = interpolate(progress(frame, 30, 30), [0, 1], [-900, 0]);
  const kongX = interpolate(progress(frame, 34, 30), [0, 1], [900, 0]);
  const spread = interpolate(frame, [60, duration], [0, 60], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const out = progress(frame, exitAt, 18, EASE_IN);

  return (
    <AbsoluteFill style={{backgroundColor: COLOR.ink}}>
      {/* 中央から上下に開くアパーチャ */}
      <AbsoluteFill style={{clipPath: `inset(${(1 - bgReveal) * 50}% 0% ${(1 - bgReveal) * 50}% 0%)`}}>
        <KenBurnsBg src="06_city_establishing.png" duration={duration} zoomFrom={1.25} zoomTo={1.08} filter="saturate(1.1) contrast(1.05)" />
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(8,8,14,0.35), rgba(8,8,14,0.55))'}} />
      </AbsoluteFill>

      {/* 中心線 */}
      <div
        style={{
          position: 'absolute',
          left: 960 - 900 * lineW,
          top: 539,
          width: 1800 * lineW,
          height: 2,
          background: COLOR.red,
          opacity: 1 - bgReveal,
        }}
      />

      {/* 背景の巨大な「香港」 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONT.serifCJK,
          fontWeight: 900,
          fontSize: 760,
          color: COLOR.red,
          opacity: 0.5 * progress(frame, 44, 30) * (1 - out),
          letterSpacing: `${0.05 + spread / 600}em`,
          transform: `scale(${1.15 - progress(frame, 44, 60) * 0.15})`,
          mixBlendMode: 'multiply',
        }}
      >
        香港
      </div>

      {/* HONG / KONG が左右から滑り込む */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 40 + spread,
          fontFamily: FONT.display,
          fontSize: 300,
          color: COLOR.cream,
          lineHeight: 1,
          opacity: 1 - out,
          transform: `translateY(${-out * 80}px)`,
          textShadow: '0 20px 60px rgba(0,0,0,0.45)',
        }}
      >
        <span style={{transform: `translateX(${hongX}px)`, display: 'inline-block'}}>HONG</span>
        <span style={{transform: `translateX(${kongX}px)`, display: 'inline-block'}}>KONG</span>
      </div>

      <div style={{position: 'absolute', left: 0, right: 0, top: 730, display: 'flex', justifyContent: 'center'}}>
        <TypeIn
          text="A CITY WHERE EAST MEETS WEST"
          start={62}
          speed={0.8}
          exitAt={exitAt}
          style={{fontFamily: FONT.mono, fontSize: 26, letterSpacing: '0.5em', color: COLOR.cream}}
        />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 290, display: 'flex', justifyContent: 'center'}}>
        <TypeIn
          text="東 方 之 珠"
          start={70}
          speed={3}
          exitAt={exitAt}
          style={{fontFamily: FONT.serifCJK, fontWeight: 700, fontSize: 40, letterSpacing: '0.4em', color: COLOR.gold}}
        />
      </div>

      <Finish />
      <Chrome label="A TRAVEL FILM" />
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// トラム インサート
// ---------------------------------------------------------------------------

export function TramInsert({duration}: {duration: number}) {
  const frame = useCurrentFrame();
  const exitAt = duration - 16;
  const words = ['DING', 'DING'];
  return (
    <AbsoluteFill>
      <KenBurnsBg src="07_tram_insert.png" duration={duration} zoomFrom={1.12} zoomTo={1.04} panX={60} />
      <AbsoluteFill style={{background: 'rgba(8,8,14,0.35)'}} />
      <AbsoluteFill style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: 120}}>
        {words.map((w, i) => {
          const start = 6 + i * 10;
          const bounce = interpolate(progress(frame, start, 16), [0, 0.6, 1], [0, 1.08, 1]);
          return (
            <div
              key={i}
              style={{
                fontFamily: FONT.display,
                fontSize: 330,
                lineHeight: 0.92,
                color: i === 0 ? COLOR.cream : 'transparent',
                WebkitTextStroke: i === 1 ? `4px ${COLOR.cream}` : undefined,
                transform: `scaleY(${bounce}) translateX(${(1 - progress(frame, start, 18)) * -200 - progress(frame, exitAt, 14, EASE_IN) * 1600}px)`,
                transformOrigin: 'bottom left',
                textShadow: i === 0 ? '0 20px 50px rgba(0,0,0,0.4)' : undefined,
              }}
            >
              {w}
            </div>
          );
        })}
        <div style={{display: 'flex', alignItems: 'center', gap: 24, marginTop: 30, opacity: envelope(frame, 22, exitAt, 14)}}>
          <span style={{fontFamily: FONT.serifCJK, fontWeight: 900, fontSize: 64, color: COLOR.gold}}>叮叮車</span>
          <Rule start={26} width={120} color={COLOR.gold} />
          <span style={{fontFamily: FONT.mono, fontSize: 24, letterSpacing: '0.3em', color: COLOR.cream}}>
            HONG KONG TRAMWAYS — SINCE 1904
          </span>
        </div>
      </AbsoluteFill>
      <Finish />
      <Chrome label="INTERLUDE" />
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// 点心メニュー インサート
// ---------------------------------------------------------------------------

const DIM_SUM = [
  {zh: '蝦餃', en: 'HAR GOW'},
  {zh: '燒賣', en: 'SIU MAI'},
  {zh: '叉燒包', en: 'CHA SIU BAO'},
];

export function FoodInsert({duration}: {duration: number}) {
  const frame = useCurrentFrame();
  const slot = Math.floor((duration - 20) / DIM_SUM.length);
  return (
    <AbsoluteFill>
      <KenBurnsBg src="09_food_insert.png" duration={duration} zoomFrom={1.04} zoomTo={1.16} filter="saturate(1.1)" />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 30% 50%, rgba(8,8,14,0.65) 0%, rgba(8,8,14,0.15) 65%)'}} />
      <div
        style={{
          position: 'absolute',
          left: 120,
          top: 200,
          fontFamily: FONT.mono,
          fontSize: 24,
          letterSpacing: '0.4em',
          color: COLOR.gold,
          opacity: envelope(frame, 0, duration - 16, 12),
        }}
      >
        YUM CHA — 飲茶
      </div>
      {DIM_SUM.map((d, i) => {
        const s = 6 + i * slot;
        const e = s + slot - 6;
        const isLast = i === DIM_SUM.length - 1;
        return (
          <div key={d.en} style={{position: 'absolute', left: 110, top: 270}}>
            <SplitText
              text={d.zh}
              start={s}
              stagger={3}
              duration={16}
              exitAt={isLast ? duration - 16 : e}
              style={{fontFamily: FONT.serifCJK, fontWeight: 900, fontSize: 280, color: COLOR.cream, textShadow: '0 20px 60px rgba(0,0,0,0.5)'}}
            />
            <SplitText
              text={d.en}
              start={s + 6}
              stagger={1.2}
              duration={14}
              exitAt={isLast ? duration - 16 : e}
              style={{fontFamily: FONT.display, fontSize: 110, color: COLOR.red, marginTop: 14, letterSpacing: '0.04em'}}
            />
          </div>
        );
      })}
      <Finish />
      <Chrome label="INTERLUDE" />
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// 数字で見る香港
// ---------------------------------------------------------------------------

const FACTS = [
  {value: 260, suffix: '+', label: 'ISLANDS', ja: '島'},
  {value: 7.5, suffix: 'M', label: 'PEOPLE', ja: '人口', decimals: 1},
  {value: 1, suffix: '', label: 'CITY', ja: '都市'},
];

export function FactsInsert({duration}: {duration: number}) {
  const frame = useCurrentFrame();
  const exitAt = duration - 18;
  return (
    <AbsoluteFill>
      <KenBurnsBg src="08_harbour_reverse.png" duration={duration} zoomFrom={1.1} zoomTo={1.02} panX={-40} />
      <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(8,8,14,0.85) 0%, rgba(8,8,14,0.2) 60%)'}} />
      <div
        style={{
          position: 'absolute',
          left: 120,
          right: 120,
          bottom: 150,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        {FACTS.map((f, i) => {
          const start = 6 + i * 12;
          const count = progress(frame, start, 34);
          const n = f.value * count;
          const shown = f.decimals ? n.toFixed(f.decimals) : Math.round(n).toString();
          const o = envelope(frame, start, exitAt + i * 3, 14);
          return (
            <div key={f.label} style={{opacity: o, transform: `translateY(${(1 - o) * 40}px)`, width: 520}}>
              <div style={{fontFamily: FONT.display, fontSize: 240, lineHeight: 0.9, color: COLOR.cream}}>
                {shown}
                <span style={{color: COLOR.gold}}>{f.suffix}</span>
              </div>
              <Rule start={start + 6} width={440} color={COLOR.gold} thickness={3} style={{margin: '22px 0'}} />
              <div style={{display: 'flex', gap: 22, alignItems: 'baseline'}}>
                <span style={{fontFamily: FONT.mono, fontSize: 28, letterSpacing: '0.35em', color: COLOR.cream}}>{f.label}</span>
                <span style={{fontFamily: FONT.serifCJK, fontSize: 30, fontWeight: 700, color: COLOR.gold}}>{f.ja}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 120, top: 170}}>
        <SplitText
          text="HONG KONG IN NUMBERS"
          start={2}
          stagger={1}
          duration={16}
          exitAt={exitAt}
          style={{fontFamily: FONT.display, fontSize: 64, color: COLOR.cream, letterSpacing: '0.08em'}}
        />
      </div>
      <Finish />
      <Chrome label="BY THE NUMBERS" />
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// フィナーレ（夜景）
// ---------------------------------------------------------------------------

export function Finale({duration}: {duration: number}) {
  const frame = useCurrentFrame();
  // ネオン管のちらつき
  const flickerSeq = [0, 1, 0.2, 1, 0.1, 0.9, 1];
  const fIdx = Math.min(flickerSeq.length - 1, Math.max(0, Math.floor((frame - 40) / 3)));
  const neon = frame < 40 ? 0 : flickerSeq[fIdx];
  const fadeOut = progress(frame, duration - 30, 30, EASE_IN_OUT);
  const letters = 'HONG KONG';

  return (
    <AbsoluteFill style={{backgroundColor: COLOR.ink}}>
      <AbsoluteFill style={{opacity: 1 - fadeOut}}>
        <KenBurnsBg src="12_night_finale.png" duration={duration} zoomFrom={1.18} zoomTo={1.04} panY={-20} />
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(8,8,14,0.55) 0%, rgba(8,8,14,0.1) 45%, rgba(8,8,14,0.7) 100%)'}} />

        {/* ネオン看板風の縦書き */}
        <div
          style={{
            position: 'absolute',
            right: 170,
            top: 140,
            writingMode: 'vertical-rl',
            fontFamily: FONT.serifCJK,
            fontWeight: 900,
            fontSize: 150,
            letterSpacing: '0.12em',
            color: '#FFE6EE',
            opacity: neon,
            textShadow: `0 0 8px ${COLOR.neon}, 0 0 24px ${COLOR.neon}, 0 0 60px ${COLOR.neon}`,
            padding: '30px 22px',
            border: `4px solid rgba(255,230,238,${0.9 * neon})`,
            borderRadius: 18,
            boxShadow: `0 0 20px ${COLOR.neon}, inset 0 0 20px ${COLOR.neon}`,
          }}
        >
          香港
        </div>

        {/* 文字間隔が広がりながら現れるタイトル */}
        <div style={{position: 'absolute', left: 140, top: 330}}>
          <div style={{display: 'flex', fontFamily: FONT.display, fontSize: 250, color: COLOR.cream, lineHeight: 1}}>
            {[...letters].map((ch, i) => {
              const p = progress(frame, 10 + i * 3, 30);
              return (
                <span
                  key={i}
                  style={{
                    display: 'inline-block',
                    width: ch === ' ' ? 60 : undefined,
                    opacity: p,
                    filter: `blur(${(1 - p) * 16}px)`,
                    transform: `translateY(${(1 - p) * -60}px) scale(${1.4 - p * 0.4})`,
                    marginRight: interpolate(frame, [10, duration], [30, 8], {extrapolateRight: 'clamp'}),
                    textShadow: '0 20px 60px rgba(0,0,0,0.5)',
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </div>
          <Rule start={50} width={900} color={COLOR.gold} thickness={3} style={{marginTop: 26}} />
          <TypeIn
            text="百萬夜景 — 一座城，千萬種光。"
            start={60}
            speed={2}
            style={{fontFamily: FONT.serifCJK, fontWeight: 700, fontSize: 52, color: COLOR.cream, marginTop: 34, letterSpacing: '0.08em'}}
          />
          <TypeIn
            text="A MILLION LIGHTS. ONE CITY. YOUR STORY."
            start={80}
            speed={0.7}
            style={{fontFamily: FONT.mono, fontSize: 24, color: COLOR.gold, marginTop: 22, letterSpacing: '0.3em'}}
          />
        </div>

        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 120,
            textAlign: 'center',
            fontFamily: FONT.sansCJK,
            fontWeight: 700,
            fontSize: 34,
            letterSpacing: '0.4em',
            color: COLOR.cream,
            opacity: envelope(frame, 120, duration + 100, 24),
          }}
        >
          さあ、香港へ。
        </div>
        <Finish vignette={0.65} />
        <Chrome label="FIN" />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

