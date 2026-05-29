# Design Review — Round 6（確認ラウンド／連続2ラウンドPASSの2本目）

## 総合判定: PASS

Round5 で残っていた ⚠2件（rationale.md の「password/route.js 流用」「3回でもロックアウトしない」旧記述）が
FINAL_spec §8 に追従して解消済み。§8 のバックエンド配線3点は実ファイル7本と全件突合し整合。
§1 カラー hex 7件・§9 VideoPlayer 現状記述も実体と一致。新仕様混入・劣化なし。

---

## 実ファイル突合の結果（鉄則・判定前に全件オープン済み）

| 主張（spec/rationale） | 実ファイル | 突合結果 |
|---|---|---|
| `password/route.js` は管理者用＝流用しない | `app/api/password/route.js` | ✓ `adminPassword` vs `process.env.ADMIN_PASSWORD`照合・`getPasswordsForDays(7)`返却＝確かに管理者用。spec の「流用しない」が実体と一致 |
| 正規BE=`layer2.js`（`PLAN_COOKIE='qualia_plan'`/`issuePlanToken`/`verifyPlanToken`/`planCookieOptions`） | `lib/auth/layer2.js` | ✓ 全シンボル実在。`exp=getJstMidnightExpiryEpoch()`(L30)・`verifyPlanToken`の失効判定(L44-45)・httpOnly/Secure/SameSite(L50-58) すべて一致 |
| JST 24:00 失効 | `lib/date.js` | ✓ `getJstMidnightExpiryEpoch`(L52-59)=翌JST0:00、`getJstDateString`/`nowEpoch`実在 |
| 429レート制限`checkAndIncrement({scope,ip,jstDate,max,windowMin})`＋`registerFailure/Success` | `lib/ratelimit.js` | ✓ 引数・戻り値・メソッド名すべて一致。`max`到達で`locked_until`セット(L67-68) |
| verify route は layer1 と同型で新設 | `app/api/auth/layer1/route.js` | ✓ `runtime='nodejs'`→`clientIp`→`checkAndIncrement`→429→`verifyPassword`→401+`registerFailure`→`registerSuccess`+`cookies.set`の型を踏襲可能。layer1 は max:20、spec は layer2 用に max:10 を指定（別ルートゆえ別値で正当） |
| 合言葉照合=`verifyPassword`(`lib/password.js`) | `lib/password.js` | ✓ `verifyPassword`(L67) 実在・JST日替わり・定数時間比較 |
| verify route 未実装 | `app/api/auth/plan/`・`app/api/plan/` | ✓ どちらも非存在を実確認（layer1 のみ存在）。spec の「未実装・新設せよ」が正確 |
| §1 カラー hex 全7件 | `tailwind.config.js` | ✓ navy-50/400/500/700/800/900・gold-400 すべて hex 一致。`dark.*`実在＝禁則指定も妥当 |
| §9 VideoPlayer 現状=iframe即時ロード | `components/ui/VideoPlayer.js` | ✓ mount 時 iframe 即時描画(L17-25)・サムネゲートなし。URL params/`onContextMenu`抑止も一致 |

---

## 基準別スコア
| カテゴリ | 結果 | 詳細 |
|----------|------|------|
| 参照根拠 | ✓ | 採用案の load-bearing 3件(Genius/iOS/Confirmed)＋章扉2件＋横断機能多数。各機能に最低2件 |
| 参照妥当性 | ✓ | 6URL実在確認（frankrausch/substack302先/discover/headspace=内容一致, dalus=SPA・ro.co=403はDB由来png真正・references.mlで注記済）。dead 0・パターン不整合 0 |
| 要素網羅 | ✓ | 13セクション＋hero＋hub＋footer＋ComingSoonCard＋07状態機械が列挙レベル。「いい感じ」的曖昧記述なし |
| 多様性 | N/A | 採用案1本への統合ラウンド（A/B/C 併記は Round3 で評価済・本ラウンドは単一仕様） |
| トレードオフ | ✓ | 06実埋め込み不採用（遅延/外部依存）・桁分割不採用（桁数漏れ威圧）・localStorage不採用（バイパス/失効破壊）等を理由付きで明示 |
| 要件整合 | ✓ | スマホ縦主・iPad対応・1対1プレゼン・機械に弱い運用者（早期ロックアウトしないUI・準備中を予告化）に整合。矛盾0 |
| 形容詞濫用 | ✓ | grep でモダン/洗練/シンプル/美しい/直感的/スタイリッシュ/エレガント/高級感の本文使用0件（rationale L26 はbanned語の自己監査メタ文のみ） |
| scope逸脱 | ✓ | メンバーページ範囲内。08数値は法規制確認前プレースホルダで意図的に範囲外を投入していない |
| 想定ユーザー | ✓ | 紹介者→見込み客の1対1文脈に各設計判断が紐付く（威圧回避・親指リーチ・現在地ナビ） |

