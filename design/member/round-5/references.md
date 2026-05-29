# 参照一覧 — 採用案（案Bハイブリッド）で実際に使うもののみ

> Round4 は採用案統合のため、3案分の参照のうち **採用案で実装に使う参照だけ** を抜き出した。設計本体・参照の妥当性は Round3 で PASS 済み（reviewer が iOS/Apple の差し替えを実地 WebFetch で逐語確認、DB スクショ 25 枚を byte 一致で真正確認）。新規参照は追加していない。

## 取得経路の透明性（Round3 から継続）
- DB 由来スクショ（`round-3/references/*.png` に存在）は Lazyweb DB 由来の真正画像で、Round1/2 で URL＋画像を目視一致確認済み。
- WebSearch 代替由来は行末に `[Web代替]` と明記（採用案では iOS ホーム画面のみ該当。Apple AirPods Pro は案C固有のため本採用案では不使用）。
- live 乖離注記が付く参照（substack）はその注記を維持。

---

## A. 採用案の体験構造を決める load-bearing 参照（案B固有）

| ファイル/出典 | プロダクト | URL | 採用案で何を決めているか |
|---|---|---|---|
| `genius-more-menu-grid.png` | Genius [mobile] | (mobile app) | **大アイコンタイルのグリッドを全画面メニューに**＝冒頭ハブ（13タイル）の「分岐の入口」の直接根拠。文字リストでなくタイルで分岐させる。 |
| iOS ホーム画面（hub-and-spoke の規範例） | Apple iOS／解説: Frank Rausch | https://frankrausch.com/ios-navigation/ | **タイルのグリッドが中央ハブとして機能し、各タイルが独立した全画面へ分岐、別機能へ移るには必ずハブに戻る**＝「冒頭ハブ→タイルでセクションへ分岐→ハブに戻る」往復(spoke→hub)の実在根拠。引用: 《"The iOS Home screen…serves as a hub."》《"To switch between the full-screen child views, you always return to the hub first."》 `[Web代替]` |
| `confirmed-soon-empty-state.png` | Confirmed [mobile] | (mobile app) | **タイル/空状態で「準備中」を予告として見せ"次にすること"を残す**＝ハブのタイル上で準備中を扱う採用案の中核。`ComingSoonCard`・09 横ストリップの予告思想の根拠。 |
| `userguiding-team-directory.png` | UserGuiding [desktop] | https://userguiding.com/customers | 上部フィルタチップ＋カードグリッド（02 講師の属性チップ・スマホ向き）。 |

## B. 案A から取り込んだ章扉の根拠（ハイブリッド要素）

| ファイル/出典 | プロダクト | URL | 採用案で何を決めているか |
|---|---|---|---|
| `discover-longscroll-jump-nav.png` | Discover [desktop] | https://www.discover.com/personal-loans/faqs/ | **長尺1枚＋上から順＋アンカー目次**。48px 薄型章扉＋アンカー（`#sec-NN`）で現在地を兼ねる構成の根拠。 |
| `headspace-teachers-directory.png` | Headspace [desktop] | https://www.headspace.com/teachers | **主役を上に大きく→その他をグリッド**＝02 講師の章内構成（石井諒単独カード→丸グリッド）。 |

---

## C. 採用案で共有する横断機能の参照

### 講師グリッド・絞り込み（02）
| ファイル/出典 | プロダクト | URL | 採用パターン |
|---|---|---|---|
| `breathwrk-meet-team-grid.png` | Breathwrk [desktop] | https://www.breathwrk.com/team | **純丸型写真グリッド＋名前＋役職＋credential**。丸型 headshot の主 load-bearing 根拠。 |
| `headway-circular-grid-social-proof.png` | Headway [mobile] | (mobile app) | 純丸型写真グリッドの密度・余白の参考。 |
| `solstice-team-filter-sidebar.png` | Solstice [desktop] | https://solstice.us/about-solstice/team/ | department フィルタ＝属性フィルタの機能根拠。 |
| `tbr-team-directory-scroll.png` | TBR [desktop] | https://mytbr.co/bibliologists/ | 縦スクロール人物ブロック配置の参考（丸根拠でなく配置。live乖離注記済み）。 |

