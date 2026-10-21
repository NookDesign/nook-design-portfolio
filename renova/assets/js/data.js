/* ==========================================================
   RENOVA｜サイトのデータ（ここを書きかえると全ページに反映）
   ----------------------------------------------------------
   - SITE    … ブランド名・会社概要・お知らせ・メニュー
   - WORKS   … 施工事例（一覧ページと詳細ページの両方で使う）
   ※ すべて架空の情報です。実在の企業・住所・電話番号は書かないでください。
   ========================================================== */

window.RENOVA = window.RENOVA || {};

RENOVA.SITE = {
  brand: "RENOVA",
  tagline: "住まいを、作品に。",
  taglineEn: "Redefine the way you live.",
  notice: "このサイトは、Nook Design がポートフォリオ用に制作した架空のブランドのデザインサンプルです。",

  // ヘッダー・フッターのメニュー（上から順に表示）
  nav: [
    { id: "concept", label: "Concept", ja: "コンセプト", href: "concept.html" },
    { id: "works", label: "Works", ja: "施工事例", href: "works.html" },
    { id: "service", label: "Service", ja: "サービス", href: "service.html" },
    { id: "about", label: "About", ja: "会社紹介", href: "about.html" },
    { id: "contact", label: "Contact", ja: "お問い合わせ", href: "contact.html" }
  ],

  // 会社概要（ABOUT ページとフッターで使う）
  company: [
    { label: "ブランド名", value: "RENOVA（リノヴァ）※架空のブランド" },
    { label: "事業内容", value: "住宅リノベーションの設計・施工監理、空間設計、内装デザイン、素材・設備のご提案（いずれも設定）" },
    { label: "対応エリア", value: "東京都・神奈川県・千葉県・埼玉県（設定上のエリア）" },
    { label: "所在地", value: "掲載していません（架空のブランドのため）" },
    { label: "連絡先", value: "お問い合わせフォーム（デモ）のみ。電話番号・メールアドレスは掲載していません" },
    { label: "制作", value: "Nook Design（ポートフォリオ作品）" }
  ],

  // 対応エリア（ABOUT ページ）
  areas: [
    { name: "東京都", note: "23区・多摩エリア" },
    { name: "神奈川県", note: "横浜・川崎・湘南エリア" },
    { name: "千葉県", note: "北西部エリア" },
    { name: "埼玉県", note: "南部エリア" }
  ],

  // お知らせ（トップページ）
  news: [
    { date: "2026-10-12", category: "Works", title: "施工事例「Light and Shadow」を公開しました", href: "works-detail.html?id=light-and-shadow" },
    { date: "2026-09-28", category: "Event", title: "素材サンプルを手に取れる相談会を、予約制で開催します（架空のイベント）", href: "contact.html" },
    { date: "2026-09-03", category: "Info", title: "ウェブサイトを公開しました（ポートフォリオ用の架空サイトです）", href: "about.html" }
  ]
};

/* ----------------------------------------------------------
   施工事例
   - id        … URL に使う英数字（works-detail.html?id=○○）
   - category  … フィルターの分類（residence / house / commercial）
   - images    … assets/images/ からのパス（拡張子なし）。main と、ギャラリー用の g1〜g3（ある分だけ）
   -              改修前の写真（before）は今はありません。入れると詳細ページに比較スライダーが出ます
   ---------------------------------------------------------- */
RENOVA.CATEGORIES = [
  { id: "all", label: "All", ja: "すべて" },
  { id: "residence", label: "Residence", ja: "マンション" },
  { id: "house", label: "House", ja: "戸建て" },
  { id: "commercial", label: "Commercial", ja: "店舗・オフィス" }
];

