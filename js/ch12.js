/* 1장 자기 발견 · 2장 실전 */
(function () {
  const { E, V, esc, tb, UI } = App, T = E.T;
  const legend = `<div class="legend-line"><span><i style="border-color:var(--stress)"></i>스트레스 점</span><span><i style="border-color:var(--secure)"></i>안정(통합) 점</span></div>`;
  const tagRow = n => ['center', 'social', 'conflict', 'object'].map(k => { const g = E.groupOf(k, n); return `<span class="pill" title="${esc(E.GROUPS[k].label)}">${esc(g.name)}</span>`; }).join(' ');
  const typeCard = n => `<div class="profile"><div class="p-top">${tb(n, 'lg')}<div><h3>${n}번 · ${esc(T[n].name)}</h3><small class="muted">${esc(T[n].seek)}을(를) 찾는 유형 · ${esc(T[n].en)}</small></div></div>
      <p>${esc(T[n].core)}</p><div class="chips">${tagRow(n)}</div>
      <dl class="kv"><dt>날개</dt><dd>${E.wingsOf(n).map(w => `${tb(w, 'sm')}${n}w${w}`).join(' &nbsp; ')}</dd>
      <dt>스트레스 점</dt><dd>${tb(T[n].stress.t, 'sm')}${esc(T[n].stress.d)}</dd><dt>안정(통합) 점</dt><dd>${tb(T[n].security.t, 'sm')}${esc(T[n].security.d)}</dd></dl></div>`;

  /* ===== 1.1 도형 읽기 ===== */
  App.ui.shape = { sel: 0, layers: { circle: 1, triangle: 1, hexad: 1, numbers: 1 } };
  App.modules.push({ id: 'c1-shape', ch: 1, step: '1-1', title: '에니어그램 도형 읽기', sub: '원 · 삼각형 · 육각형 · 숫자. 번호를 눌러 유형과 화살표를 확인해 보세요.',
    view() {
      const u = App.ui.shape, L = u.layers, n = u.sel;
      const lay = [['circle', '원'], ['triangle', '삼각형(3·6·9)'], ['hexad', '육각형(1·4·2·8·5·7)'], ['numbers', '숫자']].map(([k, l]) => `<label><input type="checkbox" data-ch="shape-layer" data-k="${k}" ${L[k] ? 'checked' : ''}> ${l}</label>`).join('');
      const info = n ? typeCard(n) : `<dl class="kv"><dt>원</dt><dd>아홉 유형은 모두 동등하고 서로 이어져 있다는 하나됨을 나타냅니다.</dd>
        <dt>삼각형</dt><dd>3·6·9번을 잇습니다. 대립하는 두 힘 사이에서 둘을 종합하는 세 번째 힘, 곧 역동적인 상호작용을 뜻합니다.</dd>
        <dt>육각형</dt><dd>1·4·2·8·5·7번을 잇습니다. 우리가 한 가지 유형이면서도 끊임없이 흐르고 변한다는 역동성을 나타냅니다.</dd>
        <dt>숫자</dt><dd>아홉 가지 유형. 모든 사람에게 아홉 모두의 면이 있지만, 지각과 행동을 이끄는 주된 유형이 하나 있습니다.</dd></dl>
        <div class="callout"><b>화살표 읽기</b> 번호를 누르면 그 유형의 <b>스트레스 점</b>(압박 때 이동)과 <b>안정·통합 점</b>(안전하거나 건강할 때 이동)이 나타납니다. 이동은 하루에도 여러 번 자연스럽게 일어납니다.</div>`;
      return `<div class="split w"><div><div class="layers sw-row" style="margin-bottom:6px">${lay}</div>
        ${V.ennea({ layers: L, selected: n ? [n] : [], pick: true, act: 'shape-pick', arrows: n ? [[n, E.STRESS[n], 'stress'], [n, E.SECURITY[n], 'secure']] : [], label: '에니어그램 도형' })}${n ? legend : ''}</div><div>${info}</div></div>`;
    } });
  App.act['shape-pick'] = el => { const u = App.ui.shape, n = +el.dataset.n; u.sel = u.sel === n ? 0 : n; App.schedule(); };
  App.inp['shape-layer'] = el => { App.ui.shape.layers[el.dataset.k] = el.checked ? 1 : 0; App.schedule(); };

  /* ===== 1.2 아홉 유형 읽기 ===== */
  const rateBtns = n => [1, 2, 3, 4, 5].map(v => `<button type="button" data-act="rate" data-n="${n}" data-v="${v}" aria-pressed="${App.me.rate[n - 1] === v}" style="${App.me.rate[n - 1] === v ? 'background:' + E.COLORS[n] + ';color:' + E.INK_ON[n] : ''}" aria-label="${n}번 ${v}점">${v}</button>`).join('');
  App.modules.push({ id: 'c1-explore', ch: 1, step: '1-2', title: '아홉 유형 읽고 공명도 매기기', sub: '교재의 권유: 열린 마음으로 아홉 유형을 모두 읽고, 가장 와닿는 유형에 주목하세요. 가장 높은 3개를 살펴보는 것이 좋습니다.',
    view() {
      const m = App.me; const ppl = App.ppl();
      const cards = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => { const t = T[n]; return `<article class="tcard" style="--c:${E.COLORS[n]}"><h4>${tb(n)}${esc(t.name)}</h4><small class="muted" style="margin-top:-4px">${esc(t.seek)}을(를) 찾는 사람</small><p>${esc(t.core)}</p>
        <details data-dk="t${n}"><summary>더 읽기: 건강할 때 · 평균 · 불건강</summary><dl><dt>건강할 때</dt><dd>${esc(t.healthy)}</dd><dt>평균 수준(일상의 자동 조종)</dt><dd>${esc(t.average)}</dd><dt>불건강할 때</dt><dd>${esc(t.unhealthy)}</dd>
        <dt>날개</dt><dd>${t.wings.map(w => `${n}w${w.w}: ${esc(w.d)}`).join('<br>')}</dd><dt>화살표</dt><dd>스트레스 → ${t.stress.t}번: ${esc(t.stress.d)}<br>안정 → ${t.security.t}번: ${esc(t.security.d)}</dd></dl></details>
        <div class="rr"><small>나와 얼마나 비슷한가요? (1 거의 아님 · 5 매우 그렇다)</small></div><div class="rate" role="group" aria-label="${n}번 공명도">${rateBtns(n)}</div></article>`; }).join('');
      const rated = m.rate.filter(x => x > 0).length;
      let res = '';
      if (rated >= 3) {
        const order = m.rate.map((v, i) => [i + 1, v]).sort((a, b) => b[1] - a[1] || a[0] - b[0]).filter(x => x[1] > 0);
        const top = order.slice(0, 3);
        const avg = []; for (let n = 1; n <= 9; n++) { const v = ppl.filter(p => (p.rate || [])[n - 1] > 0).map(p => p.rate[n - 1]); avg.push(v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0); }
        const series = [{ values: m.rate, color: 'var(--accent)', fill: .2, w: 2.6 }]; if (App.canSee(1) && ppl.length > 1) series.push({ values: avg, color: 'var(--ink-3)', fill: 0, dash: 1, w: 1.8 });
        const sug = top[0][0];
        const wings = m.type ? E.wingsOf(m.type) : [];
        res = `<div class="group"><div class="group-h"><h4>내 공명도 지도</h4></div><div class="split"><div>${V.radar(series)}<div class="legend"><span><i style="background:var(--accent)"></i>나</span>${series.length > 1 ? '<span><i style="background:var(--ink-3)"></i>방 전체 평균</span>' : ''}</div></div>
          <div style="display:grid;gap:12px;align-content:start"><div><b>가장 와닿은 유형 TOP ${top.length}</b><div class="chips" style="margin-top:8px">${top.map(([n, v]) => `<span class="chip static">${tb(n)}${esc(T[n].name)} <b class="num">${v}</b></span>`).join('')}</div></div>
          <div class="callout">공명도가 곧 정답은 아닙니다. 건강할 때와 가장 힘들 때의 모습을 함께 떠올려 보고, 가까운 사람의 피드백도 들어 보세요. 테스트 결과와 자기 인식이 다르면 자기 인식이 더 중요합니다.</div>
          <div><b>나의 유형(잠정)</b> ${!m.type ? `<button class="btn sm" style="margin-left:8px" data-act="type-pick" data-v="${sug}">가장 높은 ${sug}번으로 선택</button>` : ''}<div style="margin-top:8px">${UI.typeSeg(m.type, 'type-pick', '내 유형')}</div></div>
          ${m.type ? `<div><b>날개</b> <small class="muted">(이웃한 두 유형 중 더 닮은 쪽, 모르면 건너뛰어도 됩니다)</small><div style="margin-top:8px">${UI.seg(wings.map(w => ({ v: w, html: tb(w) + m.type + 'w' + w })).concat([{ v: 0, l: '잘 모르겠어요' }]), m.wing || 0, 'wing-pick', '날개')}</div></div>
          <div><b>확신 정도</b><div style="margin-top:8px">${UI.seg([1, 2, 3, 4, 5].map(v => ({ v, l: v + '' })), App.A(1).conf || 0, 'conf-pick', '확신')}</div><small class="muted">1 매우 불확실 · 5 매우 확신</small></div>` : ''}</div></div></div>`;
      } else res = `<div class="callout">${3 - rated}개 이상 더 점수를 매기면 내 공명도 지도(레이더)가 나타납니다.</div>`;
      return `<div class="tcards">${cards}</div>${res}`;
    } });
  App.act.rate = el => { const n = +el.dataset.n, v = +el.dataset.v; App.me.rate[n - 1] = App.me.rate[n - 1] === v ? 0 : v; App.touch(); };
  App.act['type-pick'] = el => { const v = +el.dataset.v; const m = App.me; if (m.type === v) { m.type = 0; m.wing = 0; } else { m.type = v; if (m.wing && !E.wingsOf(v).includes(m.wing)) m.wing = 0; } App.touch(); };
  App.act['wing-pick'] = el => { App.setMe({ wing: +el.dataset.v }); };
  App.act['conf-pick'] = el => { App.put(1, { conf: +el.dataset.v }); };

  /* ===== 1.3 우리 방의 지도 ===== */
  App.ui.lens = 'type';
  App.modules.push({ id: 'c1-room', ch: 1, step: '1-3', title: '우리 방의 에니어그램 지도', sub: '숫자는 각 유형을 고른 사람의 수입니다. 보는 방식을 바꿔 센터와 트라이어드로도 살펴보세요.',
    view() {
      const lens = App.ui.lens, ppl = App.ppl(), typed = ppl.filter(p => p.type), me = App.me;
      const lensSeg = UI.seg([{ v: 'type', l: '유형' }, { v: 'center', l: '센터' }, { v: 'social', l: '사회적 스타일' }, { v: 'conflict', l: '갈등 해결' }, { v: 'object', l: '대상관계' }], lens, 'lens', '보기 방식');
      const body = () => {
        const counts = App.typeCounts(typed);
        let colorBy = null, side = '';
        if (lens === 'type') {
          side = V.hbars([1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => ({ label: n + '번 ' + T[n].name, badge: n, color: E.COLORS[n], ink: E.INK_ON[n], value: counts[n], mine: me.type === n })), { max: Math.max(1, ...Object.values(counts)) });
        } else {
          const G = E.GROUPS[lens]; colorBy = {}; const gi = G.items.map(g => ({ g, v: g.types.reduce((a, n) => a + counts[n], 0) }));
          gi.forEach(x => x.g.types.forEach(n => { colorBy[n] = x.g.color; }));
          side = `<p class="sub" style="margin:0">${esc(G.desc)}</p>` + V.stack(gi.map(x => ({ label: x.g.name, value: x.v, color: x.g.color }))) +
            gi.map(x => `<div class="tgroup"><span><span class="tb" style="background:${x.g.color};color:#fff;min-width:44px">${x.v}명</span></span><div><b>${esc(x.g.name)}</b> <small class="muted">${esc(x.g.sub)} · ${x.g.types.join('·')}번</small><br><small>${esc(x.g.note)}</small></div></div>`).join('');
        }
        const wingRows = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => { const ws = {}; typed.filter(p => p.type === n && p.wing).forEach(p => { ws[p.wing] = (ws[p.wing] || 0) + 1; }); return { n, ws }; }).filter(r => Object.keys(r.ws).length);
        return `<div class="split w"><div>${V.ennea({ counts, colorBy, selected: me.type ? [me.type] : [], label: '방 전체 유형 분포' })}<p class="sub" style="text-align:center;margin:4px 0 0">점선 링 = 내 유형${lens !== 'type' ? ' · 색 = ' + E.GROUPS[lens].label : ''}</p></div><div style="display:grid;gap:10px;align-content:start">${side}</div></div>
          ${wingRows.length ? `<div><h4 style="margin-bottom:8px">날개 분포</h4><div class="chips">${wingRows.map(r => Object.keys(r.ws).map(w => `<span class="chip static">${tb(r.n, 'sm')}${r.n}w${w} <b class="num">×${r.ws[w]}</b></span>`).join('')).join('')}</div></div>` : ''}
          <div><h4 style="margin-bottom:8px">유형별 참가자</h4>${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => { const l = typed.filter(p => p.type === n); return l.length ? `<div class="tgroup"><span>${tb(n)}</span>${UI.people(l)}</div>` : ''; }).join('') || '<p class="sub">아직 유형을 고른 사람이 없어요. 1-2에서 유형을 골라 주세요.</p>'}</div>`;
      };
      return `<div>${lensSeg}</div>` + UI.group(1, '실시간 분포', body, { count: typed.length });
    } });
  App.act.lens = el => { App.ui.lens = el.dataset.v; App.schedule(); };

  /* ===== 2.1 줄리아 ===== */
  const JR = [
    { k: 'type', l: '유형', opts: [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => ({ v: n, html: tb(n) + n })), show: v => v + '번' },
    { k: 'wing', l: '날개', opts: [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => ({ v: n, html: tb(n) + n })), show: v => v + '번 날개' },
    { k: 'center', l: '센터', opts: E.GROUPS.center.items.map(g => ({ v: g.k, l: g.name })), show: v => E.GROUPS.center.items.find(g => g.k === v).name },
    { k: 'social', l: '사회적 스타일', opts: E.GROUPS.social.items.map(g => ({ v: g.k, l: g.name })), show: v => E.GROUPS.social.items.find(g => g.k === v).name },
    { k: 'conflict', l: '갈등 해결 스타일', opts: E.GROUPS.conflict.items.map(g => ({ v: g.k, l: g.name })), show: v => E.GROUPS.conflict.items.find(g => g.k === v).name },
    { k: 'object', l: '대상관계 스타일', opts: E.GROUPS.object.items.map(g => ({ v: g.k, l: g.name })), show: v => E.GROUPS.object.items.find(g => g.k === v).name }
  ];
  App.modules.push({ id: 'c2-julia', ch: 2, step: '2-1', title: '줄리아의 지도 그리기', sub: '교재의 사례 인물 줄리아를 읽고, 여섯 겹의 렌즈로 분석해 보세요.',
    view() {
      const a = App.A(2).julia || {}; const J = E.JULIA;
      const story = `<div class="callout"><b>줄리아, 33세.</b> 브랜딩 회사에서 디자이너 팀을 이끄는 매니저. 유머와 에너지로 팀 분위기를 띄우지만, 조용하고 느린 디자이너들에게 답답함을 느끼고 업무 시간에 SNS와 구직 사이트를 오갑니다. 연인 미구엘이 결혼과 집 이야기를 꺼내면 불안해져 "더 나은 사람이 있을지도 몰라"라며 선택지를 열어 둡니다. 도시의 다양한 활동과 수집품, 많은 친구가 그의 일상을 채웁니다.</div>`;
      const rows = JR.map(r => { const v = a[r.k]; const rev = a.chk; const right = J.ans[r.k];
        const fb = rev ? `<div class="feedback"><b class="${v === right ? 'ok' : 'no'}">${v === right ? '정답' : '정답은 ' + r.show(right)}</b> · ${esc(J.why[r.k])}</div>` : '';
        const seg = `<div class="seg" role="group" aria-label="${r.l}">` + r.opts.map(o => `<button type="button" data-act="julia-pick" data-k="${r.k}" data-v="${o.v}" aria-pressed="${String(v) === String(o.v)}" ${rev ? 'disabled' : ''} style="${rev && String(o.v) === String(right) ? 'outline:2px solid var(--secure)' : ''}">${o.html || esc(o.l)}</button>`).join('') + `</div>`;
        return `<div style="display:grid;gap:7px"><b style="font-size:14px">${r.l}</b>${seg}${fb}</div>`; }).join('');
      const all = JR.every(r => a[r.k] != null);
      const done = a.chk ? `<div class="split w"><div>${V.ennea({ selected: [7], arrows: [[7, E.STRESS[7], 'stress'], [7, E.SECURITY[7], 'secure']], label: '줄리아(7번)의 화살표' })}${legend}</div><div class="callout"><b>줄리아는 7w6.</b> 스트레스 점은 <b>1번</b>(지치면 자신과 남을 비판), 안정 점은 <b>5번</b>(안전할 때 한 가지에 집중). 줄리아는 한 가지 일에 머무르기보다 "다음 흥미로운 것"으로 옮겨 가려는 자신의 패턴을 알아차리며 성장합니다.</div></div><button class="btn sm" data-act="julia-reset">다시 풀기</button>` : `<div class="row"><button class="btn pri" data-act="julia-check" ${all ? '' : 'disabled'}>정답 확인</button><small class="muted">${JR.filter(r => a[r.k] != null).length}/6 선택</small></div>`;
      const grp = UI.group(2, '방 전체의 정답률', () => {
        const done = App.ppl().filter(p => (App.getA(p, 2).julia || {}).chk);
        if (!done.length) return '<p class="sub">아직 확인한 사람이 없어요.</p>';
        return V.hbars(JR.map(r => { const ok = done.filter(p => App.getA(p, 2).julia[r.k] === J.ans[r.k]).length; return { label: r.l, value: Math.round(ok / done.length * 100), text: ok + '/' + done.length + ' · ' + Math.round(ok / done.length * 100) + '%', color: 'var(--accent)' }; }), { max: 100 });
      }, { count: App.ppl().filter(p => (App.getA(p, 2).julia || {}).chk).length });
      return story + `<div style="display:grid;gap:16px">${rows}</div>${done}` + grp;
    } });
  App.act['julia-pick'] = el => { const a = Object.assign({}, App.A(2).julia || {}); const k = el.dataset.k; const raw = el.dataset.v; a[k] = /^\d+$/.test(raw) ? +raw : raw; App.put(2, { julia: a }); };
  App.act['julia-check'] = () => { const a = Object.assign({}, App.A(2).julia || {}, { chk: 1 }); App.put(2, { julia: a }); };
  App.act['julia-reset'] = () => { App.put(2, { julia: {} }); };

  /* ===== 2.2 프로필 카드 ===== */
  App.modules.push({ id: 'c2-card', ch: 2, step: '2-2', title: '나의 에니어그램 프로필 카드', sub: '내가 고른 유형이 여러 겹의 구조에서 어디에 놓이는지 한 장으로 봅니다.',
    view() {
      const m = App.me, n = m.type; if (!n) return UI.needType();
      const w = m.wing ? `${n}w${m.wing}` : `${n}번`;
      const a2 = App.A(2), today = a2.today;
      const st = E.STRESS[n], se = E.SECURITY[n];
      const card = `<div class="split w"><div class="profile"><div class="p-top">${tb(n, 'lg')}<div><h3>나는 ${w}</h3><small class="muted">${esc(T[n].name)} · ${esc(T[n].seek)}을(를) 찾는 사람</small></div></div><p>${esc(T[n].core)}</p>
        <dl class="kv"><dt>센터</dt><dd>${esc(E.groupOf('center', n).name)} — ${esc(E.groupOf('center', n).note)}</dd><dt>사회적 스타일</dt><dd>${esc(E.groupOf('social', n).name)} — ${esc(E.groupOf('social', n).note)}</dd>
        <dt>갈등 해결</dt><dd>${esc(E.groupOf('conflict', n).name)} — ${esc(E.groupOf('conflict', n).note)}</dd><dt>대상관계</dt><dd>${esc(E.groupOf('object', n).name)} — ${esc(E.groupOf('object', n).note)}</dd>
        <dt>스트레스 점</dt><dd>${tb(st, 'sm')}${esc(T[n].stress.d)}</dd><dt>안정(통합) 점</dt><dd>${tb(se, 'sm')}${esc(T[n].security.d)}</dd></dl></div>
        <div>${V.ennea({ selected: [n], arrows: [[n, st, 'stress'], [n, se, 'secure']], label: '나의 화살표' })}${legend}</div></div>`;
      const today3 = [{ v: 'core', l: '본래 유형(' + n + '번)', c: E.COLORS[n] }, { v: 'stress', l: '스트레스 점(' + st + '번)', c: 'var(--stress)' }, { v: 'security', l: '안정 점(' + se + '번)', c: 'var(--secure)' }];
      const poll = `<div class="group"><div class="group-h"><h4>오늘의 나는 어디에 있나요?</h4></div><p class="sub" style="margin:0">우리는 하루에도 여러 번 연결된 유형 사이를 오갑니다. 오늘 가장 가까웠던 모습을 골라 보세요.</p>${UI.seg(today3.map(o => ({ v: o.v, l: o.l })), today, 'today', '오늘의 이동')}</div>`;
      const grp = UI.group(2, '오늘 우리 방의 이동', () => { const ppl = App.ppl(); const c = App.count(ppl, p => App.getA(p, 2).today); return V.stack([{ label: '본래 유형에 머묾', value: c.core || 0, color: 'var(--ink-2)' }, { label: '스트레스 점으로 이동', value: c.stress || 0, color: 'var(--stress)' }, { label: '안정 점으로 이동', value: c.security || 0, color: 'var(--secure)' }]); }, { count: App.ppl().filter(p => App.getA(p, 2).today).length });
      return card + poll + grp;
    } });
  App.act.today = el => { App.put(2, { today: el.dataset.v }); };

  /* ===== 2.3 뉘앙스 ===== */
  App.modules.push({ id: 'c2-nuance', ch: 2, step: '2-3', title: '"왜?"를 묻는 연습', sub: '유형을 읽을 때 놓치기 쉬운 세 가지 뉘앙스입니다.',
    view() {
      const a = App.A(2).nu || {};
      return E.NUANCE.map((q, qi) => { const cur = a[q.id]; const done = cur != null;
        const grp = done ? UI.group(2, '방 전체의 선택', () => { const c = App.count(App.ppl(), p => (App.getA(p, 2).nu || {})[q.id]); return UI.dist(q.opts, c, cur); }, { count: App.ppl().filter(p => (App.getA(p, 2).nu || {})[q.id] != null).length }) : '';
        return `<div style="display:grid;gap:10px"><div><span class="pill">${qi + 1}/3 · ${esc(q.title)}</span></div><p style="margin:0"><b>${esc(q.scenario)}</b><br>${esc(q.q)}</p>${UI.opts(q.opts, cur, 'nu-pick', { reveal: done, correct: q.a, data: `data-q="${q.id}"` })}
          ${done ? `<div class="feedback"><b class="${cur === q.a ? 'ok' : 'no'}">${cur === q.a ? '정답' : '다시 보기'}</b> · ${esc(q.exp)}</div>` : ''}${grp}</div>${qi < 2 ? '<hr style="border:0;border-top:1px solid var(--line);margin:4px 0">' : ''}`; }).join('');
    } });
  App.act['nu-pick'] = el => { const a = Object.assign({}, App.A(2).nu || {}); a[el.dataset.q] = +el.dataset.v; App.put(2, { nu: a }); };
})();
