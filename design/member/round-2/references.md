# 参照一覧 — QUALIA メンバーページ Round 2

## 取得経路と透明性（reviewer 指摘8・代替取得の明示）
- **Round 2 で Lazyweb MCP は接続失敗（`✗ Failed to connect` / health 不通）**。FAIL とせず、以下の方針で対応した:
  1. Round 1 で Lazyweb DB から取得・DL 済みの 25 枚（`./references/*.png`）は**真正な DB 由来スクショ**としてそのまま継続使用（reviewer が Round 1 で7 URL＋7枚を目視一致確認済み）。
  2. 案B・案C に欠けていた「固有の load-bearing 参照」は **WebSearch で代替収集**し、出典 URL と構造記述を併記。代替由来は行末に `[Web代替]` と明記する。
- **由来内訳**: Lazyweb DB 由来 25 件 / WebSearch 代替 2 件（案B=Fitbit Today、案C=Apple AirPods Pro）。

## live 乖離の注記（reviewer 指摘8）
DB スクショは取得時点の真正画像だが、以下は現行ライブと差異がある（claim は DB スクショに基づく）:
- `kreativepro-locked-preview.png` — **DB由来のスクショで検証、現行サイトは Locked/Unlock 表示を出さない可能性**（live はロック非表示）。
- `substack-paywall-blur.png` — **DB由来のスクショで検証、現行 URL は 302 で別投稿へ転送される**（フェードペイウォール構造自体は真正）。
- `tbr-team-directory-scroll.png` — **DB由来のスクショで検証、現行 live は「丸＋矩形混在」で純丸型でない可能性**。よって**丸型 headshot の load-bearing 根拠は `breathwrk`（純丸グリッド）/`headway`（純丸 social proof）に寄せ**、TBR は「縦スクロール左右交互の人物ブロック構成」の根拠に限定する。

---

# 案別 load-bearing 参照（reviewer 指摘7：使い回しの解消）

各案の「体験構造そのもの」を決めている参照（load-bearing）と、「トーン/質感だけの参照」を分離して列挙する。

## 案A（章立てプレゼン進行型）— 線形・章扉
**load-bearing（構造を決める）:**
| ファイル | 出典 | URL | 何を決めているか |
|---|---|---|---|
| `discover-longscroll-jump-nav.png` | Discover [desktop] | https://www.discover.com/personal-loans/faqs/ | **長尺1枚＋上から順に読ませる骨格＋アンカー目次**。案Aの「上から順＝台本」の直接根拠。 |
| `headspace-teachers-directory.png` | Headspace [desktop] | https://www.headspace.com/teachers | **主役を上に大きく→その他をグリッド**の2段＝02講師の章内構成。本文を順に流す中での人物提示の型。 |

**トーン/質感（構造でない）:** `four-seasons-luxury-hero.png`（余白の効いた明るい紺基調の hero 質感の参考のみ）。

## 案B（ハブ＆ダッシュボード型）— 非線形・中央ハブ
**load-bearing（構造を決める）:**
| ファイル | 出典 | URL | 何を決めているか |
|---|---|---|---|
| `genius-more-menu-grid.png` | Genius [mobile] | (mobile app) | **大アイコンタイルのグリッドを全画面メニューに**＝案Bの冒頭ハブ(13タイル)の直接根拠。文字リストでなくタイルで分岐させる。 |
| Fitbit「Today」タブ＋タイル式ダッシュボード | Fitbit / Google Health [mobile] | https://www.androidcentral.com/how-use-dashboard-fitbit-android | **中央ハブ(Today)＋タイルで領域分割＋各タイルが深い画面へ分岐(hub-and-spoke)**。案Bの「冒頭ハブ→セクションへ飛ぶ→ハブに戻る」往復構造の実在根拠。`[Web代替]` |
| `confirmed-soon-empty-state.png` | Confirmed [mobile] | (mobile app) | **タイル/空状態で「準備中」を予告として見せ"次にすること"を残す**＝ハブのタイル上で準備中を扱う案Bの中核。 |

**トーン/質感:** `userguiding-team-directory.png`（上部フィルタチップの見せ方）。

## 案C（没入フルブリードカード型）— 1画面1メッセージ
**load-bearing（構造を決める）:**
| ファイル | 出典 | URL | 何を決めているか |
|---|---|---|---|
| Apple AirPods Pro 製品ページ | Apple [desktop/mobile] | https://www.apple.com/airpods-pro/ | **章・テキスト・packshot・動画が1画面ずつ交互に現れるフルブリード scrollytelling＝1セクション≒1スクリーンの直接根拠**。スクロールで前景が切り替わる「めくり」体験。`[Web代替]`（Awwwards 解説: https://www.awwwards.com/inspiration/product-scroll-triggered-animation-apple-airpods-pro ） |
| `youtube-course-detail-play.png` | YouTube [mobile] | (mobile app) | **1画面に大Play＋hero preview＋メタ**＝動画パネルを全面1画面で見せる案Cの動画セクション構造。 |
| `masterclass-instructor-profile.png` | MasterClass [mobile] | (mobile app) | **1画面に大アバター＋肩書＋bio**＝講師パネル(02)を1スクリーンで完結させる構造。 |

**トーン/質感:** `four-seasons-luxury-hero.png`（フルブリード hero の明るい紺トーンの質感のみ。構造根拠ではない）。

