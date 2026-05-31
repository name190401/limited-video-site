# デザイン提案 — QUALIA メンバーサイト ゴージャス化 Round 3（完全ロック spec）

## サマリ
Round 2 PASS の確定 spec を継承し、carry ⚠2件（Cinzel/Cormorant の Tailwind 登録・drop-shadow 実機確認）を §G で確定して**完全ロック**。これが FINAL 候補。紺×金維持・モバイル375px clamp確定・WebGL不使用。実装者はこの md だけで /enter と会員ページ13章を組める。

---

# 0. 共通基盤トークン（globals.css に追加）

## 0-1. 金メタリック・プリミティブ
```css
:root {
  --gold-foil: linear-gradient(100deg,
    #876E2F 0%, #D4AF37 22%, #F5E6A3 46%, #FBF7EC 52%,
    #E0C57B 60%, #C5A55A 78%, #A68A3E 100%);
  --gold-hairline: linear-gradient(90deg, transparent 0%, #876E2F 8%,
    #D4AF37 30%, #F5E6A3 50%, #D4AF37 70%, #876E2F 92%, transparent 100%);
  --gold-text: linear-gradient(180deg, #FBF7EC 0%, #E0C57B 28%,
    #D4AF37 50%, #A68A3E 78%, #876E2F 100%);
}
.gold-clip {
  background: var(--gold-text);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
}
```

## 0-2. フォント import（既存 import を置換）
```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,500&family=Cinzel:wght@400;500;600&family=Noto+Serif+JP:wght@400;500;600;700&family=Noto+Sans+JP:wght@300;400;500;600;700&display=swap');
```

---

# G. Tailwind fontFamily 登録 ［⚠1 解消・実コード］ — 参照#11
`tailwind.config.js` の `theme.extend` に追加（現状 fontFamily キー無しを実確認済）:
```js
// tailwind.config.js  theme.extend に追記
fontFamily: {
  cinzel:   ['Cinzel', 'serif'],
  cormorant:['"Cormorant Garamond"', 'serif'],
  serifjp:  ['"Noto Serif JP"', 'serif'],   // 既存 h1-h3 を明示化
  sansjp:   ['"Noto Sans JP"', 'sans-serif'],
},
```
→ これで A表/C表の family 指定は **Tailwind クラスに一意対応**:
| spec の family | Tailwind クラス |
|----------------|-----------------|
| Cinzel | `font-cinzel` |
| Cormorant Garamond | `font-cormorant` |
| Noto Serif JP | `font-serifjp`（または既存 `font-serif`） |
| Noto Sans JP | `font-sansjp`（body 既定） |

（任意値 `font-['Cinzel']` でも可だが、再利用性のため config 登録を推奨）

---

# A. タイポ確定 px スケール表（Tailwind クラス併記）

| トークン | 用途 | Tailwindクラス(family) | weight | size(375px) | size(md≧768) | line-height | letter-spacing | 色 |
|----------|------|------------------------|--------|-------------|--------------|-------------|----------------|----|
| `type-wordmark` | QUALIA | `font-cinzel` | 600 | clamp 40px | 56px | 1.0 | 0.14em | .gold-clip + drop-shadow(B) |
| `type-eyebrow` | 英ラベル/MEMBERS ONLY | `font-cormorant` small-caps | 600 | 11px | 12px | 1.4 | 0.34em | #C5A55A |
| `type-h2` | 章見出し(日) | `font-serifjp` | 600 | 26px | 32px | 1.3 | 0.04em | 薄地#0C1530 / 紺地#FFF |
| `type-num` | 章番号 | `font-cinzel` | 500 | 22px | 26px | 1.0 | 0.10em | .gold-clip |
| `type-h3` | 小見出し(日) | `font-serifjp` | 500 | 18px | 20px | 1.5 | 0.02em | #132040 |
| `type-lead` | リード本文 | `font-sansjp` | 400 | 15px | 16px | 1.9 | 0.01em | #1B2A52 |
| `type-body` | 本文 | `font-sansjp` | 400 | 14px | 15px | 1.85 | 0.01em | #1B2A52 |
| `type-caption` | キャプション/肩書 | `font-sansjp` | 500 | 11px | 12px | 1.5 | 0.08em | #4F6BBC |
| `type-btn` | ボタン文字(日) | `font-sansjp` | 600 | 14px | 15px | — | 0.06em | D参照 |

