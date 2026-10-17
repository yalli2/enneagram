/* 도표: 에니어그램 심볼, 막대, 레이더, 도넛, 매트릭스, 스택바, 챌린지 히트맵 (SVG/HTML, 라이브러리 없음) */
(function () {
  const E = window.ENN;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const ang = n => (-90 + 40 * (n % 9)) * Math.PI / 180;
  const pos = (n, R) => [Math.cos(ang(n)) * R, Math.sin(ang(n)) * R];
  let uid = 0;

  /* 에니어그램 심볼 */
  function ennea(o) {
    o = o || {};
    const R = 124, id = 'm' + (++uid);
    const L = Object.assign({ circle: true, triangle: true, hexad: true, numbers: true }, o.layers || {});
    const counts = o.counts || null;
    const sel = o.selected || [];
    const dim = o.dim || [];
    const nodeR = n => counts ? Math.min(34, 11 + 7 * Math.sqrt(counts[n] || 0)) : (o.nodeR || 17);
    let s = `<svg class="ennea" viewBox="-175 -170 350 340" role="img" aria-label="${esc(o.label || '에니어그램 도형')}">`;
    s += `<defs>
      <marker id="${id}s" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--stress)"/></marker>
      <marker id="${id}g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--secure)"/></marker>
      <marker id="${id}i" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ink-2)"/></marker></defs>`;
    if (L.circle) s += `<circle r="${R}" class="e-circle"/>`;
    const line = (a, b, cls) => { const [x1, y1] = pos(a, R), [x2, y2] = pos(b, R); return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="${cls}"/>`; };
    if (L.triangle) E.TRIANGLE.forEach(([a, b]) => { s += line(a, b, 'e-tri'); });
    if (L.hexad) E.HEXAD.forEach(([a, b]) => { s += line(a, b, 'e-hex'); });
    // 화살표
    const arrow = (a, b, kind, w) => {
      const [x1, y1] = pos(a, R), [x2, y2] = pos(b, R);
      const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
      const off = 8, na = nodeR(a) + off, nb = nodeR(b) + off + 3;
      const mid = kind === 'stress' ? -1 : 1; // 두 방향이 겹치지 않게 살짝 휘어서
      const sx = x1 + ux * na, sy = y1 + uy * na, ex = x2 - ux * nb, ey = y2 - uy * nb;
      const cx = (sx + ex) / 2 - uy * 14 * mid, cy = (sy + ey) / 2 + ux * 14 * mid;
      const col = kind === 'stress' ? 'var(--stress)' : kind === 'secure' ? 'var(--secure)' : 'var(--ink-2)';
      const mk = kind === 'stress' ? id + 's' : kind === 'secure' ? id + 'g' : id + 'i';
      return `<path d="M${sx.toFixed(1)} ${sy.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}" fill="none" stroke="${col}" stroke-width="${w || 2.6}" stroke-linecap="round" marker-end="url(#${mk})" opacity=".9"/>`;
    };
    (o.arrows || []).forEach(a => { s += arrow(a[0], a[1], a[2], a[3]); });
    // 노드
    for (let n = 1; n <= 9; n++) {
      const [x, y] = pos(n, R);
      const col = o.colorBy ? (o.colorBy[n] || E.COLORS[n]) : E.COLORS[n];
      const on = sel.includes(n), off = dim.includes(n);
      const r = nodeR(n);
      s += `<g class="e-node${on ? ' on' : ''}${off ? ' off' : ''}${o.pick ? ' pick' : ''}" data-type="${n}" data-n="${n}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})" ${o.pick ? 'data-act="' + (o.act || '') + '" tabindex="0" role="button" aria-label="' + n + '번 유형"' : ''}>`;
      if (on) s += `<circle r="${r + 6}" class="e-ring"/>`;
      s += `<circle r="${r}" fill="${col}" class="e-dot"/>`;
      if (counts) {
        s += `<text class="e-count" y="1" fill="${E.INK_ON[n]}">${counts[n] || 0}</text>`;
        const [lx, ly] = pos(n, R + 33 + (r > 24 ? 6 : 0));
        s += `<text class="e-num" x="${(lx - x).toFixed(1)}" y="${(ly - y + 4).toFixed(1)}">${n}</text>`;
      } else if (L.numbers) s += `<text class="e-label" y="1" fill="${E.INK_ON[n]}">${n}</text>`;
      s += `</g>`;
    }
    return s + '</svg>';
  }

  /* 가로 막대 (HTML) */
  function hbars(items, o) {
    o = o || {};
    const max = o.max || Math.max(1, ...items.map(i => i.value));
    return `<div class="hbars">` + items.map(i => {
      const pct = Math.max(0, Math.min(100, i.value / max * 100));
      return `<div class="hb${i.mine ? ' mine' : ''}"><div class="hb-l" title="${esc(i.label)}">${i.badge ? `<span class="tb" style="background:${i.color};color:${i.ink || '#fff'}">${esc(i.badge)}</span>` : ''}<span>${esc(i.label)}</span></div>
        <div class="hb-t"><div class="hb-f" style="width:${pct}%;background:${i.color || 'var(--accent)'}"></div></div>
        <div class="hb-v">${i.text != null ? esc(i.text) : i.value}${i.mine ? '<i class="me" title="내 선택">●</i>' : ''}</div></div>`;
    }).join('') + `</div>`;
  }

  /* 레이더 (9축, 에니어그램 위치) */
  function radar(series, o) {
    o = o || {}; const R = 104, max = o.max || 5;
    let s = `<svg class="radar" viewBox="-150 -140 300 280" role="img" aria-label="${esc(o.label || '유형별 공명도')}">`;
    [1, 2, 3, 4, 5].forEach(k => {
      const pts = []; for (let n = 1; n <= 9; n++) { const [x, y] = pos(n, R * k / max); pts.push(x.toFixed(1) + ',' + y.toFixed(1)); }
      s += `<polygon points="${pts.join(' ')}" class="r-grid"/>`;
    });
    for (let n = 1; n <= 9; n++) { const [x, y] = pos(n, R), [lx, ly] = pos(n, R + 17); s += `<line x1="0" y1="0" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" class="r-ax"/><text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" class="r-n" fill="${E.COLORS[n]}">${n}</text>`; }
    series.forEach(se => {
      const pts = []; for (let n = 1; n <= 9; n++) { const [x, y] = pos(n, R * (se.values[n - 1] || 0) / max); pts.push(x.toFixed(1) + ',' + y.toFixed(1)); }
      s += `<polygon points="${pts.join(' ')}" fill="${se.color}" fill-opacity="${se.fill == null ? .18 : se.fill}" stroke="${se.color}" stroke-width="${se.w || 2.2}" ${se.dash ? 'stroke-dasharray="5 4"' : ''} stroke-linejoin="round"/>`;
    });
    return s + '</svg>';
  }

  /* 도넛 */
  function donut(items, o) {
    o = o || {}; const total = items.reduce((a, b) => a + b.value, 0);
    const R = 62, r = 40; let a0 = -Math.PI / 2;
    let s = `<svg class="donut" viewBox="-80 -80 160 160" role="img" aria-label="${esc(o.label || '비율')}">`;
    if (!total) s += `<circle r="${(R + r) / 2}" fill="none" stroke="var(--line)" stroke-width="${R - r}"/>`;
    items.forEach(i => {
      if (!i.value) return; const frac = i.value / total, a1 = a0 + frac * Math.PI * 2 - (items.filter(x => x.value).length > 1 ? .02 : 0);
      if (frac > .9995) { s += `<circle r="${(R + r) / 2}" fill="none" stroke="${i.color}" stroke-width="${R - r}"/>`; }
      else {
        const p = (rad, a) => (Math.cos(a) * rad).toFixed(1) + ' ' + (Math.sin(a) * rad).toFixed(1), large = (a1 - a0) > Math.PI ? 1 : 0;
        s += `<path d="M${p(R, a0)} A${R} ${R} 0 ${large} 1 ${p(R, a1)} L${p(r, a1)} A${r} ${r} 0 ${large} 0 ${p(r, a0)}Z" fill="${i.color}"/>`;
      }
      a0 += frac * Math.PI * 2;
    });
    s += `<text class="d-big" y="4">${total}</text><text class="d-sm" y="19">${esc(o.unit || '명')}</text></svg>`;
    return s;
  }

  /* 스택바 */
  function stack(items) {
    const total = items.reduce((a, b) => a + b.value, 0) || 1;
    return `<div class="stack" role="img">` + items.map(i => i.value ? `<div class="st-seg" style="flex:${i.value};background:${i.color};color:${i.ink || '#fff'}" title="${esc(i.label)} ${i.value}"><span>${i.value}</span></div>` : '').join('') + `</div>
      <div class="legend">` + items.map(i => `<span><i style="background:${i.color}"></i>${esc(i.label)} <b>${i.value}</b> <em>${Math.round(i.value / total * 100)}%</em></span>`).join('') + `</div>`;
  }

  /* 매트릭스(히트맵) */
  function matrix(o) {
    const cell = (r, c) => (o.cells[r + '|' + c] || 0);
    let max = 1; o.rows.forEach(r => o.cols.forEach(c => { max = Math.max(max, cell(r.k, c.k)); }));
    let s = `<div class="mx-wrap"><table class="mx"><thead><tr><th class="mx-corner">${esc(o.corner || '')}</th>` + o.cols.map(c => `<th title="${esc(c.title || c.label)}">${c.badge ? `<span class="tb" style="background:${c.color};color:${c.ink || '#fff'}">${esc(c.badge)}</span>` : esc(c.label)}</th>`).join('') + `</tr></thead><tbody>`;
    o.rows.forEach(r => {
      s += `<tr><th title="${esc(r.title || r.label)}">${r.badge ? `<span class="tb" style="background:${r.color};color:${r.ink || '#fff'}">${esc(r.badge)}</span>` : ''}${r.badge ? '' : esc(r.label)}</th>`;
      o.cols.forEach(c => { const v = cell(r.k, c.k), a = v ? .14 + .78 * v / max : 0; s += `<td class="${v ? 'has' : ''}${o.diag && o.diag(r.k, c.k) ? ' diag' : ''}" style="${v ? `background:color-mix(in srgb, var(--accent) ${Math.round(a * 100)}%, transparent)` : ''}">${v || ''}</td>`; });
      s += `</tr>`;
    });
    return s + `</tbody></table></div>`;
  }

  /* 7일 챌린지 히트스트립 */
  function strips(rows, days) {
    days = days || 7;
    return `<div class="strips">` + rows.map(r => `<div class="strip${r.mine ? ' mine' : ''}"><span class="s-n"><span class="tb sm" style="background:${r.color};color:${r.ink || '#fff'}">${r.type || ''}</span>${esc(r.name)}</span><span class="s-d">` +
      Array.from({ length: days }, (_, i) => `<i class="${r.days[i] ? 'on' : ''}" style="${r.days[i] ? 'background:' + r.color : ''}"></i>`).join('') + `</span><span class="s-c">${r.days.filter(Boolean).length}/${days}</span></div>`).join('') + `</div>`;
  }

  window.Viz = { esc, ennea, hbars, radar, donut, stack, matrix, strips, pos };
})();
