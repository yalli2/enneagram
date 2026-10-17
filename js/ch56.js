/* 5장 성장과 변화 · 6장 우리의 지도 */
(function () {
  const { E, V, esc, tb, UI } = App, T = E.T;
  const people = () => App.ppl();
  const myT = () => App.me.type || 0;
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };

  /* ===== 5.1 내면의 목소리 ===== */
  App.modules.push({ id: 'c5-voice', ch: 5, step: '5-1', title: '내 안의 목소리 알아차리기', sub: '습관적인 속말은 "원래 그런 것"처럼 들립니다. 판단 없이 호기심으로 들어 보세요. 가장 익숙한 목소리를 고르세요.',
    view() {
      const a = App.A(5), m = myT(), cur = a.voice ? a.voice - 1 : -1;
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => T[n].inner);
      const rev = cur >= 0 && m;
      const fb = cur >= 0 ? `<div class="feedback">${rev ? (a.voice === m ? `<b class="ok">내 유형(${m}번)의 목소리와 같아요.</b> ` : `<b>고른 목소리는 ${a.voice}번의 것이고, 내 유형은 ${m}번이에요.</b> 다른 유형의 목소리도 스트레스·안정 점에서 들릴 수 있어요. `) : `<b>이 목소리는 ${a.voice}번의 것입니다.</b> `}습관적 속말은 오랫동안 따라다닌 것이라 바꾸는 데 몇 달이 걸립니다. 먼저 알아차리는 것이 첫걸음입니다.</div>` : '';
      const opts = `<div class="opts">` + items.map((t, i) => `<button type="button" class="opt${rev && i === m - 1 ? ' right' : ''}" data-act="voice" data-v="${i + 1}" aria-pressed="${cur === i}"><span class="mk">${cur === i ? '●' : ''}</span><span>${cur >= 0 ? tb(i + 1, 'sm') : ''}${esc(t)}</span></button>`).join('') + `</div>`;
      const freq = cur >= 0 ? `<div><b>이번 주 이 목소리가 얼마나 자주 들렸나요?</b><div style="margin-top:8px">${UI.seg([1, 2, 3, 4, 5].map(v => ({ v, l: v + '' })), a.freq || '', 'vfreq', '빈도')}</div><small class="muted">1 거의 없음 · 5 거의 계속</small></div>` : '';
      const grp = UI.group(5, '내 유형 × 가장 익숙한 목소리', () => {
        const cells = {}; people().forEach(p => { const x = App.getA(p, 5); if (p.type && x.voice) { const k = p.type + '|' + x.voice; cells[k] = (cells[k] || 0) + 1; } });
        const ax = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({ k: i, badge: i, color: E.COLORS[i], ink: E.INK_ON[i], title: i + '번' }));
        return V.matrix({ rows: ax, cols: ax, cells, corner: '내 유형 ↓ · 목소리 →', diag: (r, c) => r === c });
      }, { count: people().filter(p => p.type && App.getA(p, 5).voice).length });
      return opts + fb + freq + grp;
    } });
  App.act.voice = el => { const v = +el.dataset.v; App.put(5, { voice: App.A(5).voice === v ? 0 : v }); };
  App.act.vfreq = el => { App.put(5, { freq: +el.dataset.v }); };

  /* ===== 5.2 숨은 센터 깨우기 + 3센터 명상 ===== */
  const MED = [{ t: '몸(장 센터)', d: '숨을 들이쉬고 내쉬며 발바닥이 바닥에 닿는 느낌을 확인하세요. 몸의 단단함을 느끼고, 불편한 곳에 숨을 보내 보세요. 몸이 끝나고 세상이 시작되는 경계를 느껴 봅니다.' },
    { t: '가슴(가슴 센터)', d: '어깨를 뒤로 젖히고 숨과 함께 가슴을 엽니다. 거기 있는 감정을 느끼고 지나가게 두세요. 나 자신과 이어지는 느낌에 숨을 보냅니다.' },
    { t: '머리(머리 센터)', d: '다시 깊이 숨 쉬며 마음에서 일어나는 것을 봅니다. 생각이 오가고, 그것을 붙들고 바라보는 부분이 있음을 알아차리세요. 마음이 고요할 때의 넓은 공간을 느껴 봅니다.' },
    { t: '함께', d: '단단한 몸, 열린 가슴, 넓은 마음이 함께 일하는 것을 느끼며 한 번 더 깊이 숨 쉽니다. 천천히 이 방으로 돌아옵니다.' }];
  App.ui.med = { run: false, i: 0, timer: null };
  App.modules.push({ id: 'c5-centers', ch: 5, step: '5-2', title: '덜 쓰는 센터 깨우기', sub: '가장 덜 쓰는 센터는 성격의 의제에서 비교적 자유로워서, 균형과 휴식의 열쇠가 됩니다. 매일 하는 작은 연습을 정해 보세요.',
    view() {
      const m = myT(); if (!m) return UI.needType();
      const [k, u] = E.underuseOf(m), a = App.A(5);
      const list = u.practices.concat(E.DAILY);
      const info = `<div class="split w"><div class="profile"><div class="p-top">${tb(m, 'lg')}<div><h3>${m}번은 ${esc(u.label)}를 덜 씁니다</h3><small class="muted">${esc(u.hint)}</small></div></div><b style="font-size:14px">추천 연습</b><ul style="margin:0;padding-left:20px;font-size:14px;color:var(--ink-2)">${u.practices.map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>
        <div>${V.ennea({ colorBy: (() => { const c = {}; E.GROUPS.center.items.forEach(g => g.types.forEach(t => { c[t] = g.color; })); return c; })(), selected: [m], dim: [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(t => !u.types.includes(t)), label: '덜 쓰는 센터' })}<p class="sub" style="text-align:center;margin:2px 0 0">진한 점 = 같은 센터를 덜 쓰는 유형(${u.types.join('·')}번) · 점선 링 = 나</p></div></div>`;
      const pick = `<div><b>매일 할 한 가지</b><div style="margin-top:8px"><div class="chips">${list.map((p, i) => `<button type="button" class="chip" data-act="prac" data-l="${esc(p)}" aria-pressed="${a.prac === p}">${esc(p)}</button>`).join('')}</div></div></div>
        <div><b>하루 몇 분?</b><div style="margin-top:8px">${UI.seg([5, 10, 15, 20, 30].map(v => ({ v, l: v + '분' })), a.min || '', 'pmin', '분')}</div><small class="muted">처음엔 짧아도 괜찮아요. 즐겁게 오래 가는 것이 더 중요합니다.</small></div>`;
      const md = App.ui.med; const step = MED[md.i];
      const medv = `<div class="group"><div class="group-h"><h4>세 센터 가이드 명상 (약 1분 30초)</h4><span class="pill live">오늘 함께한 사람 ${people().filter(p => App.getA(p, 5).med === today()).length}명</span></div>
        <div class="breath"><div class="bcircle${md.run ? ' run' : ''}"><span>${md.run ? esc(step.t) : '시작하기'}</span></div>
        ${md.run ? `<div class="bsteps">${MED.map((s, i) => `<span class="pill${i === md.i ? ' on' : ''}">${i + 1}. ${esc(s.t.split('(')[0])}</span>`).join('')}</div><p style="max-width:34em;text-align:center;margin:0">${esc(step.d)}</p><button class="btn sm" data-act="med-stop">그만하기</button>` : `<p class="sub" style="max-width:34em;text-align:center;margin:0">몸 → 가슴 → 머리 → 함께, 네 단계로 각 20초씩 안내합니다. 편안한 자세로 앉아 시작하세요.</p><button class="btn pri" data-act="med-start">${a.med === today() ? '한 번 더 하기' : '명상 시작'}</button>`}</div></div>`;
      const grp = UI.group(5, '우리가 고른 매일 연습', () => {
        const c = {}, mins = []; people().forEach(p => { const x = App.getA(p, 5); if (x.prac) { c[x.prac] = (c[x.prac] || 0) + 1; if (x.min) mins.push(x.min); } });
        const arr = Object.keys(c).map(l => ({ label: l, value: c[l], color: 'var(--accent)', mine: a.prac === l })).sort((x, y) => y.value - x.value);
        const avg = mins.length ? Math.round(mins.reduce((x, y) => x + y, 0) / mins.length) : 0;
        return (arr.length ? V.hbars(arr, { max: arr[0].value }) + `<p class="sub" style="margin:4px 0 0">평균 <b class="num">${avg}</b>분/일</p>` : '<p class="sub">아직 선택이 없어요.</p>');
      }, { count: people().filter(p => App.getA(p, 5).prac).length });
      return info + pick + medv + grp;
    } });
  App.act.prac = el => { App.put(5, { prac: App.A(5).prac === el.dataset.l ? '' : el.dataset.l }); };
  App.act.pmin = el => { App.put(5, { min: +el.dataset.v }); };
  App.act['med-start'] = () => { const md = App.ui.med; md.run = true; md.i = 0; clearInterval(md.timer); md.timer = setInterval(() => { md.i++; if (md.i >= MED.length) { clearInterval(md.timer); md.run = false; md.i = 0; App.put(5, { med: today() }); App.toast('수고했어요. 오늘의 명상을 마쳤어요.'); } else App.schedule(); }, 20000); App.schedule(); };
  App.act['med-stop'] = () => { const md = App.ui.med; clearInterval(md.timer); md.run = false; md.i = 0; App.schedule(); };

  /* ===== 5.3 7일 챌린지 ===== */
  const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
  App.modules.push({ id: 'c5-challenge', ch: 5, step: '5-3', title: '7일 "틀 깨기" 챌린지', sub: '내 유형의 습관적인 시선을 흔드는 질문과 연습입니다. 일주일 동안 하루에 한 번 체크하세요.',
    view() {
      const m = myT(); if (!m) return UI.needType();
      const a = App.A(5), days = a.days || [0, 0, 0, 0, 0, 0, 0];
      const card = `<div class="split w"><div class="profile"><div class="p-top">${tb(m, 'lg')}<div><h3>${m}번의 틀 깨기</h3></div></div><b style="font-size:14px">질문</b><ul style="margin:0;padding-left:20px">${T[m].breakQ.map(q => `<li>${esc(q)}</li>`).join('')}</ul><b style="font-size:14px">연습</b><p style="margin:0">${esc(T[m].breakP)}</p></div>
        <label class="f" style="align-self:start">내가 정한 방식 <small class="muted">(나만 보는 메모)</small><textarea id="c5plan" data-in="c5plan" data-ch="c5plan-ch" maxlength="200" placeholder="어떤 상황에서, 무엇을, 언제 해 볼까요?">${esc(a.plan || '')}</textarea></label></div>`;
      const btns = `<div><b>오늘까지의 기록</b><div class="daybtns" style="margin-top:8px">${DAYS.map((d, i) => `<button type="button" class="dayb" data-act="day" data-i="${i}" aria-pressed="${!!days[i]}" style="${days[i] ? 'background:' + E.COLORS[m] + ';color:' + E.INK_ON[m] : ''}">${d}<b>${days[i] ? '✓' : (i + 1)}</b></button>`).join('')}</div></div>`;
      const grp = UI.group(5, '우리 방의 7일 기록', () => {
        const rows = people().filter(p => p.type && App.getA(p, 5).days).map(p => ({ name: App.name(p), type: p.type, color: E.COLORS[p.type], ink: E.INK_ON[p.type], days: App.getA(p, 5).days, mine: App.isMe(p) })).sort((x, y) => y.days.filter(Boolean).length - x.days.filter(Boolean).length);
        return rows.length ? V.strips(rows) : '<p class="sub">첫 번째 체크를 해 보세요. 기록이 생기면 이곳에 나타납니다.</p>';
      }, { count: people().filter(p => App.getA(p, 5).days).length });
      return card + btns + grp;
    } });
  App.act.day = el => { const d = (App.A(5).days || [0, 0, 0, 0, 0, 0, 0]).slice(); const i = +el.dataset.i; d[i] = d[i] ? 0 : 1; App.put(5, { days: d }); };
  App.inp.c5plan = el => { App.A(5).plan = el.value; App.save(); };
  App.inp['c5plan-ch'] = () => App.schedule();

  /* ===== 5.4 정렬 점검 & 어려운 시기 ===== */
  App.modules.push({ id: 'c5-align', ch: 5, step: '5-4', title: '내 삶의 정렬 점검과 지지대', sub: '내 삶에서 나와 맞는 것과 어긋난 것을 나누어 적고, 힘든 시기를 위한 지지대를 미리 정해 둡니다. "쉬울 때 연습해야 어려울 때 곁에 있습니다."',
    view() {
      const a = App.A(5);
      const form = `<div class="split"><label class="f">나와 잘 맞는 것 <textarea id="c5on" data-in="c5on" data-ch="c5on-ch" maxlength="120" placeholder="예) 아이들과의 저녁 시간">${esc(a.on || '')}</textarea></label>
        <label class="f">어긋나 있는 것 <textarea id="c5off" data-in="c5off" data-ch="c5off-ch" maxlength="120" placeholder="예) 끊임없는 메신저 알림">${esc(a.off || '')}</textarea></label></div><small class="muted">작성한 내용은 방 전체 월에 공유돼요. 공개하기 어려운 내용은 쓰지 않아도 됩니다.</small>`;
      const sup = `<div><b>힘든 시기를 위한 지지대</b> <small class="muted">(여러 개 선택)</small></div><div class="opts">` + E.SUPPORTS.map(s => `<button type="button" class="opt" data-act="sup" data-k="${s.k}" aria-pressed="${(a.sup || []).includes(s.k)}"><span class="mk">${(a.sup || []).includes(s.k) ? '✓' : ''}</span><span><b>${esc(s.n)}</b> — ${esc(s.d)}</span></button>`).join('') + `</div>`;
      const grp = UI.group(5, '우리의 지도: 정렬과 지지대', () => {
        const on = people().filter(p => App.getA(p, 5).on).map(p => ({ text: App.getA(p, 5).on, by: App.name(p), type: p.type, color: 'var(--secure)' }));
        const off = people().filter(p => App.getA(p, 5).off).map(p => ({ text: App.getA(p, 5).off, by: App.name(p), type: p.type, color: 'var(--stress)' }));
        const c = {}; people().forEach(p => (App.getA(p, 5).sup || []).forEach(k => { c[k] = (c[k] || 0) + 1; }));
        return `<div class="split"><div><h4 style="margin-bottom:8px">잘 맞는 것</h4>${UI.wall(on)}</div><div><h4 style="margin-bottom:8px">어긋난 것</h4>${UI.wall(off)}</div></div><h4>우리가 고른 지지대</h4>` + V.hbars(E.SUPPORTS.map(s => ({ label: s.n, value: c[s.k] || 0, color: 'var(--accent)', mine: (a.sup || []).includes(s.k) })), { max: Math.max(1, ...Object.values(c)) });
      });
      return form + sup + grp;
    } });
  App.inp.c5on = el => { App.A(5).on = el.value; App.save(); };
  App.inp['c5on-ch'] = () => App.schedule();
  App.inp.c5off = el => { App.A(5).off = el.value; App.save(); };
  App.inp['c5off-ch'] = () => App.schedule();
  App.act.sup = el => { const s = (App.A(5).sup || []).slice(); const i = s.indexOf(el.dataset.k); if (i >= 0) s.splice(i, 1); else s.push(el.dataset.k); App.put(5, { sup: s }); };

  /* ===== 6 우리의 지도 ===== */
  function report() {
    const m = App.me, n = m.type; if (!n) return '';
    const a3 = App.A(3), a4 = App.A(4), a5 = App.A(5);
    const L = ['나의 에니어그램 리포트 (' + App.name(m) + ')'];
    L.push('· 유형: ' + (m.wing ? n + 'w' + m.wing : n + '번') + ' ' + T[n].name + ' (' + T[n].seek + '을(를) 찾는 유형)');
    L.push('· 센터 ' + E.groupOf('center', n).name + ' / 사회적 스타일 ' + E.groupOf('social', n).name + ' / 갈등 해결 ' + E.groupOf('conflict', n).name + ' / 대상관계 ' + E.groupOf('object', n).name);
    L.push('· 스트레스 점 ' + E.STRESS[n] + '번, 안정 점 ' + E.SECURITY[n] + '번');
    if ((a3.s || []).length) L.push('· 일터의 강점: ' + a3.s.map(i => E.WORK_CHIPS.strengths[i]).join(', '));
    if ((a3.c || []).length) L.push('· 일터의 어려움: ' + a3.c.map(i => E.WORK_CHIPS.challenges[i]).join(', '));
    L.push('· 일터의 팁: ' + T[n].work.tip);
    if (a3.note) L.push('· 일터 약속: ' + a3.note);
    if (a4.pledge) L.push('· 이번 주 관계 행동: ' + a4.pledge);
    if (a5.prac) L.push('· 매일 연습: ' + a5.prac + (a5.min ? ' ' + a5.min + '분' : ''));
    L.push('· 틀 깨기 질문: ' + T[n].breakQ[0]);
    if (a5.days) L.push('· 7일 챌린지: ' + a5.days.filter(Boolean).length + '/7일');
    return L.join('\n');
  }
  App.modules.push({ id: 'c6-summary', ch: 6, step: '마무리', title: '오늘 함께 만든 지도', sub: '방 전체의 참여와 유형 분포, 그리고 나의 리포트입니다.',
    view() {
      const ppl = people(), typed = ppl.filter(p => p.type);
      const part = UI.group(6, '참여 현황', () => {
        const avg = c => ppl.length ? Math.round(ppl.reduce((s, p) => s + App.pct(p, c), 0) / ppl.length * 100) : 0;
        return V.hbars(E.CHAPTERS.filter(c => c.id < 6).map(c => ({ label: c.id + '장 ' + c.title, value: avg(c.id), text: avg(c.id) + '%', color: 'var(--accent)' })), { max: 100 });
      });
      const map = UI.group(6, '방 전체 유형 분포', () => `<div class="split w"><div>${V.ennea({ counts: App.typeCounts(typed), selected: App.me.type ? [App.me.type] : [], label: '방 전체 유형 분포' })}</div><div style="display:grid;gap:10px;align-content:start">${E.GROUPS.center.items.map(g => { const v = typed.filter(p => g.types.includes(p.type)).length; return `<div class="tgroup" style="grid-template-columns:70px 1fr"><span class="tb" style="background:${g.color};color:#fff;min-width:60px">${v}명</span><div><b>${esc(g.name)}</b><br><small class="muted">${esc(g.sub)} · ${g.types.join('·')}번</small></div></div>`; }).join('')}<div class="callout"><b>기억하세요.</b> 유형은 나를 상자에 넣는 말이 아니라, 변화를 위한 지도입니다. "나는 7번이라 끝까지 못 해"가 아니라 "7번의 습관이 올라오는 걸 알아차렸다"로 쓰세요.</div></div></div>`, { count: typed.length });
      const rep = report();
      const mine = rep ? `<div class="group"><div class="group-h"><h4>나의 리포트</h4><button class="btn sm" data-act="copy-report">복사</button></div><pre id="rep" style="white-space:pre-wrap;margin:0;font:13.5px/1.7 var(--font);background:var(--surface-2);padding:14px;border-radius:10px;user-select:all">${esc(rep)}</pre></div>` : UI.needType('유형을 고르면 나의 리포트가 만들어집니다.');
      return part + map + mine;
    } });
  App.act['copy-report'] = () => { const t = report(); (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => App.toast('리포트를 복사했어요.'), () => { const r = document.getElementById('rep'); if (r) { const rg = document.createRange(); rg.selectNodeContents(r); const s = getSelection(); s.removeAllRanges(); s.addRange(rg); } App.toast('복사가 막혀 있어요. 선택된 글을 직접 복사하세요.'); }); };
})();
