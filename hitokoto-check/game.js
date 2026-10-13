/*
 * ゲームのロジックと画面の制御。
 * 上半分は DOM に依存しない関数（test.js から Node で検査できます）。
 */
(function (root) {
  'use strict';

  var Q = (typeof module !== 'undefined' && module.exports && typeof require === 'function')
    ? require('./questions.js')
    : root.SNSQ;

  var PER_SIDE = 5;           // 「投稿OK」「削除」を各5問 → 合計10問
  var START_FOLLOWERS = 100;
  var SCORE = {
    postOk: 50,      // 問題ない投稿を投稿した
    deleteOk: 20,    // 危ない投稿を削除して炎上を回避した
    postBad: -80,    // 危ない投稿を投稿してしまった
    deleteBad: -10   // 投稿してよい内容を削除した
  };

  // ---------- 純粋なロジック ----------

  function shuffle(arr, rng) {
    var random = rng || Math.random;
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function pickRound(questions, rng, perSide) {
    var n = perSide || PER_SIDE;
    var posts = questions.filter(function (q) { return q.answer === 'post'; });
    var dels = questions.filter(function (q) { return q.answer === 'delete'; });
    if (posts.length < n || dels.length < n) {
      throw new Error('問題数が足りません（各 ' + n + ' 問以上必要です）');
    }
    var picked = shuffle(posts, rng).slice(0, n).concat(shuffle(dels, rng).slice(0, n));
    return shuffle(picked, rng);
  }

  function judge(question, choice, followers) {
    var correct = (choice === question.answer);
    var delta, message;
    if (correct && choice === 'post') {
      delta = SCORE.postOk;
      message = 'いいね！ +' + delta + '人。';
    } else if (correct) {
      delta = SCORE.deleteOk;
      message = '炎上を回避！ +' + delta + '人。';
    } else if (choice === 'post') {
      delta = SCORE.postBad;
      message = '炎上してしまった… ' + delta + '人。';
    } else {
      delta = SCORE.deleteBad;
      message = '投稿してよい内容でした。' + delta + '人。';
    }
    return {
      correct: correct,
      delta: delta,
      followers: Math.max(0, followers + delta),
      message: message
    };
  }

  function rankFor(correct, total) {
    var ratio = total > 0 ? correct / total : 0;
    if (ratio >= 0.9) return 'ネットリテラシーの達人';
    if (ratio >= 0.7) return '安心して見ていられるアカウント';
    if (ratio >= 0.5) return 'ちょっと危ういアカウント';
    return '炎上常連アカウント';
  }

  // results: [{ q: question, choice: 'post'|'delete', correct: boolean }]
  function summarize(results, categories) {
    var map = {};
    var order = [];
    results.forEach(function (r) {
      var key = r.q.category;
      if (!map[key]) {
        map[key] = { key: key, label: categories[key] || key, correct: 0, total: 0 };
        order.push(key);
      }
      map[key].total++;
      if (r.correct) map[key].correct++;
    });
    return order.map(function (k) { return map[k]; });
  }

  var logic = {
    PER_SIDE: PER_SIDE,
    START_FOLLOWERS: START_FOLLOWERS,
    SCORE: SCORE,
    shuffle: shuffle,
    pickRound: pickRound,
    judge: judge,
    rankFor: rankFor,
    summarize: summarize
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = logic;
  }

  // ---------- 画面の制御（ブラウザのみ） ----------

  if (typeof document === 'undefined') return;

  var $ = function (id) { return document.getElementById(id); };
  var state = null;

  function showScreen(name) {
    ['start', 'play', 'result'].forEach(function (n) {
      $('screen-' + n).hidden = (n !== name);
    });
  }

  function startGame() {
    state = {
      round: pickRound(Q.QUESTIONS),
      idx: 0,
      followers: START_FOLLOWERS,
      results: [],
      answered: false
    };
    renderQuestion();
    showScreen('play');
  }

  function renderQuestion() {
    var q = state.round[state.idx];
    state.answered = false;
    $('progress').textContent = (state.idx + 1) + ' / ' + state.round.length;
    $('followers').textContent = String(state.followers);
    $('draft').textContent = q.text;
    var fb = $('feedback');
    fb.textContent = '';
    fb.className = 'feedback';
    $('btn-next').hidden = true;
  }

  function answer(choice) {
    if (!state || state.answered) return;
    state.answered = true;
    var q = state.round[state.idx];
    var r = judge(q, choice, state.followers);
    state.followers = r.followers;
    state.results.push({ q: q, choice: choice, correct: r.correct });

    var fb = $('feedback');
    fb.className = 'feedback ' + (r.correct ? 'ok' : 'ng');
    fb.textContent = r.message + ' ' + q.explain;
    $('followers').textContent = String(state.followers);
    $('btn-next').textContent = (state.idx === state.round.length - 1) ? '結果を見る' : '次へ';
    $('btn-next').hidden = false;
    $('btn-next').focus();
  }

  function nextStep() {
    if (!state || !state.answered) return;
    state.idx++;
    if (state.idx >= state.round.length) {
      renderResult();
    } else {
      renderQuestion();
    }
  }

  function clearChildren(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function shareText() {
    var total = state.results.length;
    var correct = state.results.filter(function (r) { return r.correct; }).length;
    return 'ひとことチェック（SNSリテラシー診断）で ' + correct + ' / ' + total +
      ' 問正解！ ランク：' + rankFor(correct, total) +
      '（フォロワー ' + state.followers + ' 人）';
  }

  function renderResult() {
    var total = state.results.length;
    var correct = state.results.filter(function (r) { return r.correct; }).length;

    $('result-score').textContent = correct + ' / ' + total + ' 問正解';
    $('result-rank').textContent = rankFor(correct, total);
    $('result-followers').textContent = 'フォロワー ' + state.followers + ' 人';
    $('copy-status').textContent = '';

    var bd = $('result-breakdown');
    clearChildren(bd);
    summarize(state.results, Q.CATEGORIES).forEach(function (c) {
      var li = document.createElement('li');
      var name = document.createElement('span');
      name.textContent = c.label;
      var score = document.createElement('span');
      score.textContent = c.correct + ' / ' + c.total;
      if (c.correct < c.total) score.className = 'weak';
      li.appendChild(name);
      li.appendChild(score);
      bd.appendChild(li);
    });

    var missed = state.results.filter(function (r) { return !r.correct; });
    var ml = $('missed-list');
    clearChildren(ml);
    $('missed-title').textContent = missed.length ? 'まちがえた問題' : '全問正解！';
    missed.forEach(function (r) {
      var li = document.createElement('li');
      var t = document.createElement('p');
      t.className = 'missed-text';
      t.textContent = r.q.text;
      var a = document.createElement('p');
      a.className = 'missed-answer';
      a.textContent = '正解：' + (r.q.answer === 'post' ? '投稿してOK' : '削除したほうがよい') +
        '。' + r.q.explain;
      li.appendChild(t);
      li.appendChild(a);
      ml.appendChild(li);
    });

    showScreen('result');
  }

  function copyResult() {
    var text = shareText();
    var status = $('copy-status');
    var done = function () { status.textContent = '結果をコピーしました'; };
    var fail = function () { status.textContent = 'コピーできませんでした。次の文章を手動でコピーしてください：' + text; };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fail);
      } else {
        fail();
      }
    } catch (e) {
      fail();
    }
  }

  $('btn-start').addEventListener('click', startGame);
  $('btn-post').addEventListener('click', function () { answer('post'); });
  $('btn-delete').addEventListener('click', function () { answer('delete'); });
  $('btn-next').addEventListener('click', nextStep);
  $('btn-retry').addEventListener('click', startGame);
  $('btn-copy').addEventListener('click', copyResult);
})(typeof window !== 'undefined' ? window : globalThis);