---

# 共通機能の参照（3案で実装を共有する横断機能）

これらは「案の体験構造」でなく「動画・ロック・FAQ 等の機能の作り」を支える参照。案間で共有してよい性質のもの。

## 講師グリッド・ディレクトリ（02 の素材）
| ファイル | 出典 | URL | 採用パターン |
|---|---|---|---|
| `breathwrk-meet-team-grid.png` | Breathwrk [desktop] | https://www.breathwrk.com/team | **純丸型写真グリッド＋名前＋役職＋credential**。丸型 headshot の主 load-bearing 根拠（TBR の代わり）。 |
| `headway-circular-grid-social-proof.png` | Headway [mobile] | (mobile app) | **純丸型写真のグリッド**。丸グリッドの密度・余白の参考。 |
| `tbr-team-directory-scroll.png` | TBR [desktop] | https://mytbr.co/bibliologists/ | **縦スクロール左右交互の人物ブロック**（丸根拠でなく配置の参考。live乖離注記済み）。 |
| `solstice-team-filter-sidebar.png` | Solstice [desktop] | https://solstice.us/about-solstice/team/ | department フィルタで絞り込み（属性フィルタの機能根拠）。 |
| `userguiding-team-directory.png` | UserGuiding [desktop] | https://userguiding.com/customers | 上部フィルタチップ＋カードグリッド（スマホ向き属性チップ）。 |

## 動画タップ再生（03/04/05/11/12）
| ファイル | 出典 | URL | 採用パターン |
|---|---|---|---|
| `youtube-course-detail-play.png` | YouTube [mobile] | (mobile app) | 大Play＋hero preview＋メタ。サムネ→タップ再生。 |
| `sequoia-video-grid-play.png` | Sequoia [desktop] | https://www.sequoia.com/resources/videos/ | Play付きサムネのカードグリッド（動画×3の並べ方）。 |

## ロック↔解除（合言葉ペイウォール・07）
| ファイル | 出典 | URL | 採用パターン |
|---|---|---|---|
| `mimo-locked-modules.png` | Mimo [mobile] | (mobile app) | 解除済(光るPlay)↔ロック(padlock)が同パスに並ぶ＝威圧でなく「進めば開く」。案A locked の中核。 |
| `substack-paywall-blur.png` | Substack [desktop] | https://substack.com/home/post/p-186215548 | 上部だけ見せ下をフェード＋CTA。案B locked の中核（live 302 注記済み）。 |
| `kreativepro-locked-preview.png` | KreativePro [desktop] | https://www.kreativepro.io/spark/cms-stacked-slider | 枠の上に Locked/Unlock を重ねる"扉"。案C locked の中核（live非表示 注記済み）。 |
| `typo-invite-code-fields.png` | Typo [mobile] | (mobile app) | 桁分割コード入力＋ペースト導線＋「コードがない場合」リンク。**→ 採否は本Roundで決定: 桁分割は不採用**（合言葉は文字列で桁数固定でないため。下記 proposals 参照）。単一フィールド設計の比較対象として保持。 |
| `sora-invite-code.png` | Sora [mobile] | (mobile app) | マルチ桁コード＋副導線。同上、桁分割の比較対象。 |
| `dalus-access-code-modal.png` | Dalus [desktop] | https://www.dalus.io/access | 単一入力＋Continue の最小形。**→ 採用: 単一フィールド**の根拠。 |

## Coming Soon（準備中・全セクション）
| ファイル | 出典 | URL | 採用パターン |
|---|---|---|---|
| `confirmed-soon-empty-state.png` | Confirmed [mobile] | (mobile app) | 「Soon」空状態＝予告＋"次にすること"を残す。準備中カードの中核。 |
| `binsoo-coming-soon.png` | Binsoo [desktop] | https://www.binsoo.app/soon/ | ブランドロゴ＋見出し＋1CTA で準備中をブランド面に。セクション全体準備中時の根拠。 |

## FAQ アコーディオン（13）
| ファイル | 出典 | URL | 採用パターン |
|---|---|---|---|
| `ro-faq-accordion.png` | Ro [desktop] | https://ro.co/faq/ | アコーディオン＋カテゴリ分割。 |
| `livenation-faq-accordion.png` | Live Nation [mobile] | (mobile app) | plus(+)開閉アフォーダンス。 |
| `adidas-membership-faq.png` | adidas [mobile] | (mobile app) | 会員制度FAQのトーン。 |

## プラン/料金 構造補助（07/08）
| ファイル | 出典 | URL | 採用パターン |
|---|---|---|---|
| `peloton-membership-pricing.png` | Peloton [desktop] | https://www.onepeloton.com/en-US/membership | 会員プラン段組＋特徴比較（ショート/ロングの並べ方）。 |
| `groundnews-pricing-tiers.png` | Ground News [desktop] | https://ground.news/subscribe | 3階層 tier＋included 比較表。 |

---

## Sources（WebSearch 代替由来）
- [Fitbit Today dashboard tiles — Android Central](https://www.androidcentral.com/how-use-dashboard-fitbit-android)
- [Apple AirPods Pro page](https://www.apple.com/airpods-pro/)
- [Apple AirPods Pro scroll-triggered animation — Awwwards](https://www.awwwards.com/inspiration/product-scroll-triggered-animation-apple-airpods-pro)
