#!/usr/bin/env bash
# 元素材から public/ 以下のレンダリング用素材を再生成する。
#   使い方: scripts/prepare-assets.sh [元素材のあるディレクトリ（既定: ..）] [出力先（既定: public）]
set -euo pipefail

cd "$(dirname "$0")/.."
SRC="${1:-..}"
OUT="${2:-public}"

command -v ffmpeg >/dev/null || { echo "ffmpeg が見つかりません" >&2; exit 1; }

# 1. 背景画像（hongkong-backgrounds-1〜3）
mkdir -p "$OUT/bg"
shopt -s nullglob
bgs=("$SRC"/hongkong-backgrounds-*/*.png)
[ ${#bgs[@]} -eq 12 ] || { echo "背景画像が 12 枚見つかりません（${#bgs[@]} 枚）: $SRC/hongkong-backgrounds-*/" >&2; exit 1; }
cp "${bgs[@]}" "$OUT/bg/"

# 2. キャラクター動画のグリーンバックを抜いて透過 PNG 連番にする
for n in 01 02 03 04 05; do
  videos=("$SRC"/Review_hongkong_*/hongkong_${n}_*_6s.mp4)
  [ ${#videos[@]} -eq 1 ] || { echo "hongkong_${n} の動画が一意に見つかりません" >&2; exit 1; }
  mkdir -p "$OUT/chara/$n"
  ffmpeg -v error -y -i "${videos[0]}" \
    -vf "chromakey=0x00FF00:0.18:0.06,despill=type=green:mix=0.6:expand=0.2,format=rgba" \
    "$OUT/chara/$n/%03d.png"
done

# 3. BGM: Lyria 3.5 の生成曲（music/take2.mp3）を小節頭で 3 区間つなぎ、映像尺 44.3 秒に合わせる
#    A: 0–15.88s（冒頭〜8小節） / B: 70.90–86.70s（36〜44小節） / C: 86.62s〜（クライマックス〜終止）
[ -f music/take2.mp3 ] || { echo "music/take2.mp3 がありません（scripts/generate-bgm.py で生成）" >&2; exit 1; }
mkdir -p "$OUT/music"
ffmpeg -v error -y -i music/take2.mp3 -filter_complex "\
[0]atrim=0:15.88,asetpts=PTS-STARTPTS[a];\
[0]atrim=70.90:86.70,asetpts=PTS-STARTPTS[b];\
[0]atrim=86.62,asetpts=PTS-STARTPTS[c];\
[a][b]acrossfade=d=0.06:c1=tri:c2=tri[ab];\
[ab][c]acrossfade=d=0.06:c1=tri:c2=tri,atrim=0:44.3,afade=t=out:st=42.8:d=1.5,\
loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000,volume=-1.7dB[out]" \
  -map "[out]" -c:a pcm_s16le "$OUT/music/bgm.wav"

echo "素材を $OUT/ に生成しました"
