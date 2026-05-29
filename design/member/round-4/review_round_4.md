# Design Review — Round 4（FINAL 統合スペック）

## 総合判定: FAIL

§8「プラン合言葉ロックの状態機械」が**実装スペックとして成立していない**。採用案で唯一の機微（セキュリティ）セクションなのに、(1) 流用先 API を**管理者用エンドポイント**（`app/api/password/route.js`）に誤指定、(2) 永続化を **localStorage** と指定（既存サイトは httpOnly 署名 Cookie ＝ JST 当日失効の Layer2 設計）、(3)「3回でもロックアウトしない」が**既存サーバの 429 レート制限ロックアウト設計と矛盾**。実装者がこれだけ見て §8 を作ると、admin 用 API に誤配線するか、client-only の localStorage ゲート（容易にバイパス可能・日替わり失効しない）を作ってしまう。設計の 95% は Round3 案B から正しく統合されているが、この 1 セクションが「実装可能粒度」と「既存方針との矛盾0」を割る。

---

## このラウンドで実機（コードベース）と突合した結果

> Round3 は「設計参照（Lazyweb/Web）の妥当性」を検証して PASS。Round4 は「実装スペック」を名乗るため、参照先として明記された**実ファイル**と突合した。ここで §8 の破綻が露見した（Round3 では検証範囲外だったため見落とされていた）。

| 検証対象 | spec の記述 | 実機の事実 | 判定 |
|---|---|---|---|
| カラー hex（§1, 全7トークン） | navy-50 `#EEF2FB` / navy-900 `#0C1530` / navy-700 `#1B2A52` / navy-500 `#33489A` / navy-400 `#4F6BBC` / navy-800 `#132040` / gold-400 `#D4AF37` | `tailwind.config.js` と**全件 exact-match** | ✓ |
| `dark.*` 禁則（§1） | 背景に使わない | `dark.*` は実在（黒系・既存 VideoPlayer は `bg-dark-400` を使用）。禁則は妥当 | ✓ |
| 動画 §9「現状 iframe 即時ロード」 | サムネ→タップで iframe 生成に**変更が必要** | `components/ui/VideoPlayer.js` は iframe を即時レンダリング（facade なし）＝記述は真。iframe URL パラメータ `modestbranding=1&rel=0&showinfo=0&cc_load_policy=0` も既存と一致（spec が足す `autoplay=1` は正当） | ✓ |
| §8「`app/api/password/route.js` の照合ロジック流用」 | 07 合言葉照合に流用 | **このルートは管理者用**（`adminPassword` vs `process.env.ADMIN_PASSWORD` を照合し、当日分パスワード一覧を返す）。viewer の合言葉ゲートではない | **✗** |
| §8「localStorage `qualia_unlocked=1` で保持」 | client 永続化 | 既存 viewer auth は **httpOnly 署名 Cookie**。07 プラン専用に `lib/auth/layer2.js`（`PLAN_COOKIE='qualia_plan'`・JST 当日 24:00 失効・署名トークン）が**既に用意済み**。docstring に「プランセクションの当日アクセストークン…日替わりロックパス照合に成功したら issuePlanToken()」と明記＝これが 07 の正規バックエンド | **✗** |
| §8「3回でもロックアウトしない」 | ロックアウト無し | 既存 viewer auth（`/api/auth/layer1`）は `checkAndIncrement`（max 20/15分）で **HTTP 429 ロックアウトを実装**。Layer2 verify ルートは未実装だが、サイトの確立パターンはロックアウトあり。spec の「しない」は実機方針と矛盾 | **✗** |

### 補足: 既存 auth アーキテクチャ（spec が踏まえていない確定事項）
- **Layer1** = メンバーエリア入口ゲート（`/enter` → `/api/auth/layer1` → httpOnly Cookie → `middleware.js` で `app/(member)/` を保護）。13セクションページは**既に Layer1 の内側**にある。`/enter` のラベルは「合言葉（パスワード）」＝spec の 07 用語と同一。
- **Layer2** = 07 プランセクション専用の当日アクセストークン（`lib/auth/layer2.js`・未配線だが部品は完成）。
- spec §8 はこの 2 層構造に一切触れず、localStorage と admin API という**サイトの設計と整合しない別物**を指示している。

