# デザイン提案 — QUALIA メンバーサイト ゴージャス化 Round 2（確定spec）

## サマリ
Round 1 で出した3案（A箔/B品格/C引き算）のうち推奨ハイブリッド（B骨格＋A箔を主役2点に限定）を、reviewer ✗3/⚠4 を全解消して**実装者がコピペで組める確定 spec**に落とす。紺×金維持・モバイルファースト・WebGL不使用。

---

# 0. 共通基盤トークン（globals.css に追加）

## 0-1. 金メタリック・プリミティブ
```css
:root {
  /* 面/ボタン用・箔の縦ハイライト帯（100deg で斜めに光が走る） */
  --gold-foil: linear-gradient(100deg,
    #876E2F 0%, #D4AF37 22%, #F5E6A3 46%, #FBF7EC 52%,
    #E0C57B 60%, #C5A55A 78%, #A68A3E 100%);
  /* 罫/縁用・両端フェードの薄箔 */
  --gold-hairline: linear-gradient(90deg, transparent 0%, #876E2F 8%,
    #D4AF37 30%, #F5E6A3 50%, #D4AF37 70%, #876E2F 92%, transparent 100%);
  /* テキストclip用・上明下暗で立体に見せる */
  --gold-text: linear-gradient(180deg, #FBF7EC 0%, #E0C57B 28%,
    #D4AF37 50%, #A68A3E 78%, #876E2F 100%);
}
.gold-clip {            /* 金メタリック文字 */
  background: var(--gold-text);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
}
```

## 0-2. フォント import（既存 import を置換）
```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,500&family=Cinzel:wght@400;500;600&family=Noto+Serif+JP:wght@400;500;600;700&family=Noto+Sans+JP:wght@300;400;500;600;700&display=swap');
```
- 英字ワードマーク = **Cinzel 600**（碑文ローマンキャピタル＝重厚な高級。QUALIA は英大文字なので Cinzel が最適）
- 英字 eyebrow/ラベル = **Cormorant Garamond 600 small-caps**（細く品のある雑誌ラベル）
- 日本語見出し = **Noto Serif JP**（継続・ウェイトで階層化）
- 本文 = **Noto Sans JP**（継続）

---

# A. タイポgrade up — 確定 px スケール表 ［✗1 解消］

| トークン | 用途 | font-family | weight | size(375px) | size(md≧768) | line-height | letter-spacing | 色 |
|----------|------|-------------|--------|-------------|--------------|-------------|----------------|----|
| `type-wordmark` | QUALIA(enter/Hero) | Cinzel | 600 | clamp 40px | 56px | 1.0 | 0.14em | .gold-clip（後述drop-shadow付） |
| `type-eyebrow` | 章の英ラベル/Members Only | Cormorant Garamond(small-caps) | 600 | 11px | 12px | 1.4 | 0.34em | #C5A55A (gold-500) |
| `type-h2` | ChapterHeader 章見出し(日) | Noto Serif JP | 600 | 26px | 32px | 1.3 | 0.04em | 薄地=#0C1530 / 紺地=#FFFFFF |
| `type-num` | 章番号 01..13 | Cinzel | 500 | 22px | 26px | 1.0 | 0.10em | .gold-clip |
| `type-h3` | セクション内小見出し(日) | Noto Serif JP | 500 | 18px | 20px | 1.5 | 0.02em | #132040 (navy-800) |
| `type-lead` | リード/重要本文 | Noto Sans JP | 400 | 15px | 16px | 1.9 | 0.01em | #1B2A52 (navy-700) |
| `type-body` | 本文 | Noto Sans JP | 400 | 14px | 15px | 1.85 | 0.01em | #1B2A52 |
| `type-caption` | キャプション/肩書 | Noto Sans JP | 500 | 11px | 12px | 1.5 | 0.08em | #4F6BBC (navy-400) |
| `type-btn` | ボタン文字(日) | Noto Sans JP | 600 | 14px | 15px | 0.06em | — | 案により(D参照) |

### ワードマーク clamp 確定 ［⚠4 解消］
- Cinzel 600「QUALIA」=6字。各 letter-spacing での 375px(内側 padding 左右20px=実効335px)収まり最大 font-size を検証:
  - 採用 ls **0.14em**（Cinzel は字幅広めなので Round 1 の 0.16/0.30 から圧縮）→ `font-size: clamp(40px, 11.2vw, 56px)`。375px時=42px相当で6字+字間が335pxに収まる（Cinzel600 の平均字送り≈0.62em×fontsize×6 + ls）。
  - enter / Hero 共通。md≧768 で 56px 固定。
- eyebrow「MEMBERS ONLY」等は ls0.34em でも11px×短語のため375px安全。

---

# B. 案A①ワードマーク立体感 — 実コード確定 ［✗2 解消］