### ワードマーク clamp 確定
`font-cinzel` 600「QUALIA」6字・ls0.14em → `font-size: clamp(40px, 11.2vw, 56px)`。375px(実効335px)で折返さない。md≧768=56px固定。eyebrow「MEMBERS ONLY」ls0.34em は短語11pxで375px安全。

---

# B. ①ワードマーク立体感 — 実コード ＋ 実機確認 ［⚠2 解消］

```css
.wordmark {           /* .gold-clip 適用済の <h1>/<span> に */
  filter:
    drop-shadow(0 1px 0 rgba(255,255,255,.30))
    drop-shadow(0 2px 3px rgba(12,21,48,.55));
}
```
### 実機確認チェックリスト ［⚠2］
- [ ] iPhone Safari (375px) で①の艶(白)と影(紺)が出るか
- [ ] iPad Safari で md(56px) の箔グラデ＋影のバランス
- [ ] Chrome(Android/PC) で drop-shadow の乗り方
- 差が大きい/Safari で滲む場合のフォールバック → **::after 複製方式**へ切替:
```jsx
<h1 className="wordmark relative font-cinzel" aria-label="QUALIA">
  <span aria-hidden className="gold-clip">QUALIA</span>
  <span aria-hidden className="absolute inset-0 -z-10 translate-y-[1px] text-[#4A3B17]/70 select-none">QUALIA</span>
</h1>
```
（第一手=drop-shadow 推奨／フォールバック=::after複製）

---

# C. 採用版ハイブリッド — 9要素×採用案×確定CSS（FINAL中核）

> 骨格=案B（ヘアライン罫＋small-caps＋雑誌組み）／箔(案A)は①ワードマークと④ボタンのみ。

| # | 要素 | 採用 | 確定CSS / 実装指針（Tailwindクラス込み） |
|---|------|------|------------------------------------------|
| ① | ワードマーク QUALIA | **A箔** | `<h1 class="wordmark font-cinzel gold-clip" style="font-size:clamp(40px,11.2vw,56px);letter-spacing:.14em">QUALIA</h1>`。enter下に `font-cormorant` italic small-caps「MEMBERS ONLY」(type-eyebrow)。Hero下にアクロスティック(⑤) |
| ② | セリフ見出し階層 | **B** | A表 type-* を全章適用。ChapterHeader=eyebrow→番号→title。本文 type-body |
| ③ | 金区切り線 | **B** | `<div class="flex items-center justify-center gap-2 my-8"><span class="h-px w-8" style="background:var(--gold-hairline)"></span><span class="w-1 h-1 rotate-45 bg-gold-400"></span><span class="h-px w-8" style="background:var(--gold-hairline)"></span></div>` |
| ④ | 金ボタン(はいる/解除する) | **A塗り箔** | `background:var(--gold-foil);color:#0C1530;` + `box-shadow: inset 0 1px 0 rgba(255,255,255,.55), inset 0 -2px 4px rgba(74,59,23,.45), 0 4px 14px rgba(212,175,55,.28);` + `::before{content:'';position:absolute;inset:0;border-radius:inherit;background:linear-gradient(180deg,rgba(255,255,255,.45),transparent 45%);pointer-events:none}`。文字 type-btn。状態=D |
| ⑤ | アクロスティック枠 | **B** | 角枠廃止。頭文字 `font-cinzel` 500 `.gold-clip` + 各文字下に `h-px w-5`(var(--gold-hairline))短罫。語=type-caption #7E97D4 |
| ⑥ | 講師丸写真の金縁 | **B** | 外殻 `padding:1px;background:var(--gold-hairline);border-radius:9999px` で写真ラップ + `box-shadow:0 6px 18px -6px rgba(12,21,48,.5)`。肩書「castle 講師」+ type-eyebrow「CASTLE INSTRUCTOR」 |
| ⑦ | ChapterHeader | **B** | 上罫=③。eyebrow(F)→ flex(番号 type-num金clip + badge) → title type-h2。**onGradient時 title=text-white・eyebrow=#E0C57B（実ファイル ChapterHeader.js:30 と一致）** |
| ⑧ | Hubタイル/準備中ピル | **B** | タイル: 白地+外殻1pxヘアライン(`padding:1px;background:var(--gold-hairline)`) or `border border-[#D4AF37]/40` + `box-shadow:0 1px 2px rgba(12,21,48,.05),0 10px 24px -14px rgba(12,21,48,.18)`。番号 type-num(小,金clip)・title type-h3。ピル=塗りなし+`border border-[#C5A55A]`+「COMING SOON」type-eyebrow+月 type-caption |
| ⑨ | 金ロックUI | **B骨格+A塗りボタン** | 区切り=③。鍵円枠=⑥のヘアラインリング(28px円)。コピー=`font-serifjp` type-lead 白。「解除する」=④塗り箔(主役)。背景=`radial-gradient(120% 80% at 50% 0%, #1B2A52, #0C1530)` 1枚(E) |

