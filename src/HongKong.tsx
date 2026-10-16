import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {COLOR, WipeIn} from './kit';
import {CharaScene, CharaSceneProps, FactsInsert, Finale, FoodInsert, Intro, TramInsert} from './scenes';

const OVERLAP = 14;
const CHARA_LEN = 165;

type Shot = {len: number; render: (len: number) => React.ReactNode; wipe?: string};

function chara(props: Omit<CharaSceneProps, 'duration'>): Shot {
  return {len: CHARA_LEN, render: (len) => <CharaScene duration={len} {...props} />};
}

const SHOTS: Shot[] = [
  {len: 150, render: (len) => <Intro duration={len} />},
  chara({
    index: 1,
    bg: '11_airport_walk.png',
    chara: '04',
    side: 'left',
    word: 'ARRIVE',
    kanji: '抵達',
    copyJa: 'ゲートを抜けたら、物語が動き出す。',
    copyEn: 'Your story begins at the gate',
    place: 'HONG KONG INTERNATIONAL AIRPORT',
  }),
  chara({
    index: 2,
    bg: '01_map_guide.png',
    chara: '01',
    side: 'right',
    word: 'EXPLORE',
    kanji: '探索',
    copyJa: '地図を片手に、まだ見ぬ街角へ。',
    copyEn: 'Get lost. Then find your way',
    place: 'CENTRAL',
  }),
  {len: 80, render: (len) => <TramInsert duration={len} />, wipe: COLOR.gold},
  chara({
    index: 3,
    bg: '02_camera.png',
    chara: '02',
    side: 'left',
    word: 'CAPTURE',
    kanji: '留影',
    copyJa: 'ヴィクトリア・ハーバーを、この一枚に。',
    copyEn: 'The skyline, framed by you',
    place: 'VICTORIA HARBOUR',
  }),
  {len: 90, render: (len) => <FoodInsert duration={len} />, wipe: COLOR.gold},
  chara({
    index: 4,
    bg: '03_dim_sum.png',
    chara: '03',
    side: 'right',
    word: 'TASTE',
    kanji: '品嚐',
    copyJa: '湯気の向こうに、香港の朝がある。',
    copyEn: 'Morning tea, the local way',
    place: 'YUM CHA HOUSE',
  }),
  {len: 100, render: (len) => <FactsInsert duration={len} />, wipe: COLOR.gold},
  chara({
    index: 5,
    bg: '05_surprise.png',
    chara: '05',
    side: 'left',
    word: 'WONDER',
    kanji: '驚嘆',
    copyJa: '夕暮れ、街がまるごと光に変わる。',
    copyEn: 'When the city turns to light',
    place: 'THE PEAK AT DUSK',
    accent: COLOR.neon,
    charaTint: 'saturate(0.95) sepia(0.12)',
  }),
  {len: 210, render: (len) => <Finale duration={len} />},
];

function layout() {
  let cursor = 0;
  return SHOTS.map((shot, i) => {
    const from = i === 0 ? 0 : cursor - OVERLAP;
    cursor = from + shot.len;
    return {shot, from};
  });
}

const LAYOUT = layout();
export const TOTAL_FRAMES = LAYOUT[LAYOUT.length - 1].from + SHOTS[SHOTS.length - 1].len;

export function HongKong() {
  return (
    <AbsoluteFill style={{backgroundColor: COLOR.ink}}>
      {/* Lyria 3.5 で生成した BGM を小節頭で編集したキュー */}
      <Audio src={staticFile('music/bgm.wav')} />
      {LAYOUT.map(({shot, from}, i) => (
        <Sequence key={i} from={from} durationInFrames={shot.len} premountFor={30}>
          {i === 0 ? shot.render(shot.len) : <WipeIn color={shot.wipe}>{shot.render(shot.len)}</WipeIn>}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