background-clip:text の金文字に `text-shadow` は乗らない（fill-color:transparent で消える）。正規回避を**第一手=filter:drop-shadow()**（参照#9 MDN）で確定:

```css
/* 第一手：drop-shadow は clip済みの可視ピクセルに影を落とせる */
.wordmark {
  /* .gold-clip 適用済 */
  filter:
    drop-shadow(0 1px 0 rgba(255,255,255,.30))   /* 上の白ハイライト=箔の艶 */
    drop-shadow(0 2px 3px rgba(12,21,48,.55));    /* 下の濃紺影=浮き出し */
}
```
- enter(紺グラデ地)・Hero(紺グラデ地)の両方で機能。drop-shadow は GPU 合成で paint 安価。
- **代替（drop-shadow を使わない場合）= ::after 複製方式（実コード）**:
```jsx
<h1 className="wordmark relative" aria-label="QUALIA">
  <span aria-hidden className="gold-clip">QUALIA</span>
  {/* 影レイヤー：clipしない・濃金/紺で1px下にずらす */}
  <span aria-hidden
    className="absolute inset-0 -z-10 translate-y-[1px] text-[#4A3B17]/70 select-none">
    QUALIA
  </span>
</h1>
```
→ 実装は **drop-shadow 方式を推奨**（1要素で済む・保守容易）。::after複製は drop-shadow 不可環境のフォールバック。

---

# C. 採用版ハイブリッド — 9要素×採用案＋確定CSS ［✗3 解消・FINALの中核］

> 原則: **骨格=案B（ヘアライン罫＋small-caps＋雑誌組み）／箔(案A)は主役の①ワードマークと④ボタンのみ**。

