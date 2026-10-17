/* 저장 계층: 실시간으로 참가자 결과를 공유합니다.
   1) Claude 아티팩트 db  2) Firebase Realtime Database(REST)  3) 이 브라우저(로컬/체험)
   어댑터 공통 인터페이스: set(col,id,data) · del(col,id) · watch(col,cb) → unsub */
(function () {
  const clean = s => String(s || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 24);

  /* ---------- 메모리/로컬 어댑터 ---------- */
  function MemoryAdapter(opts) {
    opts = opts || {};
    const key = c => 'enn1:' + c;
    const mem = {};
    const subs = {};
    let bc = null;
    try { if (opts.persist && 'BroadcastChannel' in window) bc = new BroadcastChannel('enn1'); } catch (e) { bc = null; }
    function read(c) {
      if (!opts.persist) return mem[c] || {};
      try { return JSON.parse(localStorage.getItem(key(c)) || '{}') || {}; } catch (e) { return mem[c] || {}; }
    }
    function write(c, m) {
      mem[c] = m;
      if (opts.persist) { try { localStorage.setItem(key(c), JSON.stringify(m)); } catch (e) {} }
    }
    function emit(c) { (subs[c] || []).forEach(f => f(read(c))); }
    if (bc) bc.onmessage = ev => emit(ev.data);
    window.addEventListener('storage', ev => { if (ev.key && ev.key.indexOf('enn1:') === 0) emit(ev.key.slice(5)); });
    return {
      kind: opts.persist ? 'local' : 'demo',
      seed(c, m) { mem[c] = m; },
      async set(c, id, d) { const m = Object.assign({}, read(c)); m[id] = JSON.parse(JSON.stringify(d)); write(c, m); emit(c); if (bc) bc.postMessage(c); },
      async del(c, id) { const m = Object.assign({}, read(c)); delete m[id]; write(c, m); emit(c); if (bc) bc.postMessage(c); },
      watch(c, cb) { (subs[c] = subs[c] || []).push(cb); setTimeout(() => cb(read(c)), 0); return () => { subs[c] = subs[c].filter(f => f !== cb); }; }
    };
  }

  /* ---------- Firebase Realtime Database (REST, 라이브러리 없음) ---------- */
  function FirebaseAdapter(base) {
    base = base.replace(/\/+$/, '');
    const watchers = new Set();
    const url = (c, id) => base + '/' + c + (id ? '/' + id : '') + '.json';
    async function poll(w) {
      try {
        const r = await fetch(url(w.c), { cache: 'no-store' });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const j = (await r.json()) || {};
        const s = JSON.stringify(j);
        if (s !== w.last) { w.last = s; w.cb(j); }
        w.err = 0;
      } catch (e) { w.err = (w.err || 0) + 1; if (w.onError) w.onError(e); }
    }
    let timer = null;
    function loop() {
      clearTimeout(timer);
      watchers.forEach(poll);
      timer = setTimeout(loop, document.hidden ? 9000 : 2200);
    }
    return {
      kind: 'firebase',
      async set(c, id, d) {
        const r = await fetch(url(c, id), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) });
        if (!r.ok) throw new Error('쓰기 실패 (' + r.status + ')');
        watchers.forEach(w => { if (w.c === c) poll(w); });
      },
      async del(c, id) { await fetch(url(c, id), { method: 'DELETE' }); watchers.forEach(w => { if (w.c === c) poll(w); }); },
      watch(c, cb, onError) {
        const w = { c, cb, last: null, onError };
        watchers.add(w); poll(w); if (!timer) loop();
        return () => watchers.delete(w);
      }
    };
  }

  /* ---------- Claude 아티팩트 db ---------- */
  function ArtifactAdapter(db) {
    return {
      kind: 'artifact',
      async set(c, id, d) { await db.doc(c + '/' + id).set(JSON.parse(JSON.stringify(d))); },
      async del(c, id) { await db.doc(c + '/' + id).delete(); },
      watch(c, cb, onError) {
        return db.collection(c).onSnapshot(snap => {
          const m = {}; snap.docs.forEach(d => { m[d.id] = d.data(); }); cb(m);
        }, e => { if (onError) onError(e); });
      }
    };
  }

  /* ---------- 데모 참가자 (체험 모드용 · 결정적 생성) ---------- */
  function seedDemo(mem, col) {
    let s = 20261018;
    const rnd = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
    const names = ['민지','도윤','서연','하준','지우','예준','수아','시우','하은','지호','유나','준서','채원','건우','다은','현우','소율','태민','나연','재윤','보라','성민','은서','우진'];
    const w = {1:3,2:3,3:3,4:2,5:3,6:4,7:3,8:2,9:3};
    const bag = []; for (const t in w) for (let i = 0; i < w[t]; i++) bag.push(+t);
    const people = {};
    names.forEach((nm, i) => {
      const type = bag[i % bag.length];
      const wg = ENN.wingsOf(type)[rnd() < .5 ? 0 : 1];
      const rate = [0,0,0,0,0,0,0,0,0].map(() => 1 + Math.floor(rnd() * 3));
      rate[type - 1] = 5; rate[wg - 1] = Math.max(rate[wg - 1], 4);
      const stress = ENN.STRESS[type], sec = ENN.SECURITY[type];
      const a = { c1:{ conf: 3 + Math.floor(rnd() * 3) } };
      a.c2 = { julia:{ type: rnd() < .7 ? 7 : 1 + Math.floor(rnd() * 9), wing: rnd() < .6 ? 6 : 8, center: rnd() < .75 ? 'head' : 'gut', social: rnd() < .7 ? 'assertive' : 'compliant', conflict: rnd() < .65 ? 'positive' : 'emotional', object: rnd() < .7 ? 'frustration' : 'rejection' },
               nu:{ why: rnd() < .7 ? 0 : 1, triad: rnd() < .6 ? 1 : 0, arrow: rnd() < .55 ? 1 : 2 },
               today: ['core','core','stress','security'][Math.floor(rnd() * 4)] };
      const cs = ENN.WORK_CHIPS.strengths, cc = ENN.WORK_CHIPS.challenges;
      a.c3 = { s: [cs[type - 1], cs[Math.floor(rnd() * 9)]], c: [cc[type - 1]], sim:{ s1: rnd() < .7 ? 1 : 0, s2: rnd() < .65 ? 1 : 2, s3: rnd() < .6 ? 1 : 0 },
               jobs: [ENN.T[type].careers[0], ENN.T[type].careers[1 + Math.floor(rnd() * 3)]] };
      a.c4 = { who: ENN.PEOPLE[Math.floor(rnd() * 5)], guess: 1 + Math.floor(rnd() * 9), style: ['competency','emotional','positive'][Math.floor(rnd() * 3)], hard: Math.floor(rnd() * 3),
               role: rnd() < .55 ? type - 1 : Math.floor(rnd() * 9),
               pledge: ['이번 주에 안부 먼저 묻기','저녁 식사에 휴대폰 내려놓기','고마운 점 한 가지 말하기','끝까지 듣고 나서 말하기','함께 산책 약속 잡기'][Math.floor(rnd() * 5)] };
      a.c5 = { voice: rnd() < .6 ? type : 1 + Math.floor(rnd() * 9), freq: 1 + Math.floor(rnd() * 5),
               prac: ENN.DAILY[Math.floor(rnd() * 4)], min: [5,10,10,15,20][Math.floor(rnd() * 5)],
               days: [0,0,0,0,0,0,0].map((_, d) => d < Math.floor(rnd() * 8) ? 1 : 0),
               on: ['이번 주 한 번은 산책하며 쉬기','가족과 저녁을 함께하기','하루 10분 조용히 앉아 있기'][Math.floor(rnd() * 3)], off:['끝없는 메신저 확인','내 일정이 자꾸 밀림','쉬는 시간이 없음'][Math.floor(rnd() * 3)],
               sup:['routine','troops','impermanence'].filter(() => rnd() < .55) };
      people['demo' + i] = { n: nm, type, wing: wg, rate, a, t: 1, u: 1, demo: 1 };
    });
    mem.seed(col, people);
  }

  /* ---------- Store ---------- */
  const Store = {
    mode: 'local', adapter: null, room: '', pid: '', demo: false, notice: null,
    async init() {
      try { this.pid = localStorage.getItem('enn.pid') || ''; } catch (e) {}
      if (!this.pid) { this.pid = 'p' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); try { localStorage.setItem('enn.pid', this.pid); } catch (e) {} }
      this.local = MemoryAdapter({ persist: true });
      this.memory = MemoryAdapter({ persist: false });
      let db = null;
      try { if (window.claude && window.claude.use) db = await Promise.race([window.claude.use('db'), new Promise(r => setTimeout(() => r(null), 2500))]); } catch (e) { db = null; }
      const fb = (window.ENN_CONFIG && window.ENN_CONFIG.firebaseUrl) || '';
      if (db) { this.shared = ArtifactAdapter(db); this.mode = 'artifact'; }
      else if (fb) { this.shared = FirebaseAdapter(fb); this.mode = 'firebase'; }
      else { this.shared = this.local; this.mode = 'local'; }
      return this.mode;
    },
    useRoom(code) {
      this.room = clean(code) || 'demo';
      this.demo = this.room === 'demo';
      if (this.demo) { this.adapter = this.memory; seedDemo(this.memory, this.col('people')); }
      else this.adapter = this.shared;
    },
    col(n) { return 'rooms/' + this.room + '/' + n; },
    setPerson(id, d) { return this.adapter.set(this.col('people'), id, d); },
    delPerson(id) { return this.adapter.del(this.col('people'), id); },
    watchPeople(cb, err) { return this.adapter.watch(this.col('people'), m => cb(m || {}), err); },
    setState(d) { return this.adapter.set(this.col('state'), 'main', d); },
    watchState(cb, err) { return this.adapter.watch(this.col('state'), m => cb((m && m.main) || {}), err); },
    clean
  };
  window.Store = Store;
})();