---

## 基準別スコア

| カテゴリ | 結果 | 詳細 |
|----------|------|------|
| 設計の不変性（R3→R4） | ✓ | §1-7・§9 は案B（＋案A の48px章扉）から忠実に統合。配色/タイポ/グリッド/13セクション/ComingSoonCard/動画タップ再生に劣化・新仕様の混入なし。案B「章扉なし」→ハイブリッド「48px章扉あり」は Round3 推奨どおりの正規ハイブリッド化（こっそり変更ではない） |
| 実装可能粒度（9必須項目） | ✗ | 8項目は実装可。**§8 ロック状態機械のみ実機と矛盾し作れない**（上表✗3点）。1項目欠けで FAIL |
| 要素網羅（13セクション） | ✓ | 13セクション＋hero＋hub＋footer を各々要素列挙。「いい感じ」級の曖昧記述なし |
| 形容詞濫用 | ✓ | banned grep=0件（hit はrationale の「banned リスト列挙」と references の不採用案説明「没入 scrollytelling」のみ＝採用案の設計散文での使用なし） |
| 参照妥当性 | ✓ | 採用案 live 参照を実地確認: Discover=長尺1枚＋アンカーTOC（章扉アンカー根拠と一致）、Headspace=主役上→グリッド（02構成と一致）。iOS/Substack/Apple は Round3 で逐語確認済。採用案で不要な案C固有参照（KreativePro/Apple/MasterClass/Four Seasons）を明示除外できている |
| 既存方針との矛盾0 | ✗ | §8 が「既存トークン/既存実装を踏襲」の確定方針に反する（admin API 誤指定・localStorage・ロックアウト無しの3点）。他の確定方針（紺×金明るめ・既存navyトークン・1枚長尺＋ハンバーガー・準備中多い・タップ再生・ロック↔解除）は矛盾0 |

---

## 案別 element-level 評価（採用案 = 案Bハイブリッド）

### コア構造・横断要素
| 要素 | 判定 | コメント |
|------|------|----------|
| 0 採用方針 / hero / hub | ✓ | hero（QUALIA/アクロスティック/石井諒丸72px/メニューへ↓）＋hub（13タイル2/3-4列・番号+アイコン+名・準備中ピル0.7+公開月・07鍵→解除後チェック）。ハブ=通過面/ハンバーガー=常駐ナビ の役割分離が明文化済 |
| §1 カラー運用 | ✓ | 実hex全件一致・金運用ルール（ベタ1画面1つ/金テキストは紺地のみ/石壁は講師グリッドのみ）・グラデ実体 Tailwind クラス明記 |
| §2 タイポ | ✓ | 6行スケール（font/size モバイル+iPad/weight/letter-spacing/補足）完備 |
| §3 余白グリッド | ✓ | px-5/py-14・iPad px-10 max-w-[680px]・読み物 max-w-[640px]・親指リーチ原則 |
| §4 章扉48px | ✓ | 金1pxライン+金章番号+セリフタイトル・`id="sec-NN"`・IntersectionObserver でアンカー兼現在地 |
| §5 ハンバーガー&ハブ | ✓ | 位置44×44・bg-navy-900/70 backdrop-blur・開オーバーレイ navy-900/95・現在地ハイライト・smooth scroll・準備中ピル+opacity0.7 |
| §6 13セクション | ✓ | 01〜13 各々に 章扉/要素/動画有無/CTA位置/準備中の扱い を列挙。02フィルタチップ・03-05動画2列・06スクショ風・09横ストリップ・10 2列タイル・13 plus(+)アコーディオン まで具体 |
| §7 ComingSoonCard | ✓ | 地/金1px/「準備中」ラベル/タイトル/公開月/任意アバター/opacity0.7・グレーアウト&工事中アイコン禁止・3配置パターン |
| §9 動画タップ再生 | ✓ | タップ前 img+金リングPlay56px+尺、タップ後 youtube-nocookie iframe 生成、eager load 禁止、09ショートはミュート自動ループ別扱い、onContextMenu 維持 |
| **§8 ロック状態機械** | **✗** | locked/unlocked の**画面要素は列挙できている**（上半分開放・金1px区切り・ハードカットゲート・鍵28px・単一フィールド・エラーnavy-400・250ms解除・07タイル金チェック）。しかし**バックエンド配線が実機と全面矛盾**: admin API 誤指定／localStorage（実機は httpOnly Layer2 Cookie）／ロックアウト無し（実機は 429）。UI は作れてもデータ層が作れない＝実装スペックとして未完 |

