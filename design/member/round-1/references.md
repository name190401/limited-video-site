# 参照一覧 — QUALIA メンバーページ Round 1

すべて Lazyweb スクリーンショットDB由来（MCP `lazyweb_search` 経由で取得）。代替（WebSearch）由来は0件。
画像は `./references/` にDL済み。各行に「採用パターン」「実画像で目視確認した内容」を併記。
similarity（類似度）/ matchCount は Lazyweb のスコア。

> 注: vision description と実画像が食い違うものは目視で確認し、実画像に基づいて採用パターンを記述した（例: userguiding は vision では「circular avatar」だがフィルタチップ＋カードグリッドだったため、その用途で採用）。

---

## A. 講師/メンバー 丸型写真グリッド・ディレクトリ（セクション2）

| ファイル | 出典 | URL | 採用パターン（実画像確認済み） |
|---|---|---|---|
| `tbr-team-directory-scroll.png` | TBR (mytbr.co) [desktop] sim0.65 | https://mytbr.co/bibliologists/ | **丸型headshot＋プロフィールを縦長スクロールで左右交互配置**。1人あたり「丸写真＋名前＋短い肩書＋bio」のブロック。長尺1枚ページの中の「人を見せる」セクションに直接転用できる構成。 |
| `breathwrk-meet-team-grid.png` | Breathwrk [desktop] sim0.57 | https://www.breathwrk.com/team | **"Meet Our Team" 丸型写真グリッド**（写真＋名前＋役職＋credential）。属性ラベル（役職/資格）の見せ方の参考。 |
| `headspace-teachers-directory.png` | Headspace [desktop] sim0.54 mc2 | https://www.headspace.com/teachers | **講師(teacher)ディレクトリ**。headshot＋短bio＋"Read more"＋"Meet our teachers"カルーセル。主役講師を上に大きく、その他をグリッドで、の2段構成の根拠。 |
| `masterclass-instructor-profile.png` | MasterClass [mobile] sim0.52 | (mobile app) | **講師個人プロフィール**（大きめアバター＋名前＋肩書＋長めbio→"What you'll learn"へ繋ぐ）。主役講師(石井諒)の単独カード設計の参考。 |
| `solstice-team-filter-sidebar.png` | Solstice [desktop] sim0.39 | https://solstice.us/about-solstice/team/ | **左サイドの department フィルタ**（Product/Engineering/Design…）でチームグリッドを絞り込み。「属性で絞り込み」要件の直接の参考。 |
| `userguiding-team-directory.png` | UserGuiding [desktop] sim0.59 | https://userguiding.com/customers | **上部フィルタチップ＋カードグリッド**。属性フィルタを「サイドバー」でなく「上部の横スクロールチップ」で出す案（スマホ向き）の参考。 |

## B. 長尺1枚＋アンカージャンプ・ナビ（全体構造／ハンバーガー）

| ファイル | 出典 | URL | 採用パターン |
|---|---|---|---|
| `discover-longscroll-jump-nav.png` | Discover [desktop] sim0.60 | https://www.discover.com/personal-loans/faqs/ | **長尺1枚ページに jump-to ナビ＋展開/折りたたみブロック**。「縦長＋アンカー目次」の骨格。 |
| `genius-more-menu-grid.png` | Genius [mobile] sim0.57 | (mobile app) | **"More" メニューを大きいアイコンタイルのグリッドで全画面表示**＋閉じるボタン。13セクションへのハンバーガージャンプを「文字リストでなくタイル」で出す案の根拠。 |

## C. 動画 タップ再生（サムネ→YouTube）

| ファイル | 出典 | URL | 採用パターン |
|---|---|---|---|
| `youtube-course-detail-play.png` | YouTube [mobile] sim0.66 | (mobile app) | **大きな中央Playボタン＋hero preview＋メタ情報**（lessons/hours）。タップで再生に入るサムネ設計。 |
| `sequoia-video-grid-play.png` | Sequoia [desktop] sim0.57 | https://www.sequoia.com/resources/videos/ | **Playボタン付きサムネのカードグリッド**（"Client Voices"）。動画×3を横並び/グリッドで出すセクション（耳開け・プラン説明・クロージング）の参考。 |

## D. ロック↔解除（合言葉ペイウォール）