RENOVA.WORKS = [
  {
    id: "urban-residence",
    no: "01",
    title: "Urban Residence",
    category: "residence",
    place: "東京都",
    type: "マンション・フルリノベーション",
    size: "82㎡",
    age: "築28年",
    period: "設計3か月／施工3か月",
    year: "2025",
    lead: "細かく仕切られた3LDKを、木と石でまとめたひとつながりのLDKへ。",
    concept: [
      "既存の間仕切りを取り払い、窓際からキッチンまでを一枚の大きな空間として再構成しました。",
      "空間の中ほどに木の柱を一本残し、くつろぐ場所と料理をする場所をゆるやかに分けています。床は明るい石、家具や収納は木でそろえ、夕方の光がやわらかく回る住まいにしました。"
    ],
    points: [
      { title: "木の柱でゆるやかに分ける", text: "壁を立てずに、木の柱と家具の配置でリビングとキッチンの居場所をつくりました。" },
      { title: "石と木の組み合わせ", text: "ローテーブルや洗面台には石を、収納や壁には木を使い、素材の対比で落ち着きを出しています。" },
      { title: "壁一面の木の収納", text: "生活用品はキッチン側の木の収納にまとめ、見せるものと隠すものを整理しました。" }
    ],
    before: "細かい個室と廊下に分かれ、窓からの光が奥まで届かない間取りでした。",
    after: "壁を取り払い、窓からの光がキッチンまで届くひとつながりのLDKに。",
    images: { main: "photos/works-urban-living-01", g1: "photos/works-urban-washroom-01", g2: "photos/works-urban-living-02" },
    alt: {
      main: "木の柱と石のローテーブルがあるリビング。奥に木の棚のキッチン、大きな窓の外に緑が見える",
      g1: "石の洗面台と黒い水栓。窓からの光が壁に木の葉の影を落としている",
      g2: "木の壁のキッチンとダイニングテーブル、手前にソファがあるLDK"
    }
  },
  {
    id: "quiet-house",
    no: "02",
    title: "Quiet House",
    category: "house",
    place: "神奈川県",
    type: "戸建て・部分リノベーション",
    size: "104㎡",
    age: "築35年",
    period: "設計2か月／施工2か月",
    year: "2025",
    lead: "庭の緑と、塗り壁に落ちる光。静けさを大切にした居間。",
    concept: [
      "庭に面した壁を大きなガラス戸に改め、ソファに座ったまま庭の木々を眺められるようにしました。",
      "壁は温かみのある塗り壁で仕上げ、飾り棚のニッチに季節の枝ものを置けるようにしています。装飾を抑え、光と影の移ろいが主役になる居間です。"
    ],
    points: [
      { title: "庭へ開くガラス戸", text: "床から天井近くまでのガラス戸で、室内と庭の境界をやわらかくしました。" },
      { title: "飾り棚のニッチ", text: "壁をくぼませた飾り棚に、器や枝ものを置いて季節を感じられるようにしました。" },
      { title: "塗り壁の陰影", text: "手仕事の凹凸が残る塗り壁が、一日の光の変化を静かに映します。" }
    ],
    before: "小さな腰高窓とビニールクロスの壁で、庭とのつながりを感じにくい部屋でした。",
    after: "大きなガラス戸と塗り壁で、庭の緑と光を室内に取り込む居間に。",
    images: { main: "photos/works-quiet-living-01", g1: "photos/works-quiet-niche-01", g2: "photos/works-quiet-window-01" },
    alt: {
      main: "絵が掛かった塗り壁とソファのある居間。大きなガラス戸の外に庭の木々が見える",
      g1: "壁のくぼみの飾り棚に置かれた花器と枝もの。塗り壁に光が当たっている",
      g2: "庭に面したガラス戸のそばに置かれたソファと、床に落ちる光"
    }
  },
  {
    id: "natural-living",
    no: "03",
    title: "Natural Living",
    category: "house",
    place: "千葉県",
    type: "戸建て・フルリノベーション",
    size: "96㎡",
    age: "築30年",
    period: "設計3か月／施工4か月",
    year: "2026",
    lead: "家族が集まる大きなテーブルと、庭へ開く窓。明るい木で整えた暮らしの中心。",
    concept: [
      "1階の和室と台所を一体にし、庭に面した壁を大きな開口に変えました。",
      "ダイニングテーブル・キッチン・収納には木を使い、明るい塗り壁と組み合わせることで、光が回る空間に。食事・料理・くつろぎが一つの部屋で自然につながります。"
    ],
    points: [
      { title: "庭とつながる開口", text: "床から天井近くまでの窓で、室内と庭の境界をやわらかくしました。" },
      { title: "大きなダイニングテーブル", text: "家族や友人が集まれる大きな木のテーブルを、部屋の中心に置きました。" },
      { title: "木でそろえたキッチン", text: "キッチンと収納の木の色をそろえ、明るく落ち着いた印象にまとめています。" }
    ],
    before: "和室と台所が壁で分かれ、庭側の窓も小さく、日中も照明が必要な部屋でした。",
    after: "庭へ大きく開き、日中は照明いらずの明るいダイニングリビングに。",
    images: { main: "photos/works-natural-dining-01", g1: "photos/works-natural-table-01", g2: "photos/works-natural-kitchen-01" },
    alt: {
      main: "木のダイニングテーブルと椅子、奥に木の壁のキッチン、手前にソファがある明るいLDK。窓の外に庭の緑が見える",
      g1: "木のテーブルの上に置かれた石の器と枝。テーブルに木の葉の影が落ちている",
      g2: "ソファと木のキッチンカウンターが並ぶLDK。ペンダントライトが灯っている"
    }
  },
  {
    id: "modern-renovation",
    no: "04",
    title: "Modern Renovation",
    category: "residence",
    place: "東京都",
    type: "マンション・キッチンリノベーション",
    size: "68㎡",
    age: "築22年",
    period: "設計2か月／施工6週間",
    year: "2026",
    lead: "壁付けの台所を、住まいの中心に。石と木で仕立てたアイランドキッチン。",
    concept: [
      "壁付けで孤立していたキッチンを、リビングの中央へ移しました。",
      "調理台には石、背面の壁と収納には木を使い、料理をする人と過ごす人が自然に向かい合える配置としています。"
    ],
    points: [
      { title: "中心に置くアイランド", text: "石の調理台が、料理・食事・作業の場所を兼ねます。" },
      { title: "木の壁面収納", text: "冷蔵庫や家電は、木の扉の内側にすっきり収めました。" },
      { title: "食卓を照らす照明", text: "大きなペンダントライトで、食卓をやわらかく照らします。" }
    ],
    before: "壁付けのキッチンが廊下側にあり、家族の気配が感じにくい間取りでした。",
    after: "キッチンを中心に、家族が向かい合って過ごせるLDKに。",
    images: { main: "photos/works-modern-kitchen-01", g1: "photos/works-modern-living-01", g2: "photos/works-modern-dining-01" },
    alt: {
      main: "石の天板のアイランドキッチンと木の壁。手前にダイニングチェアが並ぶ",
      g1: "絵が掛かった壁とソファのあるリビング。窓の外に緑が見える",
      g2: "木の天井の下の大きなダイニングテーブルと、低く吊られたペンダントライト"
    }
  },
  {
    id: "light-and-shadow",
    no: "05",
    title: "Light and Shadow",
    category: "commercial",
    place: "東京都",
    type: "オフィス・ギャラリー改修",
    size: "120㎡",
    age: "築40年",
    period: "設計3か月／施工2か月",
    year: "2026",
    lead: "光の帯が移ろう、奥へと続くギャラリー兼オフィス。",
    concept: [
      "倉庫として使われていた細長い空間を、奥へと光が導く廊下のような構成に改めました。",
      "木の壁、石の壁、塗り壁。素材を少しずつ切りかえながら、時間とともに移ろう光と影そのものを展示する空間です。"
    ],
    points: [
      { title: "奥へ導く廊下", text: "突き当たりに光の当たる壁を置き、自然と奥へ進みたくなる動線にしました。" },
      { title: "光を映す木の壁", text: "縦張りの木の壁に、窓からの光が縞模様になって落ちます。" },
      { title: "石の階段と壁", text: "上階へ続く階段と壁を石で仕上げ、光の当たり方で表情が変わるようにしました。" }
    ],
    before: "窓が少なく、間仕切りで区切られた倉庫でした。",
    after: "光と影の移ろいを楽しめる、ギャラリー兼オフィスに。",
    images: { main: "photos/works-light-corridor-01", g1: "photos/works-light-stair-01", g2: "photos/works-light-wood-01", g3: "photos/works-light-stone-01" },
    alt: {
      main: "塗り壁と木の壁に挟まれた、奥へ続く明るい廊下。突き当たりに植物が置かれている",
      g1: "石で仕上げた階段と壁に、斜めの光と木の葉の影が落ちている",
      g2: "縦張りの木の壁に、窓からの光が縞模様に落ちている",
      g3: "黒い石の壁と明るい石の壁、その間の出入り口に光と影が落ちている"
    }
  },
  {
    id: "timeless-interior",
    no: "06",
    title: "Timeless Interior",
    category: "house",
    place: "埼玉県",
    type: "戸建て・全面リノベーション",
    size: "132㎡",
    age: "築45年",
    period: "設計4か月／施工5か月",
    year: "2025",
    lead: "木の天井と石の壁。長く住み継ぐための、落ち着いた住まい。",
    concept: [
      "天井を木で張り直し、居間から庭へ視線が抜けるように開口を広げました。",
      "寝室や浴室にも木と石を使い、家じゅうを同じ素材でつないでいます。流行に左右されず、年月とともに味わいが増す住まいを目指しました。"
    ],
    points: [
      { title: "木の天井", text: "居間の天井を木で仕上げ、包み込まれるような落ち着きをつくりました。" },
      { title: "木の壁の寝室", text: "寝室のベッドの背面を木の壁にし、やわらかな間接照明を組み込みました。" },
      { title: "庭を望む浴室", text: "浴槽を窓辺に置き、庭の緑を眺めながら過ごせる浴室にしました。" }
    ],
    before: "天井が低く、部屋が細かく分かれていて、庭が見えにくい住まいでした。",
    after: "木の天井と大きな開口で、庭を身近に感じる住まいに。",
    images: { main: "photos/works-timeless-living-01", g1: "photos/works-timeless-bedroom-02", g2: "photos/works-timeless-bedroom-01", g3: "photos/works-timeless-bath-01" },
    alt: {
      main: "木の天井の居間。ソファとガラス戸の向こうに庭の木々が見える",
      g1: "ランプが灯る寝室。ベッドの横に花器が置かれ、壁に光が当たっている",
      g2: "木の壁を背にしたベッドと、大きなガラス戸のある寝室",
      g3: "窓辺に置かれた白い浴槽と、窓の外の庭の木"
    }
  }
];