### 動画タップ再生（03/04/05/09/11/12）
| ファイル/出典 | プロダクト | URL | 採用パターン |
|---|---|---|---|
| `youtube-course-detail-play.png` | YouTube [mobile] | (mobile app) | 大Play＋hero preview＋メタ。サムネ→タップ再生。 |
| `sequoia-video-grid-play.png` | Sequoia [desktop] | https://www.sequoia.com/resources/videos/ | Play付きサムネのカードグリッド（動画×3 の 2 列並べ方）。 |

### ロック↔解除（07・案B固有のゲート型）
| ファイル/出典 | プロダクト | URL | 採用パターン |
|---|---|---|---|
| `substack-paywall-blur.png` | Substack [desktop] | https://substack.com/home/post/p-186215548 | **導入文(上半分)は通常表示→金1px区切り線→ハードカットの有料ゲートブロックで本編を遮断**＝07 locked の中核「上は読める/本編はゲートで遮る」。**フェードではなくハードカット**（Round3 訂正済み）。（live 302 注記済み） |
| `dalus-access-code-modal.png` | Dalus [desktop] | https://www.dalus.io/access | **単一入力＋Continue の最小形**＝単一フィールド採用の根拠。 |
| `typo-invite-code-fields.png` | Typo [mobile] | (mobile app) | 桁分割コード入力。**不採用**の比較対象として保持（合言葉は桁数固定でない文字列のため）。 |
| `sora-invite-code.png` | Sora [mobile] | (mobile app) | マルチ桁コード。同上、桁分割不採用の比較対象。 |

### Coming Soon（準備中・全セクション）
| ファイル/出典 | プロダクト | URL | 採用パターン |
|---|---|---|---|
| `confirmed-soon-empty-state.png` | Confirmed [mobile] | (mobile app) | 「Soon」空状態＝予告＋"次にすること"。ComingSoonCard の中核。 |
| `binsoo-coming-soon.png` | Binsoo [desktop] | https://www.binsoo.app/soon/ | ブランドロゴ＋見出し＋1CTA。セクション全体準備中時の最小カードの根拠。 |

### FAQ アコーディオン（13）
| ファイル/出典 | プロダクト | URL | 採用パターン |
|---|---|---|---|
| `ro-faq-accordion.png` | Ro [desktop] | https://ro.co/faq/ | アコーディオン＋カテゴリ分割。 |
| `livenation-faq-accordion.png` | Live Nation [mobile] | (mobile app) | plus(+) 開閉アフォーダンス。 |
| `adidas-membership-faq.png` | adidas [mobile] | (mobile app) | 会員制度FAQのトーン。 |

### プラン/料金 構造補助（07/08）
| ファイル/出典 | プロダクト | URL | 採用パターン |
|---|---|---|---|
| `peloton-membership-pricing.png` | Peloton [desktop] | https://www.onepeloton.com/en-US/membership | 会員プラン段組＋特徴比較（ショート/ロングの並べ方）。 |
| `groundnews-pricing-tiers.png` | Ground News [desktop] | https://ground.news/subscribe | 3階層 tier＋included 比較表（プラン比較の補助）。 |

---

## 採用案で使わない参照（参考: 不採用案固有のため Round4 から除外）
- `kreativepro-locked-preview.png`（案C "扉" 型ロック）— 採用案は Substack 型ゲートのため不使用。
- Apple AirPods Pro page（案C 没入 scrollytelling 根拠）— 採用案は非線形ハブのため不使用。
- `masterclass-instructor-profile.png`（案C 1画面講師パネル）— 採用案は単独カード→グリッドのため不使用。
- `four-seasons-luxury-hero.png`（案A/C のトーン参考）— hero トーンは既存トークンで成立するため不使用。

## Sources（WebSearch 代替由来・採用案で使うもの）
- [Modern iOS Navigation Patterns — Frank Rausch（hub-and-spoke の規範例＝iOS ホーム画面）](https://frankrausch.com/ios-navigation/) — 採用案ハブの往復(spoke→hub)根拠。
- 補足参考（非 load-bearing・定義確認）: [Show Me the Way to Go Anywhere — IxDF](https://www.interaction-design.org/literature/article/show-me-the-way-to-go-anywhere-navigation-for-mobile-applications) — hub-and-spoke の定義「shift from one spoke to another – you must do so via the hub」。
