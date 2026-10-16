# Hong Kong Motion MV

香港を紹介するキネティックタイポグラフィのモーショングラフィックス動画（1920×1080 / 30fps / 約44秒）。
[Remotion](https://www.remotion.dev/) で構成し、BGM は Google Lyria 3.5 で生成しています。

## 構成

| 区間 | シーン | 背景 | キャラクター |
|---|---|---|---|
| 0:00 | オープニング「HONG KONG」 | 06_city_establishing | – |
| 0:04 | 01 ARRIVE／抵達 | 11_airport_walk | hongkong_04（スーツケース） |
| 0:09 | 02 EXPLORE／探索 | 01_map_guide | hongkong_01（地図） |
| 0:14 | 間奏 DING DING | 07_tram_insert | – |
| 0:16 | 03 CAPTURE／留影 | 02_camera | hongkong_02（カメラ） |
| 0:21 | 間奏 飲茶メニュー | 09_food_insert | – |
| 0:24 | 04 TASTE／品嚐 | 03_dim_sum | hongkong_03（点心） |
| 0:29 | 数字で見る香港 | 08_harbour_reverse | – |
| 0:32 | 05 WONDER／驚嘆 | 05_surprise | hongkong_05（驚き） |
| 0:37 | フィナーレ | 12_night_finale | – |

## ディレクトリ

```
src/                  Remotion のコンポジション
  HongKong.tsx        タイムライン（シーン順・尺・BGM）
  scenes.tsx          各シーン
  kit.tsx             タイポグラフィ・背景・キャラ合成などの部品
scripts/
  prepare-assets.sh   元素材から public/ を生成（背景コピー・クロマキー・BGM編集）
  generate-bgm.py     Lyria 3.5 で BGM を生成
music/
  prompt.txt          Lyria に渡したプロンプト
  take2.mp3           採用した生成曲（生成は非決定的なので原本として保持）
```

`public/`（生成素材）と `out/`（レンダリング結果）は再生成できるため管理対象外です。

## 再現手順

前提: Node.js、ffmpeg、Google Chrome（`/Applications/Google Chrome.app`）。
元素材（`hongkong-backgrounds-1〜3/` と `Review_hongkong_*/`）がこのリポジトリの親ディレクトリにある想定です。

```bash
npm ci
npm run assets            # 別の場所に元素材がある場合: scripts/prepare-assets.sh /path/to/materials
npm run render            # → out/hongkong_bgm.mp4
```

プレビューは `npm run studio`。

> Remotion 同梱の chrome-headless-shell が macOS 上で起動しなかったため、`remotion.config.ts` でシステムの Chrome を使っています。

### BGM を作り直す場合

```bash
GEMINI_API_KEY=... python3 scripts/generate-bgm.py music/prompt.txt music/take2.mp3
```

Lyria は指定秒数を守らずフル尺の曲を返すため、`scripts/prepare-assets.sh` 内で小節頭の 3 区間（冒頭／盛り上がり／終止）をつないで 44.3 秒に編集しています。
曲を差し替えたら、区間の秒数を新しい曲の小節位置に合わせて調整してください。
