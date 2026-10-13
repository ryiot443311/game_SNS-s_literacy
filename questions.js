/*
 * 問題データ。ここを編集・追加するだけで問題を増やせます。
 *
 * answer: 'post'   = 投稿して問題ない
 *         'delete' = 削除（投稿しない）のが正解
 * category: CATEGORIES のキーのどれか
 * 'post' と 'delete' の問題は、それぞれ最低5問以上必要です（test.js で検査します）。
 */
(function (root) {
  'use strict';

  var CATEGORIES = {
    privacy: '個人情報・プライバシー',
    respect: '誹謗中傷・言葉づかい',
    fake: '情報の真偽・デマ',
    rights: '著作権・ネタバレ',
    scam: '詐欺・セキュリティ',
    daily: '日常の投稿'
  };

  var QUESTIONS = [
    // ---- 削除したほうがよい投稿 ----
    {
      id: 'r01', category: 'privacy', answer: 'delete',
      text: '旅行の写真を投稿。家の表札と最寄り駅の看板がはっきり写っている。',
      explain: '写真の背景から自宅が特定されるおそれがあります。'
    },
    {
      id: 'r02', category: 'privacy', answer: 'delete',
      text: '子どもの制服と学校名が分かる写真を、位置情報つきで投稿。',
      explain: '子どもの通学先や行動範囲が分かり、危険につながるおそれがあります。'
    },
    {
      id: 'r03', category: 'privacy', answer: 'delete',
      text: '届いた荷物の写真を投稿。送り状の氏名と住所がそのまま見えている。',
      explain: '氏名や住所は個人情報です。隠してから投稿しましょう。'
    },
    {
      id: 'r04', category: 'privacy', answer: 'delete',
      text: '友達の顔がはっきり写った飲み会の写真を、本人に聞かずに投稿。',
      explain: '写っている人に先に確認するのがマナーです。'
    },
    {
      id: 'r05', category: 'respect', answer: 'delete',
      text: '会社名を出して、上司の悪口を書く。スッキリしたい。',
      explain: '特定されると、人間関係や仕事でトラブルになるおそれがあります。'
    },
    {
      id: 'r06', category: 'respect', answer: 'delete',
      text: '店の対応が悪かったので、店員さんの顔写真と名前をさらす。',
      explain: '個人を攻撃する投稿は、本人の生活に大きな被害を与えかねません。'
    },
    {
      id: 'r07', category: 'respect', answer: 'delete',
      text: '根拠はないけれど、近所のあの人はお金に困っているらしい、と書く。',
      explain: '確かめていない憶測は、相手を傷つけ、名誉を損なうおそれがあります。'
    },
    {
      id: 'r08', category: 'fake', answer: 'delete',
      text: '出どころの分からないニュースだけど、面白そうだから拡散しよう。',
      explain: '確認する前の拡散は、デマを広げる側になるかもしれません。'
    },
    {
      id: 'r09', category: 'fake', answer: 'delete',
      text: '「この水を飲めば病気が治る」という話を、そのまま紹介する。',
      explain: '根拠のない健康情報は、読んだ人が危険な判断をするおそれがあります。'
    },
    {
      id: 'r10', category: 'fake', answer: 'delete',
      text: '数年前の迷子情報を、日付を確認せずに「拡散希望」で再投稿。',
      explain: '古い情報の再投稿は、混乱や無駄な心配を生みます。日付や出典を確認しましょう。'
    },
    {
      id: 'r11', category: 'rights', answer: 'delete',
      text: '映画館で上映中のシーンをスマホで撮影して投稿。',
      explain: '上映中の無断撮影・公開は、著作権の面でも映画館のルールでも問題になります。'
    },
    {
      id: 'r12', category: 'rights', answer: 'delete',
      text: '買ったマンガの好きな話を、全ページ撮影して投稿。',
      explain: '買っても、作品を丸ごと公開してよいわけではありません。'
    },
    {
      id: 'r13', category: 'rights', answer: 'delete',
      text: '新作映画の結末を、ネタバレ注意の表示なしで書く。',
      explain: 'まだ観ていない人の楽しみを奪ってしまいます。注意書きが必要です。'
    },
    {
      id: 'r14', category: 'scam', answer: 'delete',
      text: '「当選しました！」というメールのリンクを、友達にもシェアする。',
      explain: '詐欺やフィッシングの可能性があります。広めると被害が増えるおそれがあります。'
    },
    {
      id: 'r15', category: 'scam', answer: 'delete',
      text: 'ログイン画面のスクリーンショット。パスワード欄の文字が見えている。',
      explain: 'パスワードが見えると、アカウントを乗っ取られるおそれがあります。'
    },
    {
      id: 'r16', category: 'privacy', answer: 'delete',
      text: 'スマホ画面のスクリーンショットを投稿。通知に他の人のメッセージが写っている。',
      explain: '他の人の私的なやりとりが見えてしまいます。写り込みを確認しましょう。'
    },
    {
      id: 'r17', category: 'respect', answer: 'delete',
      text: '腹が立ったので、冷静になる前に相手へ強い言葉で返信する。',
      explain: '感情のまま送った言葉は、あとで取り消せないことがあります。少し時間をおきましょう。'
    },
    {
      id: 'r18', category: 'scam', answer: 'delete',
      text: '搭乗券の写真を「旅行が楽しみ！」と投稿。バーコードがそのまま写っている。',
      explain: 'バーコードには予約情報が含まれることがあります。写さないか隠しましょう。'
    },

    // ---- 投稿して問題ない投稿 ----
    {
      id: 's01', category: 'daily', answer: 'post',
      text: '今日のランチはカレー。スパイスが効いておいしかった。',
      explain: 'ふつうの日常投稿です。安心して投稿できます。'
    },
    {
      id: 's02', category: 'respect', answer: 'post',
      text: '電車で席をゆずってもらった。ありがとうございました。',
      explain: '感謝を伝える、あたたかい投稿です。'
    },
    {
      id: 's03', category: 'rights', answer: 'post',
      text: '読んだ本の感想を書いた。結末には触れず、おすすめのポイントだけ。',
      explain: 'ネタバレに配慮した感想なので、問題ありません。'
    },
    {
      id: 's04', category: 'privacy', answer: 'post',
      text: '散歩中に見つけた猫の写真。人も場所の手がかりも写っていない。',
      explain: '個人や場所の特定につながらない、ほほえましい投稿です。'
    },
    {
      id: 's05', category: 'privacy', answer: 'post',
      text: '友達に「載せてもいい？」と聞いて、OKをもらった集合写真を投稿。',
      explain: '写っている人の許可を取っているので、問題ありません。'
    },
    {
      id: 's06', category: 'fake', answer: 'post',
      text: '公式サイトで日程を確認したイベントを、公式ページのリンクつきで紹介。',
      explain: '出典を確認し、元の情報へのリンクもあるので、安心して共有できます。'
    },
    {
      id: 's07', category: 'rights', answer: 'post',
      text: '自分で描いたイラストを投稿する。',
      explain: '自分の作品は、自分の判断で公開できます。'
    },
    {
      id: 's08', category: 'daily', answer: 'post',
      text: '地元のお祭りに行った感想。人の顔は写さず、楽しかったことだけ書く。',
      explain: '周りの人に配慮した、ふつうの感想です。'
    },
    {
      id: 's09', category: 'respect', answer: 'post',
      text: '行ったお店のおいしかったメニューと、店員さんの気づかいへのお礼。',
      explain: '感謝を伝える投稿は、誰も傷つけません。'
    },
    {
      id: 's10', category: 'daily', answer: 'post',
      text: '今朝の空がきれいだったので、景色の写真を投稿。',
      explain: '人や個人情報が写っていない景色の写真なら、問題ありません。'
    },
    {
      id: 's11', category: 'rights', answer: 'post',
      text: '読んだ記事のリンクを貼って、自分の感想をひとこと添える。',
      explain: '出典がはっきりしていて、記事を丸写ししていないので問題ありません。'
    },
    {
      id: 's12', category: 'fake', answer: 'post',
      text: '昨日の投稿に間違いがあったので、訂正して謝るお知らせを投稿する。',
      explain: '誤りに気づいたら、早めに訂正するのが誠実な対応です。'
    }
  ];

  var api = { CATEGORIES: CATEGORIES, QUESTIONS: QUESTIONS };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.SNSQ = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
