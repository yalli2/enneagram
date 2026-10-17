/* 앱 코어: 입장 · 라우팅 · 실시간 동기화 · 진행자 패널 · 렌더 루프 */
(function () {
  const E = ENN, V = Viz, S = Store, esc = V.esc;
  const $ = (s, el) => (el || document).querySelector(s);
  const tb = (n, cls) => n ? `<span class="tb ${cls || ''}" style="background:${E.COLORS[n]};color:${E.INK_ON[n]}">${n}</span>` : '';
  const hash = s => { let h = 5381; s = 'enn:' + s; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h.toString(16); };
  const emptyMe = () => ({ n: '', anon: 0, type: 0, wing: 0, rate: [0, 0, 0, 0, 0, 0, 0, 0, 0], a: {}, t: 0, u: 0 });

  const App = {
    modules: [], act: {}, inp: {}, ui: {},
    me: emptyMe(), map: {}, state: {}, room: '', view: 'join', fac: false, ro: false, joined: false,
    E, V, S, esc, tb, $,
    /* ----- 데이터 접근 ----- */
    ppl() {
      const out = []; const seen = {};
      Object.keys(App.map).forEach(id => { if (id === S.pid && App.joined) return; const p = App.map[id]; if (p && typeof p === 'object') { out.push(Object.assign({}, p, { id, a: p.a || {}, rate: p.rate || [] })); seen[id] = 1; } });
      if (App.joined) out.push(Object.assign({}, App.me, { id: S.pid }));
      return out;
    },
    isMe: p => p.id === S.pid,
    name: p => (p.anon && p.id !== S.pid) ? '익명' : (p.n || '참가자'),
    A(ch) { return (App.me.a['c' + ch] = App.me.a['c' + ch] || {}); },
    getA(p, ch) { return (p.a && p.a['c' + ch]) || {}; },
    put(ch, patch) { Object.assign(App.A(ch), patch); App.touch(); },
    setMe(patch) { Object.assign(App.me, patch); App.touch(); },
    touch() { App.save(); App.schedule(); },
    canSee(ch) { return App.fac || !(App.state.hide && App.state.hide[ch]); },
    count(list, fn) { const c = {}; list.forEach(p => { const k = fn(p); if (k != null && k !== '') c[k] = (c[k] || 0) + 1; }); return c; },
    typeCounts(list) { const c = {}; for (let n = 1; n <= 9; n++) c[n] = 0; list.forEach(p => { if (p.type) c[p.type]++; }); return c; },
    /* ----- 저장 ----- */
    _t: null, _busy: false, _again: false,
    save() { clearTimeout(App._t); App._t = setTimeout(App.flush, 500); try { localStorage.setItem('enn.me.' + App.room, JSON.stringify(App.me)); } catch (e) {} },
    async flush() {
      if (!App.joined || App.ro) return;
      if (App._busy) { App._again = true; return; }
      App._busy = true;
      try { App.me.u = Date.now(); await S.setPerson(S.pid, App.me); }
      catch (e) { if (!App.ro) { App.ro = true; App.toast('이 방에서는 저장 권한이 없어 읽기 전용으로 표시됩니다.'); App.schedule(); } }
      App._busy = false; if (App._again) { App._again = false; App.flush(); }
    },
    toast(msg, ms) { let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); } t.textContent = msg; t.hidden = false; clearTimeout(App._tt); App._tt = setTimeout(() => { t.hidden = true; }, ms || 2800); },
    /* ----- 진행도 ----- */
    progress(ch) {
      const m = App.me, a1 = App.A(1), a2 = App.A(2), a3 = App.A(3), a4 = App.A(4), a5 = App.A(5);
      const ok = v => v ? 1 : 0;
      const f = {
        1: [ok(m.rate.some(x => x > 0)), ok(m.type)],
        2: [ok(a2.julia && a2.julia.chk), ok(a2.nu && ['why', 'triad', 'arrow'].every(k => a2.nu[k] != null)), ok(a2.today)],
        3: [ok((a3.s && a3.s.length) || (a3.c && a3.c.length)), ok(a3.sim && ['s1', 's2', 's3'].every(k => a3.sim[k] != null)), ok(a3.jobs && a3.jobs.length)],
        4: [ok(a4.who && a4.guess), ok(a4.style), ok(a4.role != null), ok(a4.pledge)],
        5: [ok(a5.voice), ok(a5.prac), ok(a5.days && a5.days.some(Boolean)), ok(a5.on || a5.off)],
        6: [ok(App.view === 6 || a5.seen6)]
      }[ch] || [];
      return [f.reduce((a, b) => a + b, 0), f.length];
    },
    pct(p, ch) { const a = p.a || {}; const A = n => a['c' + n] || {}; const ok = v => v ? 1 : 0; const a1 = A(1), a2 = A(2), a3 = A(3), a4 = A(4), a5 = A(5);
      const f = { 1: [ok((p.rate || []).some(x => x > 0)), ok(p.type)], 2: [ok(a2.julia && a2.julia.chk), ok(a2.nu && a2.nu.why != null && a2.nu.triad != null && a2.nu.arrow != null), ok(a2.today)],
        3: [ok((a3.s && a3.s.length) || (a3.c && a3.c.length)), ok(a3.sim && a3.sim.s1 != null && a3.sim.s2 != null && a3.sim.s3 != null), ok(a3.jobs && a3.jobs.length)],
        4: [ok(a4.who && a4.guess), ok(a4.style), ok(a4.role != null), ok(a4.pledge)], 5: [ok(a5.voice), ok(a5.prac), ok(a5.days && a5.days.some(Boolean)), ok(a5.on || a5.off)] }[ch];
      return f ? f.reduce((x, y) => x + y, 0) / f.length : 0; },
    /* ----- 라우팅/렌더 ----- */
    go(v) { App.view = v; try { sessionStorage.setItem('enn.view', String(v)); } catch (e) {} App.renderAll(); window.scrollTo({ top: 0 }); },
    _raf: 0,
    schedule() { if (App._raf) return; App._raf = requestAnimationFrame(() => { App._raf = 0; App.renderAll(true); }); },
    renderAll(soft) {
      renderHeader();
      const main = $('#main');
      if (App.view === 'join') { if (!soft || !main.dataset.v || main.dataset.v !== 'join') { main.dataset.v = 'join'; main.innerHTML = joinView(); } return; }
      const key = String(App.view);
      const active = document.activeElement;
      const typing = active && main.contains(active) && /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName);
      if (main.dataset.v !== key) {
        main.dataset.v = key; main.innerHTML = '';
        if (App.view === 'home') main.innerHTML = '<div id="homebox"></div>';
        else {
          const ch = E.CHAPTERS.find(c => c.id === App.view);
          let h = `<div class="chead"><div class="k">${ch.id < 6 ? "CHAPTER " + ch.id : "FINALE"}</div><h2>${esc(ch.title)}</h2><p>${esc(App.chapterIntro[ch.id] || '')}</p></div>`;
          h += App.modules.filter(m => m.ch === App.view).map(m => `<section class="card" data-mod="${m.id}" aria-label="${esc(m.title)}"></section>`).join('');
          main.innerHTML = h;
        }
      }
      if (typing && soft) return; // 입력 중에는 덮어쓰지 않음
      if (App.view === 'home') { $('#homebox').innerHTML = homeView(); return; }
      main.querySelectorAll('[data-mod]').forEach(el => {
        const m = App.modules.find(x => x.id === el.dataset.mod);
        if (!m) return;
        const open = new Set([...el.querySelectorAll('details[open][data-dk]')].map(d => d.dataset.dk));
        const sy = window.scrollY;
        el.innerHTML = `<header>${m.step ? `<span class="step">${esc(m.step)}</span>` : ''}<h3>${esc(m.title)}</h3>${m.sub ? `<p class="sub">${esc(m.sub)}</p>` : ''}</header>` + m.view();
        open.forEach(k => { const d = el.querySelector(`details[data-dk="${k}"]`); if (d) d.open = true; });
        if (m.after) m.after(el);
        if (soft) window.scrollTo({ top: sy });
      });
    },
    chapterIntro: {
      1: '에니어그램의 도형과 구조를 읽고, 아홉 유형을 읽어 보며 가장 와닿는 유형을 찾습니다. 그리고 이 방의 사람들과 함께 지도를 그려 봅니다.',
      2: '한 인물(줄리아)의 사례로 유형·날개·센터·트라이어드를 한꺼번에 읽는 연습을 합니다. 내 프로필 카드도 만들어 봅니다.',
      3: '유형별로 일터에서의 강점과 함정이 어떻게 다른지 보고, 우리 팀의 모양을 그려 보며 갈등 상황을 함께 풀어 봅니다.',
      4: '관계에서 각 유형이 원하는 것을 이해하고, 소중한 사람과의 연결을 위해 이번 주에 할 행동을 정합니다.',
      5: '내면의 목소리를 알아차리고, 덜 쓰는 센터를 깨우는 연습을 정해 7일 동안 실천합니다.',
      6: '오늘 함께 만든 결과를 한눈에 보고, 나의 에니어그램 리포트를 정리합니다.'
    }
  };
  window.App = App;

  /* ---------- 헤더 ---------- */
  function renderHeader() {
    const people = App.ppl(); const n = people.length;
    const ch = App.state.chapter | 0;
    const tabs = [{ id: 'home', n: '⌂', t: '홈' }].concat(E.CHAPTERS.map(c => ({ id: c.id, n: c.id, t: c.title })));
    const h = `<div class="top-row">
      <div class="brand">${brandMark()}<div><b>에니어그램 워크숍</b><span>The Modern Enneagram</span></div></div><div class="sp"></div>
      ${App.joined ? `<span class="chip-room" title="이 방에 접속한 사람 수"><i class="live-dot"></i><b class="num">${n}</b>명 · 방 <b class="num">${esc(S.room)}</b>${S.demo ? ' · 체험' : ''}</span>
      <button class="btn sm ghost" data-act="fac-toggle">${App.fac ? '진행자 ✓' : '진행자'}</button>
      <button class="btn sm ghost" data-act="leave">나가기</button>` : ''}
    </div>` + (App.joined ? `<nav class="tabs" aria-label="챕터">` + tabs.map(t => `<button class="tab${ch && t.id === ch ? ' follow' : ''}" data-act="go" data-v="${t.id}" ${String(t.id) === String(App.view) ? 'aria-current="page"' : ''}><span class="n">${t.n}</span>${esc(t.t)}</button>`).join('') + `</nav>` : '');
    const el = $('#top'); if (el.dataset.k !== h) { el.dataset.k = h; el.innerHTML = h; }
    renderOverlay();
  }
  function brandMark() {
    let s = '<svg viewBox="-60 -60 120 120" aria-hidden="true"><circle r="50" fill="none" stroke="var(--ink)" stroke-width="3"/>';
    for (let n = 1; n <= 9; n++) { const [x, y] = V.pos(n, 50); s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="8" fill="${E.COLORS[n]}"/>`; }
    return s + '</svg>';
  }
  function renderOverlay() {
    let o = $('#overlay'); let h = '';
    const ch = App.state.chapter | 0;
    if (App.joined && ch && String(App.view) !== String(ch)) {
      const c = E.CHAPTERS.find(x => x.id === ch);
      h += `<div class="banner" role="status"><span><b>진행자</b>가 ${ch}장 「${esc(c.title)}」으로 이동했어요.</span><button class="btn sm" data-act="go" data-v="${ch}">함께 이동</button></div>`;
    }
    if (App.joined && App.ro) h += `<div class="callout" style="margin-top:12px">이 방에서는 내 결과를 저장할 수 없습니다. 다른 사람의 결과는 볼 수 있습니다. (공유 링크의 권한이 '보기 전용'일 수 있어요.)</div>`;
    if (o.dataset.k !== h) { o.dataset.k = h; o.innerHTML = h; }
    let f = $('#fac');
    if (App.facOpen && App.joined) { const hh = facView(); if (f.dataset.k !== hh && !(document.activeElement && f.contains(document.activeElement) && document.activeElement.tagName === 'INPUT')) { f.dataset.k = hh; f.innerHTML = hh; } f.hidden = false; }
    else f.hidden = true;
  }

  /* ---------- 입장 ---------- */
  function joinView() {
    let saved = {}; try { saved = JSON.parse(localStorage.getItem('enn.session') || '{}'); } catch (e) {}
    const modeNote = { artifact: 'Claude 공유 저장소로 연결되어 있어요. 이 링크에 접근 권한(수정/참여자)이 있는 사람과 결과가 실시간으로 공유됩니다.',
      firebase: '실시간 공유 서버(Firebase)에 연결되어 있어요. 같은 방 코드로 입장한 모든 사람과 결과가 공유됩니다.',
      local: '지금은 이 기기(브라우저) 안에서만 공유돼요. 여러 사람이 함께 하려면 README의 "실시간 공유 켜기"를 설정하세요. 먼저 체험 모드로 모든 화면을 볼 수 있습니다.' }[S.mode];
    return `<div class="hero"><div><div class="eyebrow">HR 성인 교육 프로그램</div>
      <h1>나를 알고,<br>서로를 이해하는<br>에니어그램</h1>
      <p class="lead">교재 『The Modern Enneagram』을 따라 5개 챕터를 함께 진행합니다. 각자 활동을 하면 이 방의 결과가 도표로 실시간 쌓여요.</p>
      <form class="join" id="joinform"><h3>워크숍 입장</h3>
        <label class="f">방 코드 <small>(영문·숫자 3~20자, 진행자가 알려 줍니다)</small><input type="text" id="jr" value="${esc(saved.room || '')}" maxlength="20" autocomplete="off" placeholder="예: hr-2026"></label>
        <label class="f">닉네임<input type="text" id="jn" value="${esc(saved.name || '')}" maxlength="14" autocomplete="off" placeholder="화면에 표시될 이름"></label>
        <label class="row" style="font-size:13.5px;gap:8px"><input type="checkbox" id="ja" ${saved.anon ? 'checked' : ''}> 다른 참가자에게 내 이름 숨기기(익명)</label>
        <div class="row"><button class="btn pri" type="submit">입장하기</button><button class="btn" type="button" data-act="demo">체험 모드로 둘러보기</button></div>
        <p class="mode-note" style="margin:0">${modeNote}</p></form></div>
      <div class="hero-art"><div class="wash"></div>${V.ennea({ nodeR: 21, label: '에니어그램 도형' })}</div></div>`;
  }
  async function join(room, name, anon, demo) {
    S.useRoom(demo ? 'demo' : room);
    App.room = S.room;
    try { localStorage.setItem('enn.session', JSON.stringify(demo ? JSON.parse(localStorage.getItem('enn.session') || '{}') : { room: S.room, name, anon })); } catch (e) {}
    let mine = null; try { mine = JSON.parse(localStorage.getItem('enn.me.' + S.room) || 'null'); } catch (e) {}
    App.me = Object.assign(emptyMe(), mine || {}); App.me.n = name; App.me.anon = anon ? 1 : 0; if (!App.me.t) App.me.t = Date.now();
    App.me.rate = (App.me.rate || []).concat([0, 0, 0, 0, 0, 0, 0, 0, 0]).slice(0, 9);
    App.joined = true; App.ro = false; App.map = {}; App.state = {};
    let first = true;
    const onErr = e => { App.toast('연결이 불안정합니다. 잠시 후 다시 시도해요.'); };
    if (App._u1) App._u1(); if (App._u2) App._u2();
    App._u1 = S.watchPeople(map => {
      App.map = map;
      if (first) { first = false; const r = map[S.pid]; if (r && (r.u || 0) > (App.me.u || 0)) { App.me = Object.assign(emptyMe(), r, { n: name, anon: anon ? 1 : 0, a: r.a || {}, rate: (r.rate || []).concat([0, 0, 0, 0, 0, 0, 0, 0, 0]).slice(0, 9) }); } else if (!r) { App.flush(); } else App.flush(); }
      App.schedule();
    }, onErr);
    App._u2 = S.watchState(st => { App.state = st || {}; App.schedule(); }, onErr);
    let v = 'home'; try { const sv = sessionStorage.getItem('enn.view'); if (sv) v = isNaN(+sv) ? sv : +sv; if (v === 'join') v = 'home'; } catch (e) {}
    try { App.fac = localStorage.getItem('enn.fac.' + S.room) === '1' && false; } catch (e) {}
    App.view = v; App.renderAll(); window.scrollTo({ top: 0 });
  }
  function leave() { App.joined = false; if (App._u1) App._u1(); if (App._u2) App._u2(); App.facOpen = false; App.fac = false; App.view = 'join'; $('#main').dataset.v = ''; App.renderAll(); }

  /* ---------- 홈 ---------- */
  function homeView() {
    const people = App.ppl(); const ch = App.state.chapter | 0;
    const typed = people.filter(p => p.type);
    let tot = 0, dn = 0; for (let c = 1; c <= 5; c++) { const [a, b] = App.progress(c); dn += a; tot += b; }
    const cards = E.CHAPTERS.filter(c => c.id < 6).map(c => { const [a, b] = App.progress(c.id); return `<button class="ch-card" data-act="go" data-v="${c.id}"><span class="n">${c.id}</span><b>${esc(c.title)}</b><small class="muted">${esc(c.tag)}</small><div class="bar-s"><i style="width:${b ? a / b * 100 : 0}%"></i></div><small>${a}/${b} 활동 완료${ch === c.id ? ' · <b style="color:var(--signal)">진행 중</b>' : ''}</small></button>`; }).join('')
      + `<button class="ch-card" data-act="go" data-v="6"><span class="n">∞</span><b>우리의 지도</b><small class="muted">전체 요약 · 나의 리포트</small></button>`;
    return `<div class="chead"><div class="k">WELCOME</div><h2>${esc(App.name(App.me))}님, 환영합니다</h2><p>챕터를 순서대로 진행하거나 진행자가 안내하는 챕터로 함께 이동하세요. 내 활동이 저장되면 이 방의 도표가 바로 갱신됩니다.</p></div>
      <div class="progress">${cards}</div>
      <section class="card"><header><h3>지금 이 방에 있는 사람들</h3><p class="sub">${people.length}명 접속 · 유형을 고른 사람 ${typed.length}명${S.demo ? ' · 체험 모드의 참가자는 가상 데이터입니다' : ''}</p></header>
        <div class="split w"><div>${V.ennea({ counts: App.typeCounts(people), selected: App.me.type ? [App.me.type] : [], label: '방 전체의 유형 분포' })}<p class="sub" style="text-align:center;margin:6px 0 0">원 안의 숫자 = 해당 유형을 고른 사람 수 · 점선 링 = 나</p></div>
        <div class="people" style="align-content:start">${people.sort((a, b) => (a.type || 99) - (b.type || 99)).map(p => `<span class="person${App.isMe(p) ? ' me' : ''}${p.demo ? ' demo' : ''}">${p.type ? tb(p.type) : '<span class="tb" style="background:var(--surface-2);color:var(--ink-3)">?</span>'}${esc(App.name(p))}</span>`).join('')}</div></div></section>
      <p class="ft">교재: Kacie Berghoef &amp; Melanie Bell, The Modern Enneagram (Althea Press, 2017) · 이 프로그램의 요약·질문은 학습용으로 재구성한 것입니다. 자기 이해를 돕는 도구이며 진단이 아닙니다.</p>`;
  }

  /* ---------- 진행자 ---------- */
  function facView() {
    const st = App.state, v = App.view;
    if (!App.fac) {
      const has = !!st.pin;
      return `<h4>진행자 <button class="btn sm ghost" data-act="fac-toggle" aria-label="닫기">✕</button></h4>
        <p class="sub" style="margin:0">${has ? '진행자 PIN을 입력하세요.' : '이 방의 진행자 PIN을 처음 정합니다. 이후 PIN을 아는 사람만 진행자 기능을 씁니다.'}</p>
        <div class="row"><input type="password" id="facpin" class="grow" placeholder="PIN (숫자/문자 4자 이상)" autocomplete="off" maxlength="20"><button class="btn pri sm" data-act="fac-login">${has ? '확인' : '시작'}</button></div>
        <small class="muted">간단한 잠금이며 보안 기능은 아닙니다.</small>`;
    }
    const cur = st.chapter | 0, chv = typeof v === 'number' ? v : 0;
    const people = App.ppl().filter(p => !p.demo);
    return `<h4>진행자 도구 <button class="btn sm ghost" data-act="fac-toggle" aria-label="닫기">✕</button></h4>
      <div class="group" style="border:0;padding:0">
        <b style="font-size:13px">참가자 화면 이동</b>
        <div class="row"><button class="btn sm pri" data-act="fac-set" data-v="${chv}" ${chv ? '' : 'disabled'}>지금 챕터(${chv || '-'})로 모두 이동</button><button class="btn sm" data-act="fac-set" data-v="0">안내 해제</button></div>
        <small class="muted">현재 안내: ${cur ? cur + '장' : '없음'}</small>
        <b style="font-size:13px;margin-top:6px">결과 공개</b>
        <div class="row">${[1, 2, 3, 4, 5].map(c => `<button class="chip" aria-pressed="${!(st.hide && st.hide[c])}" data-act="fac-hide" data-v="${c}" title="${c}장 결과 공개">${c}장</button>`).join('')}</div>
        <small class="muted">켜짐 = 참가자에게 방 전체 결과 공개. 끄면 참가자는 자기 결과만 봅니다.</small>
        <b style="font-size:13px;margin-top:6px">참가자 관리 (${people.length}명)</b>
        <div class="people" style="max-height:120px;overflow:auto">${people.map(p => `<span class="person">${esc(p.n || '참가자')} <button class="btn sm ghost" style="padding:0 6px" data-act="fac-del" data-id="${esc(p.id)}" aria-label="${esc(p.n)} 삭제">✕</button></span>`).join('') || '<small class="muted">없음</small>'}</div>
        <div class="row"><button class="btn sm" data-act="fac-csv">결과 복사(CSV)</button></div>
      </div>`;
  }

  /* ---------- 이벤트 ---------- */
  Object.assign(App.act, {
    go(el) { const v = el.dataset.v; App.go(isNaN(+v) ? v : +v); },
    demo() { join('demo', '체험자', false, true); },
    leave,
    'fac-toggle'() { App.facOpen = !App.facOpen; $('#fac').dataset.k = ''; renderOverlay(); },
    'fac-login'() {
      const pin = ($('#facpin') || {}).value || ''; if (pin.length < 4) { App.toast('PIN은 4자 이상이어야 해요.'); return; }
      const h = hash(pin);
      if (!App.state.pin) { S.setState(Object.assign({}, App.state, { pin: h })); App.state.pin = h; App.fac = true; App.toast('진행자로 시작했어요.'); }
      else if (App.state.pin === h) { App.fac = true; App.toast('진행자 모드'); }
      else { App.toast('PIN이 달라요.'); return; }
      $('#fac').dataset.k = ''; App.schedule(); renderOverlay();
    },
    'fac-set'(el) { const v = +el.dataset.v; const st = Object.assign({}, App.state, { chapter: v }); App.state = st; S.setState(st); App.schedule(); },
    'fac-hide'(el) { const c = +el.dataset.v; const hide = Object.assign({}, App.state.hide || {}); hide[c] = !hide[c]; const st = Object.assign({}, App.state, { hide }); App.state = st; S.setState(st); App.schedule(); },
    'fac-del'(el) { S.delPerson(el.dataset.id); delete App.map[el.dataset.id]; App.schedule(); },
    'fac-csv'() {
      const rows = [['이름', '유형', '날개', ...Array.from({ length: 9 }, (_, i) => '공명' + (i + 1)), '챕터1', '챕터2', '챕터3', '챕터4', '챕터5(%)']];
      App.ppl().filter(p => !p.demo).forEach(p => rows.push([p.n, p.type || '', p.wing || '', ...(p.rate || []).concat(Array(9).fill('')).slice(0, 9), ...[1, 2, 3, 4, 5].map(c => Math.round(App.pct(p, c) * 100))]));
      const csv = rows.map(r => r.map(x => '"' + String(x == null ? '' : x).replace(/"/g, '""') + '"').join(',')).join('\n');
      (navigator.clipboard ? navigator.clipboard.writeText(csv) : Promise.reject()).then(() => App.toast('CSV를 클립보드에 복사했어요.'), () => { App.toast('복사가 막혀 있어요. 아래 칸에서 직접 복사하세요.'); const ta = document.createElement('textarea'); ta.value = csv; ta.style.marginTop = '8px'; $('#fac').appendChild(ta); ta.select(); });
    }
  });
  document.addEventListener('click', e => { const el = e.target.closest('[data-act]'); if (!el) return; const f = App.act[el.dataset.act]; if (f) { e.preventDefault(); f(el, e); } });
  document.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.getAttribute && e.target.getAttribute('role') === 'button' && e.target.closest('svg')) { e.preventDefault(); e.target.dispatchEvent(new MouseEvent('click', { bubbles: true })); } });
  document.addEventListener('input', e => { const el = e.target.closest('[data-in]'); if (el && App.inp[el.dataset.in]) App.inp[el.dataset.in](el, e); });
  document.addEventListener('change', e => { const el = e.target.closest('[data-ch]'); if (el && App.inp[el.dataset.ch]) App.inp[el.dataset.ch](el, e); });
  document.addEventListener('submit', e => {
    if (e.target.id !== 'joinform') return; e.preventDefault();
    const room = S.clean($('#jr').value), name = $('#jn').value.trim().slice(0, 14), anon = $('#ja').checked;
    if (room.length < 3) { App.toast('방 코드는 영문·숫자 3자 이상이에요.'); return; }
    if (!name) { App.toast('닉네임을 입력해 주세요.'); return; }
    join(room, name, anon, false);
  });

  /* ---------- 부팅 ---------- */
  window.addEventListener('DOMContentLoaded', async () => {
    await S.init();
    App.renderAll();
    document.documentElement.dataset.ready = '1';
  });
})();