---

## designer への指示（FAIL ＝ §8 のみ。番号付き具体指示）

1. **✗ 流用先 API を訂正**: §8 L223・実装チェックリストの「`app/api/password/route.js` の照合ロジックを流用」を削除。`app/api/password/route.js` は**管理者用**（admin パスワード照合→当日分一覧返却）で 07 とは無関係。07 プランの合言葉照合は **`lib/auth/layer2.js`（`issuePlanToken`/`verifyPlanToken`、`PLAN_COOKIE='qualia_plan'`）を使う**前提に書き換える。検証用 route（例 `app/api/auth/plan/route.js`）が未実装である事実も明記し、「実装者は layer1 route（`app/api/auth/layer1/route.js`）と同型で plan verify route を新設し layer2 トークンを発行する」と手順化する。

2. **✗ 永続化を Cookie に訂正**: §8 L223・L241 の「localStorage `qualia_unlocked=1` で保持」を撤回。実機は **httpOnly 署名 Cookie（`qualia_plan`・JST 当日 24:00 失効）**。localStorage は (a) サーバ検証不能でバイパス容易、(b) 日替わり失効しない＝合言葉が日替わりで再ロックされる設計（`generateDailyPasswordForDate`）を破壊する。「unlocked 状態は `qualia_plan` httpOnly Cookie の有無で判定。再訪時もサーバが Cookie を検証（client localStorage は使わない）」に直す。ハブ 07 タイルの「鍵→チェック」表示は Cookie 有無（または verify API 応答）で出し分ける、と接続点を明記。

3. **✗ ロックアウト方針を実機に整合**: §8 L234・実装チェックリストの「3回でもロックアウトしない」を、既存 `lib/ratelimit.js`（`checkAndIncrement` max 20/15分→HTTP 429）と整合させる。意図（威圧回避でUI上は連続文言のみ・early lockout しない）が確定方針なら、「**サーバのレート制限（layer1 と同様の 429）は維持しつつ、UI は 3回時点ではロックせず文言のみ。サーバ 429 到達（多数回）時のみ "しばらく時間をおいて…" を表示**」と、UI 文言ポリシーとサーバ強制を**2層に分けて**書く。「ロックアウトしない」と断言するとサーバ 429 を無効化する誤実装を招く。

> §1-7・§9 は修正不要。§8 を上記3点で「既存 Layer2 Cookie＋verify route 新設＋レート制限維持」に直せば、9必須項目すべてが実機と整合し実装着手可能になる。

## 光った点（FAIL でも記録）
- §9 が既存 `VideoPlayer.js` の現状（iframe 即時ロード＝全先読み）を正しく把握し「サムネ→タップで iframe 生成へ変更」と差分を実装方針化している点は、実機を読んだ上での正確な指摘。同じ精度を §8 にも適用すれば PASS。

---

## 連続2ラウンドPASS 判定
- Round3 = PASS（設計参照の妥当性）／Round4 = **FAIL**（実装スペックとしての実機整合）。
- よって連続2ラウンドPASS は**未達**。§8 修正後の Round5 再評価が必要。
</content>
</invoke>
