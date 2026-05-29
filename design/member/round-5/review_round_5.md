# Design Review — Round 5

## 総合判定: PASS

Round4 で唯一 FAIL だった §8 のバックエンド配線 3 点が、実機ファイル突合で全て解消。admin API 誤配線の撤回・localStorage→httpOnly Cookie（JST24:00 失効）・UI/サーバ 429 分離が、`lib/auth/layer2.js`・`lib/ratelimit.js`・`lib/date.js`・`app/api/auth/layer1/route.js`・`app/api/password/route.js` の実体と 100% 整合。§1-7・§9 は Round4 から byte 一致で不変（こっそり変更なし）。

---

## 実ファイル突合の結果（§8 が参照すると主張する実機）

| spec の主張 | 実ファイルの実体 | 判定 |
|---|---|---|
| `PLAN_COOKIE='qualia_plan'`（httpOnly 署名 Cookie） | layer2.js:13 `export const PLAN_COOKIE = 'qualia_plan'` | ✓ 一致 |
| `issuePlanToken()` 発行・`exp=getJstMidnightExpiryEpoch()`（JST24:00） | layer2.js:25-32 `signToken(..., {exp: getJstMidnightExpiryEpoch()})` | ✓ 一致 |
| `verifyPlanToken(value)` 署名検証＋`exp<=nowEpoch()` 失効 | layer2.js:39-47 署名＋日付一致＋`exp<=nowEpoch()` の3段 | ✓ 一致（spec より厳格に日付一致も検証） |
| `planCookieOptions()` httpOnly/Secure/SameSite | layer2.js:50-59 httpOnly:true, secure(本番), sameSite:'lax', maxAge=失効まで | ✓ 一致 |
| `checkAndIncrement({scope,ip,jstDate,max,windowMin})`・429 | ratelimit.js:34 同シグネチャ。`allowed:false` で 429 用 lockedUntil 返却 | ✓ 一致 |
| `clientIp(request)` / `registerFailure` / `registerSuccess` | ratelimit.js:16, 64, 76 すべて実在 | ✓ 一致 |
| `getJstDateString`/`getJstMidnightExpiryEpoch`/`nowEpoch` | date.js:17, 52, 62 すべて実在・JST+9固定 | ✓ 一致 |
| layer1 route と同型（runtime='nodejs'・clientIp→429→verify→401→success→cookie.set） | layer1/route.js:7-36 と完全同型。spec の3手順がそのまま写像 | ✓ 一致 |
| `verifyPassword`（JST 日替わりパス照合） | password.js:67 `verifyPassword` 実在（getTodayPassword・timingSafeEqual） | ✓ 一致 |
| `app/api/auth/plan/` `app/api/plan/unlock` は未実装＝実装者が新設 | `ls app/api/auth/` → `layer1/` のみ。`app/api/plan/` 不在 | ✓ 一致（「新設」が正確） |
| `app/api/password/route.js` は管理者用＝流用してはいけない | password/route.js:6-19 `adminPassword` を `process.env.ADMIN_PASSWORD` と照合し7日分一覧を返す。viewer ゲートではない | ✓ 一致（spec の「流用しない」判断が正しい） |

**結論: spec の参照先と実体の食い違い 0 件。** Round4 の 3 つの誤配線（① admin API 誤指定 ② localStorage ③ 429 と矛盾）はすべて消滅し、正しい layer2 配線に接続し直された。

---

## 基準別スコア
| カテゴリ | 結果 | 詳細 |
|----------|------|------|
| 参照根拠 | ✓ | 採用案の load-bearing 参照は各機能 2 件以上（ハブ=Genius+iOS+Confirmed、ロック=Substack+Dalus、章扉=Discover+Headspace 等）。Round3 PASS 済の参照集合を不変で継承 |
| 参照妥当性 | ✓ | frankrausch.com を再 WebFetch し hub-and-spoke 記述を逐語確認（"serves as a hub"）。§8 修正は参照変更を伴わずバックエンド配線のみ。dalus は SPA で fetch 不可だが Round1-3 確認済・§8 非依存 |
| 要素網羅 | ✓ | §8 locked (a)-(g)・unlocked 全要素・13セクション全てが列挙レベル。「いい感じ」級の曖昧記述なし |
| 多様性 | n/a→✓ | Round5 は採用案1本化フェーズ（A/B/C 併記は Round3 で完了）。本質的差分の評価対象外。scope 内 |
| トレードオフ | ✓ | §8 で「UI 体感（早期ロックアウトしない）」と「サーバ強制（429 維持）」の両立を明示。フェード不採用理由・桁分割不採用理由も記載 |
| 要件整合 | ✓ | 機械に弱い運用者×日替わり合言葉×JST24:00 失効＝翌日再入力、が実機の `generateDailyPasswordForDate`/`exp=JST24:00` と整合。矛盾 0 |
| 形容詞濫用 | ✓ | §8 修正部に「モダン/洗練/シンプル/美しい/直感的」等 0 件。すべて具体トークン・具体 API・具体挙動で記述 |
| scope 逸脱 | ✓ | 依頼=§8 のみ修正。diff で §0-7・§9・13セクションが byte 一致不変を確認。範囲外の新仕様混入 0 |
| 想定ユーザー | ✓ | 「紹介者から合言葉を聞いて開ける」「翌日は再入力」の体験が紹介者×見込み客の1対1運用に整合 |