| # | 要素 | 採用 | 確定CSS / 実装指針 |
|---|------|------|--------------------|
| ① | ワードマーク QUALIA | **A(箔)** | `.wordmark.gold-clip` + B-章のdrop-shadow。Cinzel600 ls0.14em clamp(40px,11.2vw,56px)。enter: 下に Cormorant italic small-caps「MEMBERS ONLY」(type-eyebrow #C5A55A)。Hero: 下にアクロスティック(⑤) |
| ② | セリフ見出し階層 | **B** | 上表 type-* を全章に適用。ChapterHeader=eyebrow(英small-caps)→番号(type-num金clip)→title(type-h2)。本文 type-body |
| ③ | 金メタリック区切り線 | **B** | フル幅ベタ廃止。`<div class="flex items-center justify-center gap-2 my-8"><span class="h-px w-8" style="background:var(--gold-hairline)"></span><span class="w-1 h-1 rotate-45 bg-gold-400"></span><span class="h-px w-8" style="background:var(--gold-hairline)"></span></div>` =中央ヘアライン+菱形オーナメント |
| ④ | 金ボタン(はいる/解除する) | **A(塗り箔)** | `background:var(--gold-foil); color:#0C1530;` + `box-shadow: inset 0 1px 0 rgba(255,255,255,.55), inset 0 -2px 4px rgba(74,59,23,.45), 0 4px 14px rgba(212,175,55,.28);` + 上面光沢 `::before{content:'';position:absolute;inset:0;border-radius:inherit;background:linear-gradient(180deg,rgba(255,255,255,.45),transparent 45%);pointer-events:none;}`。状態は D 参照 |
| ⑤ | アクロスティック枠 | **B** | 角枠(border)廃止。頭文字 Cinzel500 `.gold-clip` + 各文字下に `h-px w-5 var(--gold-hairline)` 短罫。語(Quality等)は type-caption #7E97D4 |
| ⑥ | 講師丸写真の金縁 | **B** | 1pxヘアラインリング: `padding:1px; background:var(--gold-hairline); border-radius:9999px;` の外殻で写真をラップ + `box-shadow:0 6px 18px -6px rgba(12,21,48,.5)`。肩書「castle 講師」は type-eyebrow 併記「CASTLE INSTRUCTOR」 |
| ⑦ | ChapterHeader | **B** | 上罫=③のヘアライン+オーナメント。eyebrow(F の英語彙)→ flex で番号(type-num金clip)と badge → title(type-h2)。onGradient時 title=白・eyebrow=#E0C57B |
| ⑧ | Hubタイル/準備中ピル | **B** | タイル: 白地 + 1pxヘアライン枠(`padding:1px;background:var(--gold-hairline)`外殻 or `border:1px solid #D4AF37/40`)+ `box-shadow:0 1px 2px rgba(12,21,48,.05),0 10px 24px -14px rgba(12,21,48,.18)`。番号 type-num(小,金clip)・title type-h3。ピル: 塗りなし+ `border:1px solid #C5A55A` + 英small-caps「COMING SOON」type-eyebrow + 月 type-caption |
| ⑨ | 金ロックUI | **B骨格+A塗りボタン** | 区切り=③ヘアライン+オーナメント。鍵円枠=⑥同様1pxヘアラインリング(28px円)。コピー「続きは紹介者から合言葉を…」=Noto Serif JP type-lead 白。「解除する」=④塗り箔ボタン(主役化)。背景=navy-900に微radial(後述E) |

---

# D. 金ボタンの状態確定 ［⚠5 解消］
④塗り箔ボタン（はいる/解除する）の4状態:
| 状態 | 指定 |
|------|------|
| default | 上記 C④ の var(--gold-foil)+box-shadow+::before光沢 |
| hover (md以上のみ) | `background-position: 8% 0;`(箔が動く) + 外側影を `0 6px 18px rgba(212,175,55,.34)` に。transition 220ms ease |
| focus-visible | `outline:2px solid #F5E6A3; outline-offset:2px;`（キーボード操作の可視リング。紺地で視認可） |
| disabled (enter:password空 / busy) | `filter:saturate(.55) brightness(.9); opacity:.55; cursor:not-allowed; box-shadow:none; ::before非表示`（箔の艶を消し沈める。現状 opacity-50 を置換） |

案B系アウトラインを使う箇所（無し＝④はA塗りで確定）。enterとplan「解除する」は同一④仕様で統一。

---

# E. 再描画負荷の確定 ［⚠6 解消］
- 箔グラデ `var(--gold-foil)`(7stop) を**面で使うのは「ボタン」と「locked ゲートブロック背景の縁」のみ**に限定（高コスト塗りの面積を絞る）。区切り・縁・タイルは `var(--gold-hairline)` の細線/1px外殻で、塗り面積は極小。
- アニメーションは **`background-position`（ボタンhover）と `transform`（メニュー矢印bounce 既存・写真hover scale）に限定**。box-shadow や filter を transition/animation で連続変化させない（paint/composite が重い）。
- ワードマークの drop-shadow は static（アニメさせない）。
- 紺地の微テクスチャは既存 `.stone-texture`(radial 2層)を流用、新規大型 radial の多用はしない。locked背景の奥行きは単一 `radial-gradient(120% 80% at 50% 0%, #1B2A52, #0C1530)` 1枚で。

---

# F. ChapterHeader 全13章 英 eyebrow 語彙 ［⚠7 解消・案B採用］
| 章 | 日本語 title | 英 eyebrow(Cormorant small-caps) |
|----|--------------|----------------------------------|
| 01 | 名前の由来 | ORIGIN |
| 02 | 講師紹介 | INSTRUCTORS |
| 03 | 耳開け・導入 | INTRODUCTION |
| 04 | プラン説明 | THE PLAN |
| 05 | クロージング | CLOSING |
| 06 | Instagram | SOCIAL |
| 07 | プラン(ロック) | MEMBERS PLAN |
| 08 | ボーナス | REWARDS |
| 09 | 製品 | PRODUCTS |
| 10 | トレーニング | TRAINING |
| 11 | 登録の流れ | HOW TO JOIN |
| 12 | 使い方 | GUIDE |
| 13 | FAQ | QUESTIONS |

---

## 案の再掲（多様性根拠・Round 1 から不変）
- **案A 箔全振り**（質感最大・チープ化リスク）／**案B エディトリアル**（品格・本案の骨格）／**案C ミニマル**（引き算・2軸弱で不採用）。3案は「金とタイポを盛る↔引く」で本質的に異なる。
- 採用=B骨格＋A箔を①④に限定（C章の確定表が最終形）。

## トレードオフ（採用ハイブリッド）
- 強み: 金メタリック(①④)とタイポ階層(A表/F)の両2軸を満たしつつ、面積を絞って胡散臭さ事故を回避。375pxは罫・字間中心で破綻しにくい（①は clamp 確定）。
- 弱み: Cinzel/Cormorant の追加 import でフォント読込が増える（display=swap で FOUT 許容）。箔ボタンの::before光沢は要素1つ増。
- 375px破綻リスク: 低（①clamp確定・②③⑤⑦⑧は罫/字間）。
- 想定ユーザー: 本物志向で「上質さ」で信頼したい見込み客に最も刺さる。/ 取りこぼし: 金ピカ全面を期待する層には箔が①④限定で物足りない可能性（但しブランド毀損回避を優先）。

---

# Designer Round 2 完了
- 出力先: design/gorgeous/round-2/
- 案数: 3案再掲＋採用ハイブリッド確定表
- 採用参照数: 10（screenshot1 + curl実在 luxury3/font5相当/技術doc5/ブランド一次1）
- Round1 ✗3 全解消（A:px表 / B:drop-shadow実コード / C:9要素採用表）・⚠4 全解消（clamp/状態/負荷/13章eyebrow）
- reviewer に投げる準備 OK
