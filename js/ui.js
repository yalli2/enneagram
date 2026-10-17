/* 공용 UI 조각 */
(function () {
  const { E, V, esc, tb, S } = App;
  const UI = {
    seg(items, cur, act, label) {
      return `<div class="seg" role="group" aria-label="${esc(label || '선택')}">` + items.map(i => `<button type="button" data-act="${act}" data-v="${esc(i.v)}" aria-pressed="${String(i.v) === String(cur)}">${i.html || esc(i.l)}</button>`).join('') + `</div>`;
    },
    typeSeg(cur, act, label) { return UI.seg([1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => ({ v: n, html: tb(n) + n })), cur, act, label || '유형 선택'); },
    chips(items, selected, act) {
      return `<div class="chips">` + items.map((l, i) => `<button type="button" class="chip" data-act="${act}" data-v="${i}" aria-pressed="${(selected || []).includes(i)}">${esc(l)}</button>`).join('') + `</div>`;
    },
    opts(items, cur, act, o) {
      o = o || {}; const rev = o.reveal && cur != null && cur >= 0;
      return `<div class="opts">` + items.map((t, i) => {
        let cls = 'opt'; if (rev) { if (i === o.correct) cls += ' right'; else if (i === cur) cls += ' wrong'; }
        return `<button type="button" class="${cls}" data-act="${act}" data-v="${i}" ${(o.data || '')} aria-pressed="${cur === i}"><span class="mk">${rev && i === o.correct ? '✓' : (cur === i ? '●' : '')}</span><span>${esc(t)}</span></button>`;
      }).join('') + `</div>`;
    },
    /* 방 전체 결과 블록. 진행자가 숨기면 안내문 */
    group(ch, title, bodyFn, o) {
      o = o || {};
      const n = App.ppl().length;
      const head = `<div class="group-h"><h4>${esc(title)}</h4><span class="pill live"><i class="live-dot" style="display:inline-block;margin-right:6px;vertical-align:1px"></i>${o.count != null ? o.count : n}명 참여</span></div>`;
      if (!App.canSee(ch)) return `<div class="group">${head}<div class="hidden-note">진행자가 결과 공개 전까지 방 전체 결과를 가려 두었어요.<br>내 선택은 이미 저장되었고, 공개되면 이 자리에 도표가 나타납니다.</div></div>`;
      return `<div class="group">${head}${bodyFn()}</div>`;
    },
    needType(msg) {
      return `<div class="callout"><b>먼저 내 유형을 골라 주세요.</b> ${esc(msg || '1장 「아홉 유형 읽기」에서 가장 와닿는 유형을 선택하면 이 활동이 내 유형에 맞춰 열립니다.')} <button class="btn sm" data-act="go" data-v="1" style="margin-left:6px">1장으로</button></div>`;
    },
    tname(n) { return `${tb(n)}<b>${n}번 ${esc(E.T[n].name)}</b>`; },
    /* 투표 분포 막대 */
    dist(labels, counts, mine, colors) {
      const tot = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
      return V.hbars(labels.map((l, i) => ({ label: l, value: counts[i] || 0, text: (counts[i] || 0) + ' · ' + Math.round((counts[i] || 0) / tot * 100) + '%', color: colors ? colors[i] : 'var(--accent)', mine: mine === i })), { max: Math.max(1, ...Object.values(counts)) });
    },
    people(list) { return `<div class="people">` + list.map(p => `<span class="person${App.isMe(p) ? ' me' : ''}${p.demo ? ' demo' : ''}">${p.type ? tb(p.type) : ''}${esc(App.name(p))}</span>`).join('') + `</div>`; },
    wall(items) { // items: {text, by, color}
      if (!items.length) return `<p class="sub">아직 올라온 글이 없어요. 첫 번째가 되어 보세요.</p>`;
      return `<div class="wall">` + items.map(i => `<div class="note" style="--c:${i.color || 'var(--ink-3)'}"><span>${esc(i.text)}</span><span class="by">${i.type ? tb(i.type, 'sm') : ''}${esc(i.by)}</span></div>`).join('') + `</div>`;
    }
  };
  App.UI = UI;
})();
