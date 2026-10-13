// 実行: node test.js
'use strict';
const assert = require('node:assert/strict');
const { CATEGORIES, QUESTIONS } = require('./questions.js');
const G = require('./game.js');

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('ok   ' + name);
  } catch (e) {
    console.error('FAIL ' + name + '\n     ' + e.message);
    process.exitCode = 1;
  }
}

// 乱数を固定したいとき用（線形合同法）
function seeded(seed) {
  let s = seed >>> 0;
  return function () {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

test('問題データ: 必須項目が揃っている', () => {
  QUESTIONS.forEach((q) => {
    assert.ok(q.id && typeof q.id === 'string', 'id がない');
    assert.ok(q.text && q.text.trim().length > 0, q.id + ': text が空');
    assert.ok(q.explain && q.explain.trim().length > 0, q.id + ': explain が空');
    assert.ok(['post', 'delete'].includes(q.answer), q.id + ': answer が不正 ' + q.answer);
    assert.ok(Object.prototype.hasOwnProperty.call(CATEGORIES, q.category), q.id + ': category が不正 ' + q.category);
  });
});

test('問題データ: id が重複していない', () => {
  const ids = QUESTIONS.map((q) => q.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('問題データ: 文章が重複していない', () => {
  const texts = QUESTIONS.map((q) => q.text);
  assert.equal(new Set(texts).size, texts.length);
});

test('問題データ: post / delete が各5問以上ある', () => {
  const posts = QUESTIONS.filter((q) => q.answer === 'post').length;
  const dels = QUESTIONS.filter((q) => q.answer === 'delete').length;
  assert.ok(posts >= G.PER_SIDE, 'post が ' + posts + ' 問');
  assert.ok(dels >= G.PER_SIDE, 'delete が ' + dels + ' 問');
});

test('問題データ: すべての分野に1問以上ある', () => {
  Object.keys(CATEGORIES).forEach((k) => {
    assert.ok(QUESTIONS.some((q) => q.category === k), k + ' の問題がない');
  });
});

test('shuffle: 元の配列を変えず、要素は保たれる', () => {
  const src = [1, 2, 3, 4, 5, 6, 7, 8];
  const copy = src.slice();
  const out = G.shuffle(src, seeded(1));
  assert.deepEqual(src, copy);
  assert.deepEqual(out.slice().sort(), copy);
});

test('pickRound: 10問、post 5問・delete 5問、重複なし（300回）', () => {
  for (let i = 0; i < 300; i++) {
    const round = G.pickRound(QUESTIONS, seeded(i + 1));
    assert.equal(round.length, 10);
    assert.equal(round.filter((q) => q.answer === 'post').length, 5);
    assert.equal(round.filter((q) => q.answer === 'delete').length, 5);
    assert.equal(new Set(round.map((q) => q.id)).size, 10);
  }
});

test('pickRound: 乱数なしでも動き、全問題がいつか出題される', () => {
  const seen = new Set();
  for (let i = 0; i < 500; i++) {
    G.pickRound(QUESTIONS).forEach((q) => seen.add(q.id));
  }
  assert.equal(seen.size, QUESTIONS.length);
});

test('pickRound: 問題が足りなければエラー', () => {
  assert.throws(() => G.pickRound(QUESTIONS.slice(0, 3)));
});

test('judge: 4パターンの得点', () => {
  const qs = { post: { answer: 'post' }, del: { answer: 'delete' } };
  let r = G.judge(qs.post, 'post', 100);
  assert.deepEqual([r.correct, r.delta, r.followers], [true, 50, 150]);
  r = G.judge(qs.del, 'delete', 100);
  assert.deepEqual([r.correct, r.delta, r.followers], [true, 20, 120]);
  r = G.judge(qs.del, 'post', 100);
  assert.deepEqual([r.correct, r.delta, r.followers], [false, -80, 20]);
  r = G.judge(qs.post, 'delete', 100);
  assert.deepEqual([r.correct, r.delta, r.followers], [false, -10, 90]);
});

test('judge: フォロワーは0未満にならない', () => {
  assert.equal(G.judge({ answer: 'delete' }, 'post', 30).followers, 0);
  assert.equal(G.judge({ answer: 'post' }, 'delete', 5).followers, 0);
});

test('judge: メッセージに得点が含まれる', () => {
  assert.match(G.judge({ answer: 'post' }, 'post', 0).message, /\+50/);
  assert.match(G.judge({ answer: 'delete' }, 'post', 100).message, /-80/);
});

test('rankFor: 境界値（10問中）', () => {
  assert.equal(G.rankFor(10, 10), 'ネットリテラシーの達人');
  assert.equal(G.rankFor(9, 10), 'ネットリテラシーの達人');
  assert.equal(G.rankFor(8, 10), '安心して見ていられるアカウント');
  assert.equal(G.rankFor(7, 10), '安心して見ていられるアカウント');
  assert.equal(G.rankFor(6, 10), 'ちょっと危ういアカウント');
  assert.equal(G.rankFor(5, 10), 'ちょっと危ういアカウント');
  assert.equal(G.rankFor(4, 10), '炎上常連アカウント');
  assert.equal(G.rankFor(0, 10), '炎上常連アカウント');
  assert.equal(G.rankFor(0, 0), '炎上常連アカウント');
});

test('summarize: 分野ごとに集計される', () => {
  const results = [
    { q: { category: 'privacy' }, correct: true },
    { q: { category: 'privacy' }, correct: false },
    { q: { category: 'fake' }, correct: true }
  ];
  const s = G.summarize(results, CATEGORIES);
  assert.deepEqual(s, [
    { key: 'privacy', label: CATEGORIES.privacy, correct: 1, total: 2 },
    { key: 'fake', label: CATEGORIES.fake, correct: 1, total: 1 }
  ]);
});

test('通しプレイ: 全問正解 → 最高ランク / 全問不正解 → 最低ランク', () => {
  const round = G.pickRound(QUESTIONS, seeded(42));
  let f = G.START_FOLLOWERS;
  let good = 0;
  round.forEach((q) => { const r = G.judge(q, q.answer, f); f = r.followers; if (r.correct) good++; });
  assert.equal(good, 10);
  assert.equal(f, 100 + 5 * 50 + 5 * 20);
  assert.equal(G.rankFor(good, 10), 'ネットリテラシーの達人');

  f = G.START_FOLLOWERS; good = 0;
  round.forEach((q) => {
    const wrong = q.answer === 'post' ? 'delete' : 'post';
    const r = G.judge(q, wrong, f); f = r.followers; if (r.correct) good++;
  });
  assert.equal(good, 0);
  assert.equal(f, 0);
  assert.equal(G.rankFor(good, 10), '炎上常連アカウント');
});

console.log('\n' + passed + ' 件のテストが成功しました' + (process.exitCode ? '（失敗あり）' : ''));