---

# D. 金ボタン状態（確定）
| 状態 | 指定 |
|------|------|
| default | C④ |
| hover(md以上) | `background-position:8% 0` + 外影 `0 6px 18px rgba(212,175,55,.34)`、transition 220ms ease |
| focus-visible | `outline:2px solid #F5E6A3;outline-offset:2px` |
| disabled(password空/busy) | `filter:saturate(.55) brightness(.9);opacity:.55;cursor:not-allowed;box-shadow:none`・::before非表示（enter現状 `disabled:opacity-50` を置換） |

---

# E. 再描画負荷（確定）
- `var(--gold-foil)` の塗り面は **ボタン と locked縁のみ**。区切り/縁/タイルは `--gold-hairline` の1px外殻（塗り面積極小）。
- アニメは **background-position(ボタンhover) と transform(矢印bounce既存/写真hover) 限定**。box-shadow/filter は transition で連続変化させない。
- ワードマーク drop-shadow は static。locked背景の奥行きは radial 1枚。既存 `.stone-texture` 流用。

---

# F. ChapterHeader 全13章 英 eyebrow
| 章 | title(日) | eyebrow | 章 | title(日) | eyebrow |
|----|-----------|---------|----|-----------|---------|
| 01 | 名前の由来 | ORIGIN | 08 | ボーナス | REWARDS |
| 02 | 講師紹介 | INSTRUCTORS | 09 | 製品 | PRODUCTS |
| 03 | 耳開け・導入 | INTRODUCTION | 10 | トレーニング | TRAINING |
| 04 | プラン説明 | THE PLAN | 11 | 登録の流れ | HOW TO JOIN |
| 05 | クロージング | CLOSING | 12 | 使い方 | GUIDE |
| 06 | Instagram | SOCIAL | 13 | FAQ | QUESTIONS |
| 07 | プラン(ロック) | MEMBERS PLAN | | | |

---

## 多様性根拠（不変）
案A箔全振り / 案B品格 / 案C引き算 の3案は「金とタイポを盛る↔引く」で本質差。採用=B骨格+A箔①④限定。C は2軸弱で不採用。

## トレードオフ（採用ハイブリッド）
- 強み: 金メタリック(①④)＋タイポ階層(A/F)の両2軸を満たし、箔面積を①④に絞り胡散臭さ事故と再描画負荷を回避。375px clamp 確定。
- 弱み: Cinzel/Cormorant 追加 import でフォント読込増（display=swap で FOUT 許容）。箔ボタン::before光沢で要素1増。
- 375px破綻リスク: 低。
- 刺さる層: 本物志向で上質さで信頼したい見込み客。/ 取りこぼし: 金ピカ全面期待層には①④限定が物足りない可能性（ブランド毀損回避を優先）。

---

# Designer Round 3 完了
- 出力先: design/gorgeous/round-3/
- 案数: 3案+採用ハイブリッド完全ロック
- 採用参照数: 11（screenshot1 + curl実在 luxury3/技術doc6/ブランド一次1 + font）
- Round2 carry ⚠2 解消（G:fontFamily登録実コード / B:drop-shadow実機チェックリスト+フォールバック）
- reviewer に投げる準備 OK
