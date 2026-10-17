/* 3장 일터 · 4장 관계 */
(function () {
  const { E, V, esc, tb, UI } = App, T = E.T;
  const people = () => App.ppl();
  const takeN = (arr, i, max) => { const a = (arr || []).slice(); const k = a.indexOf(i); if (k >= 0) a.splice(k, 1); else if (a.length < max) a.push(i); else { a.shift(); a.push(i); } return a; };
  const myT = () => App.me.type || 0;

  /* ===== 3.1 유형별 업무 카드 ===== */
  App.ui.work = { t: 0 };
  App.modules.push({ id: 'c3-work', ch: 3, step: '3-1', title: '일터에서의 나: 강점과 함정', sub: '유형을 바꿔 가며 일터에서의 모습을 읽고, 내가 실제로 쓰는 강점과 겪는 어려움을 고릅니다.',
    view() {
      const sel = App.ui.work.t || myT() || 1, w = T[sel].work, a = App.A(3);
      const card = `<div class="split w"><div class="profile"><div class="p-top">${tb(sel, 'lg')}<div><h3>${esc(w.title)}</h3><small class="muted">${sel}번 · ${esc(T[sel].seek)}을(를) 찾는 유형</small></div></div>
        <dl class="kv"><dt>강점</dt><dd>${esc(w.s)}</dd><dt>어려움</dt><dd>${esc(w.c)}</dd><dt>힘을 내는 팁</dt><dd>${esc(w.tip)}</dd></dl></div>
        <div style="display:grid;gap:12px;align-content:start"><div><b>일터에서 쓰는 강점</b> <small class="muted">(최대 3개)</small></div>${UI.chips(E.WORK_CHIPS.strengths, a.s, 'chip-s')}
        <div><b>일터에서 겪는 어려움</b> <small class="muted">(최대 3개)</small></div>${UI.chips(E.WORK_CHIPS.challenges, a.c, 'chip-c')}</div></div>`;
      const note = `<label class="f">일터에서 나를 위한 약속 한 줄 <small class="muted">(작성하면 방 전체 월에 공유돼요)</small><textarea id="c3note" data-in="c3note" data-ch="c3note-ch" maxlength="140" placeholder="예) 위임을 연습한다 / 회의에서 매주 한 번은 먼저 말한다">${esc(a.note || '')}</textarea></label>`;
      const grp = UI.group(3, '우리 방의 강점과 어려움', () => {
        const cs = App.count(people(), p => null), s = {}, c = {};
        people().forEach(p => { const x = App.getA(p, 3); (x.s || []).forEach(i => { s[i] = (s[i] || 0) + 1; }); (x.c || []).forEach(i => { c[i] = (c[i] || 0) + 1; }); });
        const bars = (map, labels, col) => V.hbars(Object.keys(map).map(i => ({ label: labels[i], value: map[i], color: col, mine: ((map === s ? a.s : a.c) || []).includes(+i) })).sort((x, y) => y.value - x.value).slice(0, 6), { max: Math.max(1, ...Object.values(map)) });
        const walls = people().filter(p => App.getA(p, 3).note).map(p => ({ text: App.getA(p, 3).note, by: App.name(p), type: p.type, color: p.type ? E.COLORS[p.type] : null }));
        return `<div class="split"><div><h4 style="margin-bottom:8px">많이 쓰는 강점</h4>${Object.keys(s).length ? bars(s, E.WORK_CHIPS.strengths, 'var(--secure)') : '<p class="sub">아직 선택이 없어요.</p>'}</div><div><h4 style="margin-bottom:8px">많이 겪는 어려움</h4>${Object.keys(c).length ? bars(c, E.WORK_CHIPS.challenges, 'var(--stress)') : '<p class="sub">아직 선택이 없어요.</p>'}</div></div><h4>약속의 벽</h4>${UI.wall(walls)}`;
      });
      return `<div>${UI.typeSeg(sel, 'work-type', '유형별 업무 카드')}</div>` + card + note + grp;
    } });
  App.act['work-type'] = el => { App.ui.work.t = +el.dataset.v; App.schedule(); };
  App.act['chip-s'] = el => { App.put(3, { s: takeN(App.A(3).s, +el.dataset.v, 3) }); };
  App.act['chip-c'] = el => { App.put(3, { c: takeN(App.A(3).c, +el.dataset.v, 3) }); };
  App.inp.c3note = el => { App.A(3).note = el.value; App.save(); };
  App.inp['c3note-ch'] = () => App.schedule();

  /* ===== 3.2 팀 지도 ===== */
  const SOC = { assertive: { n: '개시자', t: '주장형(3·7·8)', tip: '직접적이고 자신 있게 말하세요. 빠른 결정과 토론을 좋아합니다.' },
    compliant: { n: '협력자', t: '순응형(1·2·6)', tip: '의견을 직접 물어보세요. 기여를 알아주고 인정하면 힘을 냅니다.' },
    withdrawn: { n: '솔로이스트', t: '물러남형(4·5·9)', tip: '회의 전에 안건을 보내 주세요. 생각을 정리할 시간을 주고 즉답을 재촉하지 마세요.' } };
  App.modules.push({ id: 'c3-team', ch: 3, step: '3-2', title: '우리 팀의 지도', sub: '이 방을 하나의 팀이라고 보고, 소통 스타일과 센터의 균형을 살펴봅니다.',
    view() {
      const body = () => {
        const typed = people().filter(p => p.type); if (!typed.length) return '<p class="sub">유형을 고른 사람이 생기면 팀 지도가 그려져요.</p>';
        const groups = E.GROUPS.social.items.map(g => ({ g, list: typed.filter(p => g.types.includes(p.type)) }));
        const centers = E.GROUPS.center.items.map(g => ({ g, v: typed.filter(p => g.types.includes(p.type)).length }));
        const cb = {}; groups.forEach(x => x.g.types.forEach(n => { cb[n] = x.g.color; }));
        const mx = groups.slice().sort((a, b) => b.list.length - a.list.length), mn = groups.slice().sort((a, b) => a.list.length - b.list.length);
        const cmin = centers.slice().sort((a, b) => a.v - b.v)[0];
        const cols = groups.map(x => `<div class="tgroup" style="grid-template-columns:1fr"><div><span class="tb" style="background:${x.g.color};color:#fff;min-width:auto;padding:0 10px">${esc(SOC[x.g.k].n)} · ${x.list.length}명</span> <small class="muted">${esc(SOC[x.g.k].t)}</small></div>${UI.people(x.list)}<small>${esc(SOC[x.g.k].tip)}</small></div>`).join('');
        return `<div class="split w"><div>${V.ennea({ counts: App.typeCounts(typed), colorBy: cb, label: '사회적 스타일별 팀 지도' })}<div class="legend" style="justify-content:center">${groups.map(x => `<span><i style="background:${x.g.color}"></i>${SOC[x.g.k].n}</span>`).join('')}</div></div><div>${cols}</div></div>
          <div class="split"><div><h4 style="margin-bottom:8px">센터 균형</h4>${V.donut(centers.map(c => ({ value: c.v, color: c.g.color })), { unit: '명' })}<div class="legend" style="justify-content:center">${centers.map(c => `<span><i style="background:${c.g.color}"></i>${esc(c.g.name)} <b>${c.v}</b></span>`).join('')}</div></div>
          <div class="callout" style="align-self:start"><b>이 팀을 위한 회의 팁</b><br>· 가장 많은 스타일은 <b>${esc(SOC[mx[0].g.k].n)}</b>(${mx[0].list.length}명)입니다. 이 스타일의 속도와 말투가 회의의 기본 톤이 되기 쉬워요.<br>· 가장 적은 스타일은 <b>${esc(SOC[mn[0].g.k].n)}</b>(${mn[0].list.length}명)입니다. ${esc(SOC[mn[0].g.k].tip)}<br>· 가장 적게 대표되는 센터는 <b>${esc(cmin.g.name)}</b>(${cmin.v}명). 이 관점(${esc(cmin.g.sub)})을 일부러 묻는 시간을 넣어 보세요.</div></div>`;
      };
      return UI.group(3, '우리 방 = 하나의 팀', body, { count: people().filter(p => p.type).length });
    } });

  /* ===== 3.3 브랜딩 갈등 시뮬레이션 ===== */
  App.modules.push({ id: 'c3-sim', ch: 3, step: '3-3', title: '갈등 시뮬레이션: 로고 재디자인', sub: '교재의 사례를 줄리아의 입장에서 함께 풀어 봅니다. 한 번에 한 단계씩 선택하세요.',
    view() {
      const sim = App.A(3).sim || {}, m = myT(); const twin = E.CONFLICT.cast.find(c => c.type === m);
      const cast = `<div class="tcards">` + E.CONFLICT.cast.map(c => `<article class="tcard" style="--c:${E.COLORS[c.type]}"><h4>${tb(c.type)}${esc(c.role)}</h4><p>${esc(c.text)}</p></article>`).join('') + `</div>`;
      const you = m ? `<div class="callout">${twin ? `나는 <b>${m}번</b>이라 <b>${esc(twin.role)}</b>과 같은 유형이에요. 그의 마음에서 출발해 보세요.` : `나는 <b>${m}번</b>. 이 사례에는 같은 유형이 없으니 관찰자의 눈으로 네 사람의 동기를 읽어 보세요.`}</div>` : '';
      const steps = E.CONFLICT.steps.map((s, i) => { const cur = sim[s.id]; const done = cur != null;
        const grp = done ? UI.group(3, '방 전체의 선택', () => UI.dist(s.opts, App.count(people(), p => (App.getA(p, 3).sim || {})[s.id]), cur), { count: people().filter(p => (App.getA(p, 3).sim || {})[s.id] != null).length }) : '';
        return `<div style="display:grid;gap:10px"><span class="pill" style="justify-self:start">단계 ${i + 1}/3</span><p style="margin:0"><b>${esc(s.q)}</b></p>${UI.opts(s.opts, cur, 'sim-pick', { reveal: done, correct: s.a, data: `data-q="${s.id}"` })}${done ? `<div class="feedback"><b class="${cur === s.a ? 'ok' : 'no'}">${cur === s.a ? '교재와 같은 선택' : '교재의 선택은 다릅니다'}</b> · ${esc(s.exp)}</div>${grp}` : ''}</div>`; }).join('<hr style="border:0;border-top:1px solid var(--line);margin:4px 0">');
      return cast + you + steps + `<div class="callout"><b>결과</b> 모두의 필요와 관점이 들렸습니다. 밥은 진실성을 존중받고, 케빈은 창작 과정을 존중받고, 라케샤는 목표(론칭)를 이루고, 줄리아는 갈등이 정리되었어요. 에니어그램은 사람의 "이유"를 알면 해법의 선택지가 늘어난다는 점을 보여 줍니다.</div>`;
    } });
  App.act['sim-pick'] = el => { const s = Object.assign({}, App.A(3).sim || {}); s[el.dataset.q] = +el.dataset.v; App.put(3, { sim: s }); };

  /* ===== 3.4 직업 ===== */
  App.ui.job = { t: 0 };
  App.modules.push({ id: 'c3-jobs', ch: 3, step: '3-4', title: '직업 탐색 보드', sub: '각 유형에서 자주 보이는 분야입니다. 유형과 직업이 일대일로 대응하는 것은 아니며, 관심·재능·경험이 더 중요합니다.',
    view() {
      const sel = App.ui.job.t || myT() || 1, jobs = App.A(3).jobs || [];
      const list = T[sel].careers;
      const chips = `<div class="chips">` + list.map(c => `<button type="button" class="chip" data-act="job" data-l="${esc(c)}" aria-pressed="${jobs.includes(c)}">${jobs.includes(c) ? '★ ' : ''}${esc(c)}</button>`).join('') + `</div>`;
      const mine = `<div class="callout"><b>내 관심 분야 (${jobs.length}/3)</b> ${jobs.length ? jobs.map(j => `<span class="chip static" style="margin-left:6px">${esc(j)}</span>`).join('') : '<small class="muted">유형을 바꿔 가며 끌리는 분야를 최대 3개 고르세요. 다른 유형의 분야도 괜찮아요.</small>'}</div>`;
      const grp = UI.group(3, '우리 방이 끌리는 분야', () => { const c = {}; people().forEach(p => (App.getA(p, 3).jobs || []).forEach(j => { c[j] = (c[j] || 0) + 1; })); const arr = Object.keys(c).map(k => ({ label: k, value: c[k], color: 'var(--accent)', mine: jobs.includes(k) })).sort((a, b) => b.value - a.value).slice(0, 8); return arr.length ? V.hbars(arr, { max: arr[0].value }) : '<p class="sub">아직 선택이 없어요.</p>'; });
      return `<div>${UI.typeSeg(sel, 'job-type', '유형별 분야')}</div><div class="p-top">${tb(sel, 'lg')}<div><h4>${sel}번 ${esc(T[sel].name)}이(가) 자주 가는 분야</h4><small class="muted">${esc(T[sel].work.s)}</small></div></div>${chips}${mine}${grp}`;
    } });
  App.act['job-type'] = el => { App.ui.job.t = +el.dataset.v; App.schedule(); };
  App.act.job = el => { const l = el.dataset.l; const jobs = (App.A(3).jobs || []).slice(); const k = jobs.indexOf(l); if (k >= 0) jobs.splice(k, 1); else { if (jobs.length >= 3) jobs.shift(); jobs.push(l); } App.put(3, { jobs }); };

  /* ===== 4.1 관계에서 원하는 것 ===== */
  App.ui.rel = { t: 0 };
  App.modules.push({ id: 'c4-rel', ch: 4, step: '4-1', title: '관계에서 원하는 것', sub: '유형마다 관계에서 바라는 것과 곁에서 도울 방법이 다릅니다. 소중한 사람의 유형을 짐작해 보세요.',
    view() {
      const sel = App.ui.rel.t || myT() || 1, r = T[sel].rel, a = App.A(4);
      const card = `<div class="profile"><div class="p-top">${tb(sel, 'lg')}<div><h3>${sel}번 · ${esc(T[sel].name)}</h3><small class="muted">관계에서 찾는 것: ${esc(r.seek)}</small></div></div>
        <dl class="kv"><dt>건강할 때</dt><dd>${esc(r.good)}</dd><dt>평균 수준일 때</dt><dd>${esc(r.avg)}</dd><dt>곁에서 돕는 법</dt><dd>${esc(r.support)}</dd><dt>사람을 만날 때</dt><dd>${esc(r.date)}</dd>
        <dt>소통 스타일</dt><dd>${esc(T[sel].comm.style)} · 도전 과제: ${esc(T[sel].comm.challenge)}</dd><dt>이 유형과 소통하려면</dt><dd>${esc(T[sel].comm.how)}</dd></dl></div>`;
      const g = a.guess;
      const form = `<div class="group"><div class="group-h"><h4>내게 중요한 사람 한 명을 떠올려 보세요</h4></div>
        <div><b style="font-size:14px">그 사람은 나의</b><div style="margin-top:6px">${UI.seg(E.PEOPLE.map(p => ({ v: p, l: p })), a.who, 'who', '관계')}</div></div>
        <div><b style="font-size:14px">그 사람의 유형은? (짐작)</b><div style="margin-top:6px">${UI.typeSeg(g, 'guess', '상대 유형')}</div></div>
        ${g ? `<div class="callout"><b>${g}번 ${esc(T[g].name)}</b>와 소통하기: ${esc(T[g].comm.how)}<br>곁에서 돕기: ${esc(T[g].rel.support)}${myT() ? `<br><small class="muted">내 관점(${myT()}번은 ${esc(T[myT()].seek)}을(를) 찾음)과 상대의 관점(${g}번은 ${esc(T[g].seek)}을(를) 찾음)은 같지 않을 수 있어요. 내 기준이 항상 통하는 것은 아닙니다.</small>` : ''}</div>` : ''}</div>`;
      const mx = UI.group(4, '내 유형 × 소중한 사람의 유형', () => {
        const cells = {}; let n = 0; people().forEach(p => { const x = App.getA(p, 4); if (p.type && x.guess) { const k = p.type + '|' + x.guess; cells[k] = (cells[k] || 0) + 1; n++; } });
        const ax = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({ k: i, badge: i, color: E.COLORS[i], ink: E.INK_ON[i], title: i + '번 ' + T[i].name }));
        return V.matrix({ rows: ax, cols: ax, cells, corner: '내 유형 ↓ · 상대 →', diag: (r, c) => r === c }) + `<p class="sub" style="margin:6px 0 0">점선 칸은 "나와 같은 유형이라고 짐작한 경우"입니다. ${n}명의 응답.</p>`;
      }, { count: people().filter(p => p.type && App.getA(p, 4).guess).length });
      const myth = `<div class="callout"><b>궁합 신화</b> "어떤 유형이 나와 가장 잘 맞나요?"에는 정해진 답이 없습니다. 같은 유형이라도 끌리는 사람이 다릅니다. 가장 중요한 것은 가치와 목표를 나누고, 건강한 사람이며, 나를 사랑해 주는 사람인지입니다.</div>`;
      return `<div>${UI.typeSeg(sel, 'rel-type', '유형별 관계')}</div>${card}${form}${mx}${myth}`;
    } });
  App.act['rel-type'] = el => { App.ui.rel.t = +el.dataset.v; App.schedule(); };
  App.act.who = el => { App.put(4, { who: el.dataset.v }); };
  App.act.guess = el => { const v = +el.dataset.v; App.put(4, { guess: App.A(4).guess === v ? 0 : v }); };

  /* ===== 4.2 갈등 3단계 ===== */
  const STY = E.GROUPS.conflict.items;
  const STEPS = [{ n: '① 감정을 꺼내기', s: '정서적 진실', d: '긴장의 뿌리를 찾아 이름을 붙입니다. "지금 우리 사이에서 실제로 무슨 일이 일어나고 있지?"', ph: '이 갈등의 밑바닥에 있는 감정과 필요는…' },
    { n: '② 해결책 찾기', s: '유능함', d: '논리적으로 가능한 해법을 여러 개 떠올립니다.', ph: '가능한 해결책 후보…' },
    { n: '③ 큰 그림 보기', s: '긍정 전망', d: '"5년 뒤에도 이게 중요할까?" 모두에게 좋은 결과를 찾습니다.', ph: '넓게 보면…' }];
  App.modules.push({ id: 'c4-conflict', ch: 4, step: '4-2', title: '관계 갈등을 푸는 3단계', sub: '세 가지 갈등 해결 스타일은 각각 문제의 한 면을 잘 다룹니다. 셋을 함께 쓰면 가장 잘 풀립니다.',
    view() {
      const a = App.A(4), m = myT(); const def = m ? E.groupOf('conflict', m).k : null; const cur = a.style || def;
      const cards = `<div class="tcards">` + STY.map(g => `<article class="tcard" style="--c:${g.color}"><h4>${esc(g.name)}</h4><small class="muted">${g.types.map(n => tb(n, 'sm')).join('')}</small><p>${esc(g.note)}</p></article>`).join('') + `</div>`;
      const my = `<div><b>내가 갈등에서 먼저 하는 것</b> ${def && !a.style ? '<small class="muted">(내 유형 기준 추천 선택됨)</small>' : ''}<div style="margin-top:8px">${UI.seg(STY.map(g => ({ v: g.k, l: g.name })), cur, 'cstyle', '내 스타일')}</div></div>`;
      const steps = `<div class="split" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr))">` + STEPS.map((s, i) => `<label class="f"><b style="color:var(--ink)">${s.n}</b><small>${esc(s.d)}</small><textarea id="cs${i}" data-in="cstep" data-i="${i}" data-ch="cstep-ch" maxlength="200" placeholder="${esc(s.ph)}">${esc(a['s' + (i + 1)] || '')}</textarea></label>`).join('') + `</div><small class="muted">메모는 나만 볼 수 있어요. 아무도 읽지 않습니다.</small>`;
      const hard = `<div><b>세 단계 중 나에게 가장 어려운 것</b><div style="margin-top:8px">${UI.seg(STEPS.map((s, i) => ({ v: i, l: s.n })), a.hard != null ? a.hard : '', 'hard', '어려운 단계')}</div></div>`;
      const grp = UI.group(4, '우리 방의 갈등 스타일', () => {
        const ppl = people(); const sc = App.count(ppl, p => { const x = App.getA(p, 4); return x.style || (p.type ? E.groupOf('conflict', p.type).k : null); });
        const hc = App.count(ppl, p => { const x = App.getA(p, 4); return x.hard != null ? x.hard : null; });
        return `<div class="split"><div><h4 style="margin-bottom:8px">먼저 하는 것</h4>${V.stack(STY.map(g => ({ label: g.name, value: sc[g.k] || 0, color: g.color })))}</div><div><h4 style="margin-bottom:8px">가장 어려운 단계</h4>${UI.dist(STEPS.map(s => s.n), hc, a.hard)}</div></div>`;
      });
      return cards + my + steps + hard + `<div class="callout">서로 다른 스타일의 사람과 부딪칠 땐 "누가 맞나"보다 "우리가 비어 있는 부분은 어느 단계인가"를 물어보세요. 같은 스타일끼리라면 나머지 두 관점을 일부러 불러오세요.</div>` + grp;
    } });
  App.act.cstyle = el => { App.put(4, { style: el.dataset.v }); };
  App.act.hard = el => { App.put(4, { hard: +el.dataset.v }); };
  App.inp.cstep = el => { App.A(4)['s' + (+el.dataset.i + 1)] = el.value; App.save(); };
  App.inp['cstep-ch'] = () => App.schedule();

  /* ===== 4.3 가족 속 역할 ===== */
  App.modules.push({ id: 'c4-family', ch: 4, step: '4-3', title: '가족 속에서 내가 맡는 역할', sub: '가족 앞에서 나는 어떤 역할로 움직이나요? 내가 고른 것과 교재의 유형별 역할을 비교해 봅니다.',
    view() {
      const a = App.A(4), m = myT(), cur = a.role != null ? a.role : -1;
      const sel = UI.chips(E.FAMILY_ROLES, cur >= 0 ? [cur] : [], 'role');
      const fb = (cur >= 0) ? `<div class="feedback">${m ? (cur === m - 1 ? `<b class="ok">교재와 같아요.</b> ` : `<b>교재에서 ${m}번의 역할은 <u>${esc(E.FAMILY_ROLES[m - 1])}</u>입니다.</b> 가족 앞에서는 다른 유형의 모습(화살표 이동)이 나오기도 합니다. `) : ''}${m ? esc(T[m].family) : '내 유형을 정하면 교재의 역할과 비교할 수 있어요.'}</div>` : '';
      const grp = UI.group(4, '가족 속 역할 × 내 유형', () => {
        const cells = {}; people().forEach(p => { const x = App.getA(p, 4); if (p.type && x.role != null) { const k = p.type + '|' + x.role; cells[k] = (cells[k] || 0) + 1; } });
        const rows = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({ k: i, badge: i, color: E.COLORS[i], ink: E.INK_ON[i], title: i + '번 ' + T[i].name }));
        const cols = E.FAMILY_ROLES.map((r, i) => ({ k: i, label: r.length > 6 ? r.slice(0, 5) + '…' : r, title: r }));
        return V.matrix({ rows, cols, cells, corner: '내 유형 ↓ · 가족 역할 →', diag: (r, c) => r - 1 === c }) + `<p class="sub" style="margin:6px 0 0">점선 칸은 교재가 그 유형에 붙인 역할입니다.</p>`;
      }, { count: people().filter(p => p.type && App.getA(p, 4).role != null).length });
      return `<p style="margin:0"><b>가족 앞에서의 나와 가장 가까운 역할을 고르세요.</b></p>${sel}${fb}${grp}`;
    } });
  App.act.role = el => { App.put(4, { role: +el.dataset.v }); };

  /* ===== 4.4 이번 주 한 가지 행동 ===== */
  App.modules.push({ id: 'c4-pledge', ch: 4, step: '4-4', title: '이번 주, 한 가지 행동', sub: '소중한 사람이 세상을 어떻게 보는지 떠올리며, 이번 주에 "당신을 이해해요"를 전할 작은 행동 하나를 정합니다.',
    view() {
      const a = App.A(4);
      const form = `<label class="f">누구에게, 무엇을 할까요? <small class="muted">(작성하면 방 전체 월에 공유돼요)</small><textarea id="c4p" data-in="c4p" data-ch="c4p-ch" maxlength="140" placeholder="예) 어머니(2번)께 이번 주에 먼저 전화해 고마움을 구체적으로 말한다">${esc(a.pledge || '')}</textarea></label>
        <div class="callout"><b>생각해 볼 질문</b> 이 사람은 세상을 나와 어떻게 다르게 보나요? 이 관계에서 가장 원하는 것은 무엇인가요? 내 유형이 이 관계에 주는 선물과, 연결을 어렵게 하는 습관은 무엇인가요?</div>`;
      const grp = UI.group(4, '약속의 벽', () => UI.wall(people().filter(p => App.getA(p, 4).pledge).map(p => ({ text: App.getA(p, 4).pledge, by: App.name(p) + (App.getA(p, 4).who ? ' → ' + App.getA(p, 4).who : ''), type: p.type, color: p.type ? E.COLORS[p.type] : null }))), { count: people().filter(p => App.getA(p, 4).pledge).length });
      return form + grp;
    } });
  App.inp.c4p = el => { App.A(4).pledge = el.value; App.save(); };
  App.inp['c4p-ch'] = () => App.schedule();
})();