| ファイル | 出典 | URL | 採用パターン |
|---|---|---|---|
| `mimo-locked-modules.png` | Mimo [mobile] sim0.56 mc2 | (mobile app) | **解除済みノード（光るPlayボタン）↔ロックノード（padlock）が同じパスに並ぶ**。威圧的でなく「進めば開く」と感じさせるロック表現。プラン(7)のロック↔解除2状態の中核参照。 |
| `kreativepro-locked-preview.png` | KreativePro [desktop] sim0.47 | https://www.kreativepro.io/spark/cms-stacked-slider | **コンテンツ枠の上に "Locked / Sign up to unlock premium content / Unlock access" ボタン**。中身の存在は見せつつ鍵をかける、ブラー/テクスチャ overlay。 |
| `substack-paywall-blur.png` | Substack [desktop] sim0.62 mc2 | https://substack.com/home/post/p-186215548 | **本文上部だけ見せて下をフェード＋Subscribe CTA**。プランの「触り（ショート）は見せて本編をロック」の見せ方。 |
| `dalus-access-code-modal.png` | Dalus [desktop] sim0.34 | https://www.dalus.io/access | **"This event requires an access code" ＋ 単一入力＋Continue**。合言葉入力UIの最小形（モーダル）。 |
| `sora-invite-code.png` | Sora [mobile] sim0.60 mc2 | (mobile app) | **マルチ桁コード入力＋"アクセスがまだの人へ"の副導線**。合言葉を桁分割で上品に入れる案。 |
| `typo-invite-code-fields.png` | Typo [mobile] sim0.62 mc2 | (mobile app) | **桁分割コード入力＋ペースト導線＋"コードがない場合"リンク**。合言葉ロックの非威圧的な代替導線設計。 |

## E. Coming Soon（準備中）の上品な見せ方

| ファイル | 出典 | URL | 採用パターン |
|---|---|---|---|
| `binsoo-coming-soon.png` | Binsoo [desktop] sim0.56 mc2 | https://www.binsoo.app/soon/ | **ミニマルな "Coming Soon" プレースホルダ**（ブランドロゴ＋大見出し＋1つのCTA）。準備中をブランド面として成立させる。 |
| `confirmed-soon-empty-state.png` | Confirmed [mobile] sim0.59 mc2 | (mobile app) | **"Soon" タブの空状態**（イラスト＋"No drops yet"＋別アクションへ誘導）。準備中でも「次にすること」を残す空状態設計。 |

## F. FAQ アコーディオン（セクション13）

| ファイル | 出典 | URL | 採用パターン |
|---|---|---|---|
| `ro-faq-accordion.png` | Ro [desktop] sim0.59 mc2 | https://ro.co/faq/ | **アコーディオン＋"browse by category"**。質問が多いときのカテゴリ分割。 |
| `livenation-faq-accordion.png` | Live Nation [mobile] sim0.63 mc2 | (mobile app) | **"General Questions" のプラス(+)アイコン開閉アコーディオン**。モバイルでの開閉アフォーダンス（chevron/plus）。 |
| `adidas-membership-faq.png` | adidas [mobile] sim0.58 mc2 | (mobile app) | **会員制度の説明をアコーディオンFAQで**（レベル/ポイント等）。会員制サービスのFAQトーンの参考。 |

## G. プラン/料金 階層・比較（セクション7プラン・8ボーナスの構造補助）

| ファイル | 出典 | URL | 採用パターン |
|---|---|---|---|
| `peloton-membership-pricing.png` | Peloton [desktop] sim0.69 | https://www.onepeloton.com/en-US/membership | **会員プランの段組＋特徴比較表**。ショート/ロングや複数プランの並べ方。 |
| `groundnews-pricing-tiers.png` | Ground News [desktop] sim0.67 | https://ground.news/subscribe | **3階層tier＋included比較表**。プラン差分の表現。 |

## H. 補助参照 — 紺金/高級トーンの長尺hero

| ファイル | 出典 | URL | 採用パターン |
|---|---|---|---|
| `four-seasons-luxury-hero.png` | Four Seasons [desktop] sim0.57 | https://www.fourseasons.com/ | **フルスクリーンhero＋sticky nav＋長尺**。「明るめ・信頼感・余白の効いた高級トーン」の質感参照（重い黒基調でない高級感）。 |

## I. 社会的証明（補助）

| ファイル | 出典 | URL | 採用パターン |
|---|---|---|---|
| `headway-circular-grid-social-proof.png` | Headway [mobile] sim0.36 | (mobile app) | **丸型写真のグリッドを social proof として**並べる。講師グリッド/メンバー実績の見せ方の補助。 |