---

## §8 element-level 評価（Round5 修正部）

| 要素 | 判定 | コメント |
|------|------|----------|
| 照合先 API（admin 誤配線の撤回） | ✓ | 「`app/api/password/route.js` を流用しない」と明記。実体が admin 専用であることを password/route.js:6-19 で確認。Round4 の誤配線が消滅 |
| 正規バックエンド指定 | ✓ | layer2.js の 4 部品名がすべて実在・引数も一致。「部品完成済み」の申告が真 |
| verify route 新設方針 | ✓ | layer1/route.js を実テンプレとして指定。3 手順（429→401→cookie.set）が layer1 と完全同型。route 不在も確認 |
| 永続化（localStorage→Cookie） | ✓ | localStorage 撤回を明記。httpOnly Cookie＋`verifyPlanToken` 判定に変更。localStorage の (a) バイパス (b) 失効破壊 の理由も記載 |
| JST24:00 失効・再ロック | ✓ | layer2.js の `exp=getJstMidnightExpiryEpoch()`・verifyPlanToken の日付一致検証と整合。翌日再入力が仕様どおり |
| 429 維持（UI/サーバ分離） | ✓ | `checkAndIncrement(scope:'layer2', max:10, windowMin:15)`→429 を常時有効と明記。「ロックアウトしない断言で 429 無効化するな」と誤実装を予防。Round4 の「3回でもロックアウトしない」由来の矛盾が解消 |
| 429 到達時 UI 文言 | ✓ | 「しばらく時間をおいて」を 429 到達時のみ表示＝UI 体感とサーバ強制の両立。ratelimit.js の lockedUntil 返却と整合 |
| 保護動画 ID 遅延配信 | ✓ | `GET /api/plan/content`（verifyPlanToken 後・no-store）でビルド時埋め込みを排除。バイパス耐性の設計として妥当 |
| ハブ07タイル 鍵→金チェック | ✓ | Cookie/verify 応答で出し分けに変更（localStorage 依存を排除） |
| locked (a)-(g) UI / unlocked アニメ | ✓ | Round4 から不変（diff で確認）。設計UIは触らずデータ層のみ修正、の宣言どおり |

---

## §1-7・§9 不変性チェック（こっそり変更の有無）

`diff round-4/FINAL_spec.md round-5/FINAL_spec.md` の結果、変更箇所は **§8 内の 3 ブロック＋末尾チェックリストの §8 関連項目のみ**。§0 採用方針・§1 カラー・§2 タイポ・§3 余白・§4 章扉・§5 ハンバーガー&ハブ・§6 全13セクション・§7 ComingSoonCard・§9 動画タップ再生は **byte 一致で不変**。新仕様の混入・劣化なし。✓

---

## ⚠（PASS を妨げないが申し送り）

1. ⚠ **rationale.md が未更新**: rationale.md:22 が依然 Round4 の旧記述「`app/api/password/route.js` の照合ロジックを 07 で流用する旨を明記」のまま。これは FINAL_spec §8（修正後＝流用しないが正）と矛盾する。load-bearing 成果物（FINAL_spec・実装チェックリスト）は正しく、rationale は補助文書のため FAIL にはしないが、実装者が rationale を先に読むと誤った admin 流用に誘導されうる。**rationale.md:22 を「layer2.js に配線（admin API は流用しない）」へ追従更新すべき**。
2. ⚠ rationale.md:10 も「3 回でもロックアウトしない」と旧表現のまま（FINAL_spec §8(g) はサーバ 429 維持に修正済み）。同上、補助文書の追従漏れ。

---

## PASS の場合のコメント（光った点）

1. §8(g) の「UI 層（早期ロックアウトしない体感）」と「サーバ層（429 を常に強制）」の明示的分離が秀逸。Round4 の致命傷だった「ロックアウトしない＝429 無効化」の取り違えを、設計意図を保ったまま正しく両立させ、かつ「断言して 429 を無効化するな」と誤実装を先回りで封じている。
2. 実在 API 名・引数・runtime まで layer1 route と突合できる粒度で書かれており、実装者の解釈余地が小さい。verifyPlanToken が spec の記述（署名＋exp）より厳格（日付一致も検証）な点も、より安全側で問題なし。
3. 保護動画 ID をビルド時埋め込みせず `/api/plan/content` で verifyPlanToken 後配信に分離した点は、Cookie バイパス時も中身が漏れない多層防御として妥当。