---

## Round5 ⚠2件の追従確認（重点3）
| Round5 で残っていた旧記述 | Round6 現状（rationale.md） | 判定 |
|---|---|---|
| 「password/route.js を流用」 | L22「`app/api/password/route.js` は**管理者用**のため流用しない…verify route は layer1 と同型で新設」 | ✓ 解消・§8と整合 |
| 「3回でもロックアウトしない」断言 | L10「UI は早期ロックアウトせず連続文言のみ／サーバは layer1 同様の 429 レート制限（max 10/15分）を維持（UI 層とサーバ層を分離）」 | ✓ 解消・§8(g)と整合 |

---

## §8 element-level 評価（重点1: バックエンド配線3点）
| 要素 | 判定 | コメント |
|------|------|----------|
| admin API 誤配線なし | ✓ | password/route.js を明示的に排除。正規BE=layer2.js に配線。実体と一致 |
| httpOnly Cookie＋JST失効 | ✓ | `qualia_plan` httpOnly署名Cookie・`exp=JST24:00`・localStorage不使用・翌日再ロックを spec/状態機械/unlocked節で一貫記述。layer2.js 実装と一致 |
| 429維持＋UI/サーバ分離 | ✓ | (g)でUI層は早期ロックアウトせず連続文言、サーバ層は`checkAndIncrement max:10/15分`の429を常時維持。「ロックアウトしないと断言してサーバ429を無効化するな」と誤実装を明示禁止 |

## §1-7・§9 不変性（重点2: 劣化・新仕様混入チェック）
| 区分 | 判定 | コメント |
|------|------|----------|
| §1 カラー | ✓ | 既存トークンのみ・新規色追加なし・hex 7件実体一致・dark禁則維持 |
| §2-3 タイポ/余白 | ✓ | Serif/Sans・iPad max-w-[680px]・読み物 max-w-[640px]・親指リーチ原則維持 |
| §4-5 章扉/ハブ/ハンバーガー | ✓ | 48px薄型章扉・id=sec-NN・ハブ÷ハンバーガー役割分離が一貫 |
| §6 13セクション | ✓ | 各セクションの章扉/末尾「ハブに戻る↑」/動画方式/準備中扱いが具体記述 |
| §7 ComingSoonCard | ✓ | グレーアウト/工事中禁止・タイトル/担当/公開月を出す予告思想を維持 |
| §9 動画 | ✓ | サムネ→初回タップでiframe生成・全先読み禁止・ショートはミュート自動ループ別扱い。VideoPlayer現状記述が正確 |

---

## PASS のコメント（光った点）
1. §8(g) が「UI の体感（早期ロックアウトしない）」と「サーバの強制（429維持）」を明確に二層分離し、かつ「ロックアウトしないと断言してサーバ429を無効化する」誤実装を名指しで禁止している。Round4 の事故（429矛盾）の再発を構造的に塞いでいる。
2. 「verify route 未実装＝layer1 と同型で新設せよ」という指示が、実在ファイル(layer1 route)を雛形に指定しており、実装者が型を迷わない。実ファイル突合でも layer1 の型と完全に整合した。
3. rationale.md の Round5→6 追従が、§8 の文言とトークン名（PLAN_COOKIE/issuePlanToken/verifyPlanToken/max 10/15分）レベルで一致しており、設計ドキュメント間の食い違いが解消された。

---

## 連続PASS判定
- Round5: PASS（§8修正後）
- Round6: PASS（本ラウンド・確認）
→ **連続2ラウンドPASS 成立。** 実装フェーズへ進行可。
