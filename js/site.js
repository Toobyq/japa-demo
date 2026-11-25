/* Japa Oneightwo — site público: capa, rota, flashes, estilos, como funciona, oficina, minha tattoo,
   eventos e a "prancheta" (o pedido de orçamento em passos). */
'use strict';
carregar();
const MOTIVOS = { blackwork: ['pedras', 'pb', '#8a8e93'], realismo: ['olho', 'pb', '#a3a7ab'], aquarela: ['caveira', '', '#ff3ea5'], newschool: ['cogumelo', '', '#d4ff3b'], oldschool: ['adaga', '', '#ffb02e'], oriental: ['onda', '', '#20d4ea'], lettering: [null, '', '#ff4436'], fineline: ['lua', 'pb', '#efe7d6'] };

/* ---------- capa ---------- */
function montarFixos() {
  $('.marca-a').innerHTML = logoSVG({ one: false });
  $('.capa-logo').innerHTML = logoSVG({ anima: true });
  $('.rodape-a').innerHTML = logoSVG();
  $('.trilha .anda').innerHTML = caracolSVG({ anima: true });
  $('.caracol-como').innerHTML = caracolSVG({ anima: true, concha: 'var(--ciano)' });
  $('.pr-caracol').innerHTML = caracolSVG({ anima: true });
  const itens = ['Tattoo a domicílio', 'Serra Gaúcha', 'Porto Alegre', 'Litoral SC', 'Flash', 'Arte exclusiva', 'Customização', 'O estúdio anda comigo'];
  const faixa = itens.map(t => `<span>${esc(t)} <i>✦</i></span>`).join('');
  $('.faixa-rola').innerHTML = faixa + faixa;
  $('#pecas').innerHTML = PECAS.map(p => `<span>${esc(p[1])}</span>`).join('');
  $('#linkInsta').href = 'https://www.instagram.com/' + encodeURIComponent(S.artista.insta || '') + '/';
  $('#listaCuidados').innerHTML = CUIDADOS.map(c => `<div class="cuidado revela"><b>${esc(c.t)}</b><p>${esc(c.txt)}</p></div>`).join('');
  $('.oficina-arte').innerHTML = `<svg class="jaqueta" viewBox="0 0 320 360" aria-hidden="true">
    <path class="tecido" d="M96 44 L132 30 Q160 52 188 30 L224 44 L292 128 L262 156 L240 132 L240 336 L80 336 L80 132 L58 156 L28 128 Z"/>
    <path class="costura" d="M88 140 L88 326 L232 326 L232 140 M132 34 Q160 60 188 34"/>
    <g class="pintura" transform="translate(110 120) scale(1)"><svg width="100" height="100" viewBox="0 0 100 100" fill="none" stroke="#141114" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">${DESENHOS.caveira()}</svg></g>
    <text x="160" y="264" text-anchor="middle" font-family="Marker, cursive" font-size="26" fill="#ff3ea5" transform="rotate(-4 160 264)">NO RULES</text>
    <g class="pincel"><g transform="translate(220 200)"><rect x="0" y="-5" width="70" height="10" rx="4" fill="#c58b4a" stroke="var(--texto)" stroke-width="2"/><rect x="-14" y="-7" width="16" height="14" rx="2" fill="#bbb" stroke="var(--texto)" stroke-width="2"/><path d="M-14 -6 Q-30 0 -14 6 Z" fill="#ff3ea5" stroke="var(--texto)" stroke-width="2"/></g></g>
  </svg>`;
}
function ondeEstou() {
  const r = estouEm(), el = $('#ondeEstou'); const reg = regiao(r.reg);
  let txt;
  if (reg) { const par = paradas({ dias: 40 }).find(p => p.reg !== r.reg && p.reg !== 'folga' && p.ini > hoje0()); txt = `<b>Agora: ${esc(reg.nome)}</b>${par && regiao(par.reg) ? `<span class="suave">· depois: ${esc(regiao(par.reg).curto)} em ${dataBR(par.ini)}</span>` : ''}`; }
  else txt = r.reg === 'evento' ? `<b>Hoje: ${esc(r.nota || 'evento')}</b>` : `<b>Hoje é folga</b><span class="suave">· cachoeira, provavelmente</span>`;
  el.className = 'onde-estou r-' + r.reg; el.innerHTML = `<span class="ponto"></span>${txt}`;
}

/* rabisco na capa: tinta que some, zumbido enquanto aperta */
function rabisco() {
  const cv = $('.rabisco'), c = cv.getContext('2d'); let pts = [], baixo = false, osc = null, cor = 0; const cores = ['#ff3ea5', '#20d4ea', '#d4ff3b', '#f2ede4'];
  const tam = () => { const k = devicePixelRatio || 1; cv.width = cv.clientWidth * k; cv.height = cv.clientHeight * k; c.setTransform(k, 0, 0, k, 0, 0); }; tam(); addEventListener('resize', tam);
  const maquina = on => { const ac = Som.ac(); if (!ac) return;
    if (on && !osc) { const o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter(), l = ac.createOscillator(), lg = ac.createGain();
      o.type = 'sawtooth'; o.frequency.value = 118; o2.type = 'square'; o2.frequency.value = 59; l.frequency.value = 31; lg.gain.value = .02; f.type = 'bandpass'; f.frequency.value = 1400; g.gain.value = .045;
      l.connect(lg); lg.connect(g.gain); o.connect(f); o2.connect(f); f.connect(g); g.connect(ac.destination); [o, o2, l].forEach(x => x.start()); osc = { o, o2, l, g, ac }; }
    if (!on && osc) { const { o, o2, l, g, ac: a } = osc; g.gain.setTargetAtTime(0, a.currentTime, .03); [o, o2, l].forEach(x => x.stop(a.currentTime + .15)); osc = null; } };
  const pos = e => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now(), forte: baixo, cor: cores[cor % cores.length] }; };
  cv.addEventListener('pointermove', e => { const p = pos(e); const u = pts[pts.length - 1]; if (u && Math.hypot(p.x - u.x, p.y - u.y) > 40 && !u.fim) p.salto = true; pts.push(p); if (pts.length > 600) pts.shift(); $('.dica-rabisco').classList.add('foi'); });
  cv.addEventListener('pointerdown', e => { baixo = true; cor++; pts.push({ ...pos(e), salto: true }); maquina(true); });
  const solta = () => { baixo = false; maquina(false); if (pts.length) pts[pts.length - 1].fim = true; };
  addEventListener('pointerup', solta); cv.addEventListener('pointerleave', () => { solta(); if (pts.length) pts[pts.length - 1].fim = true; });
  (function quadro() {
    const agora = performance.now(); c.clearRect(0, 0, cv.clientWidth, cv.clientHeight); pts = pts.filter(p => agora - p.t < 2600);
    for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i]; if (b.salto || a.fim) continue; const idade = (agora - b.t) / 2600;
      c.strokeStyle = b.cor; c.globalAlpha = (1 - idade) * (b.forte ? .95 : .45); c.lineWidth = b.forte ? 7 - idade * 4 : 2.2; c.lineCap = 'round';
      c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); }
    c.globalAlpha = 1; requestAnimationFrame(quadro);
  })();
}

/* ---------- rota ---------- */
const NOS = { serra: [180, 205], poa: [235, 352], litoral: [392, 86] };
let regSel = null, comprimentos = null;
function mapa() {
  const r = estouEm().reg;
  $('#mapa').innerHTML = `<svg viewBox="0 0 500 430" aria-label="Mapa da rota">
    <g class="agua-anda">${[0, 1, 2, 3, 4, 5].map(i => `<path class="agua" d="M${410 + (i % 2) * 20} ${160 + i * 40} q 12 -8 24 0 t 24 0 t 24 0"/>`).join('')}</g>
    <path id="estrada" class="estrada" d="M235 352 C 175 300, 140 262, 180 205 C 215 150, 300 150, 392 86"/>
    <path class="estrada-viva" id="estradaViva" d="M0 0"/>
    <g class="no r-serra ${r === 'serra' ? 'ativo' : ''}" data-reg="serra"><path class="desenho" d="M100 250 L132 196 L152 222 L178 178 L210 236 M60 250 L230 250 M118 250 l0 -18 m-8 8 l8 -10 l8 10 m-12 -4 l4 -4 l4 4"/>
      <circle class="halo" cx="180" cy="205" r="44"/><circle class="centro" cx="180" cy="205" r="11"/><text x="40" y="285">Serra Gaúcha</text><text class="sub" x="40" y="302">BASE · BENTO GONÇALVES</text></g>
    <g class="no r-poa ${r === 'poa' ? 'ativo' : ''}" data-reg="poa"><path class="desenho" d="M262 398 L262 372 L274 372 L274 360 L286 360 L286 388 L296 388 L296 366 L306 366 L306 398 M248 398 L320 398 M330 398 A 22 22 0 0 0 374 398"/>
      <circle class="halo" cx="235" cy="352" r="40"/><circle class="centro" cx="235" cy="352" r="11"/><text x="60" y="360">Porto Alegre</text><text class="sub" x="60" y="377">CAPITAL E REGIÃO</text></g>
    <g class="no r-litoral ${r === 'litoral' ? 'ativo' : ''}" data-reg="litoral"><path class="desenho" d="M380 140 q 10 -8 20 0 t 20 0 t 20 0 M392 156 q 10 -8 20 0 t 20 0 M440 60 l0 -16 m-10 6 l10 -6 l10 6"/>
      <circle class="halo" cx="392" cy="86" r="44"/><circle class="centro" cx="392" cy="86" r="11"/><text x="250" y="40">Litoral SC</text><text class="sub" x="250" y="57">FLORIPA · ROSA · BC</text></g>
    <g class="bicho" id="bicho"><g transform="translate(-37 -66) scale(.6)">${caracolSVG({ anima: true }).replace(/<\/?svg[^>]*>/g, '')}</g></g>
  </svg><p class="legenda">${r === 'folga' ? 'Hoje é folga 🌿' : r === 'evento' ? 'Hoje: evento 🎪' : 'O caracol tá aqui agora. Toca numa região.'}</p>`;
  const est = $('#estrada'), L = est.getTotalLength(); comprimentos = {};
  for (const k in NOS) { let melhor = 0, dist = 1e9; for (let i = 0; i <= 200; i++) { const p = est.getPointAtLength(L * i / 200), d = Math.hypot(p.x - NOS[k][0], p.y - NOS[k][1]); if (d < dist) { dist = d; melhor = L * i / 200; } } comprimentos[k] = melhor; }
  const atual = NOS[r] ? r : 'serra'; posBicho(comprimentos[atual]); $('#bicho').dataset.em = comprimentos[atual];
  $$('#mapa .no').forEach(n => n.addEventListener('click', () => escolherRegiao(n.dataset.reg, true)));
}
function posBicho(len) { const est = $('#estrada'), p = est.getPointAtLength(len), q = est.getPointAtLength(Math.min(est.getTotalLength(), len + 1));
  const vira = q.x < p.x ? -1 : 1; $('#bicho').setAttribute('transform', `translate(${p.x} ${p.y}) scale(${vira} 1)`); }
function andarAte(reg) {
  const b = $('#bicho'), de = +b.dataset.em, ate = comprimentos[reg]; if (de === ate) return; const t0 = performance.now(), dur = 1400;
  const est = $('#estrada'), viva = $('#estradaViva'); const passo = now => { const k = Math.min(1, (now - t0) / dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, l = de + (ate - de) * e; posBicho(l);
    const a = Math.min(de, l), z = Math.max(de, l); let d = ''; for (let s = a; s <= z; s += 4) { const p = est.getPointAtLength(s); d += (d ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1); } viva.setAttribute('d', d || 'M0 0');
    if (k < 1) requestAnimationFrame(passo); else { b.dataset.em = ate; setTimeout(() => viva.setAttribute('d', 'M0 0'), 1200); } };
  requestAnimationFrame(passo); Som.zumbido(.35, .03);
}
function escolherRegiao(reg, rolar) {
  regSel = regSel === reg && !rolar ? null : reg; andarAte(reg);
  $$('#mapa .no').forEach(n => n.classList.toggle('ativo', n.dataset.reg === reg)); $$('.regiao').forEach(n => n.classList.toggle('ativo', n.dataset.reg === reg)); calRota();
}
function taxaTxt(r) { return r.taxa.tipo === 'fixa' ? `Deslocamento ${brl(r.taxa.valor)}` : `Grátis até ${r.taxa.gratisAte} km de ${esc(r.base)}`; }
function regioesCards() {
  const agora = estouEm().reg;
  $('#regioes').innerHTML = S.regioes.map(r => { const par = agora === r.id ? paradas({ dias: 40 })[0] : proximaParada(r.id);
    const quandoTxt = !par ? 'Sem data marcada ainda' : agora === r.id ? `Aqui até ${dataBR(par.fim)}` : `De ${dataBR(par.ini)} a ${dataBR(par.fim)}`;
    return `<article class="regiao r-${r.id} revela" data-reg="${r.id}"><h3>${esc(r.nome)}${agora === r.id ? '<span class="agora">tô aqui</span>' : ''}</h3><p class="suave">${esc(r.frase)}</p>
      <div class="linha"><span>${ic('cal')} <b>${quandoTxt}</b></span><span>${ic('carro')} ${taxaTxt(r)}</span></div>
      <div class="linha"><span>${cidadesDe(r.id).slice(0, 5).map(c => esc(c[0])).join(' · ')}…</span></div>
      <div><button class="bt peq" data-pedir data-reg="${r.id}">Quero tatuar aqui ${ic('seta')}</button></div></article>`; }).join('');
  $$('.regiao').forEach(el => { el.addEventListener('mouseenter', () => $$('#mapa .no').forEach(n => n.classList.toggle('ativo', n.dataset.reg === el.dataset.reg)));
    el.addEventListener('click', e => { if (!e.target.closest('[data-pedir]')) escolherRegiao(el.dataset.reg); }); });
  observar();
}
function calRota() {
  const ini = somaDias(hoje0(), -new Date(hoje0()).getDay()), dias = Array.from({ length: 42 }, (_, i) => somaDias(ini, i));
  $('#calRota').innerHTML = `<div class="cal-semanas">${['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'].map(d => `<div class="dsem">${d}</div>`).join('')}
    ${dias.map((d, i) => { const r = rotaDe(d), passado = d < hoje0(); const t = DIA_TIPOS[r.reg] + (r.nota ? ' · ' + r.nota : '');
      return `<div class="cal-dia r-${r.reg} ${d === hoje0() ? 'hoje' : ''} ${passado || (regSel && r.reg !== regSel) ? 'apaga' : ''}" style="--i:${i}" title="${esc(dataLonga(d))}: ${esc(t)}"><small>${r.reg === 'folga' ? 'folga' : r.reg === 'evento' ? 'evento' : regiao(r.reg).curto}</small>${new Date(d).getDate()}</div>`; }).join('')}</div>
    <div class="legenda-cores">${['serra', 'poa', 'litoral', 'evento', 'folga'].map(k => `<span class="r-${k}"><i></i>${k === 'serra' ? 'Serra Gaúcha' : k === 'poa' ? 'Porto Alegre' : k === 'litoral' ? 'Litoral SC' : DIA_TIPOS[k]}</span>`).join('')}</div>`;
}

/* ---------- flashes ---------- */
const ROTS = [-2.4, 1.6, -1, 2.2, -1.8, .8, 2.6, -2, 1.2, -.6, 1.9, -1.4];
function cartela() {
  $('#cartela').innerHTML = S.flashes.map((f, i) => { const fora = f.status !== 'disponivel', deOlho = !fora && S.pedidos.some(p => p.flashId === f.id && ['novo', 'orcado'].includes(p.status));
    return `<article class="flash ${fora ? 'fora' : ''} revela" style="--rot:${ROTS[i % ROTS.length]}deg" data-flash="${f.id}" ${fora ? 'aria-disabled="true"' : 'tabindex="0" role="button"'} aria-label="${esc(f.nome)}, ${brl(f.preco)}">
      <span class="fita"></span>${f.unico ? '<span class="unico">ÚNICO</span>' : ''}${flashSVG(f.desenho)}<h3>${esc(f.nome)}</h3>
      <div class="info"><span class="preco">${brl(f.preco)}</span><span>~${f.tamanho} cm</span></div>${deOlho ? '<span class="olhando">👀 tem gente de olho</span>' : ''}
      ${f.status === 'tatuado' ? '<div class="selo"><b>TATUADO</b></div>' : f.status === 'reservado' ? '<div class="selo res"><b>RESERVADO</b></div>' : ''}</article>`; }).join('');
  $$('.flash:not(.fora)').forEach(el => { const vai = e => { if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return; e.preventDefault();
    const r = el.getBoundingClientRect(); Som.descolar(); FX.respingo(r.left + r.width / 2, r.top + r.height / 2, ['#ff3ea5', '#f2c14e', '#20d4ea'], 18); el.classList.add('descola');
    setTimeout(() => { abrirPrancheta({ tipo: 'flash', flashId: el.dataset.flash }, r.left + r.width / 2, r.top + r.height / 2); setTimeout(() => el.classList.remove('descola'), 400); }, 560); };
    el.addEventListener('click', vai); el.addEventListener('keydown', vai); });
  observar();
}
function estilos() {
  $('#listaEstilos').innerHTML = ESTILOS.map(e => { const [d, pb, cor] = MOTIVOS[e.id];
    return `<article class="estilo ${pb} revela" style="--ec:${cor}">${e.premio ? '<span class="premio">🏆 premiado</span>' : ''}${d ? `<div class="motivo">${flashSVG(d)}</div>` : '<span class="letra">Respira</span>'}
      <h3>${esc(e.nome)}</h3><p>${esc(e.txt)}</p></article>`; }).join('');
}

/* ---------- minha tattoo ---------- */
function minhaTattoo(fone) {
  const f = foneNorm(fone), c = S.clientes.find(x => x.fone === f && f), box = $('#minhaTattoo');
  if (!c) { box.innerHTML = `<div class="minha"><h3>Não achei esse número 🐌</h3><p class="suave">Confere se é o mesmo WhatsApp que tu usou com o Japa. Ou manda tua ideia e bora fazer a primeira!</p></div>`; return; }
  const feita = S.sessoes.filter(s => s.clienteId === c.id && s.status === 'feita').sort((a, b) => b.inicio - a.inicio)[0];
  const prox = S.sessoes.filter(s => s.clienteId === c.id && ['marcada', 'confirmada'].includes(s.status) && s.inicio > Date.now()).sort((a, b) => a.inicio - b.inicio)[0];
  const p = feita && pedido(feita.pedidoId); let h = `<div class="minha"><h3>E aí, ${esc(primeiro(c.nome))}!</h3>`;
  if (feita) { const fz = faseCuidado(feita.inicio);
    h += `<p><b>${esc(p?.ideia || 'Tua tattoo')}</b> · ${esc(zonaNome(p?.zona))} · feita ${quando(feita.inicio)}</p>
      <div class="pele" aria-label="Cicatrização ${fz.pct}%"><i></i><span>${fz.pct >= 100 ? 'cicatrizada' : 'cicatrizando ' + fz.pct + '%'}</span></div>
      <p><b class="mao" style="font-size:1.25rem">${esc(fz.t)}</b><br>${esc(fz.txt)}</p>
      <div class="linha-tempo">${CUIDADOS.map(x => `<div class="${x.dia < fz.dia ? 'feito' : x.dia === fz.dia ? 'agora' : ''}"><b>Dia ${x.dia}</b>${esc(x.t.replace(/^Dia \d+: |^Hoje: /, ''))}</div>`).join('')}</div>`;
    setTimeout(() => { const i = $('.pele i'); if (i) i.style.width = Math.max(4, fz.pct) + '%'; }, 60); }
  else h += `<p class="suave">Ainda não tem tattoo feita com o Japa por aqui.</p>`;
  if (prox) h += `<p>${ic('cal')} Próxima sessão: <b>${esc(dataLonga(prox.inicio))}, ${hora(prox.inicio)}</b> em ${esc(prox.cidade)}.</p>`;
  box.innerHTML = h + '</div>';
}

function eventos() {
  const l = S.eventos.filter(e => e.fim >= hoje0()).sort((a, b) => a.ini - b.ini);
  $('#listaEventos').innerHTML = l.length ? l.map(e => `<article class="evento revela"><div class="data"><b>${new Date(e.ini).getDate()}</b><span>${mesNome(e.ini, true)}</span></div>
    <div><h3>${esc(e.nome)}</h3><p>${esc(e.cidade)} · ${esc(e.txt)}</p></div><span class="etq reg r-evento">${e.ini === e.fim ? '1 dia' : (Math.round((e.fim - e.ini) / DIA) + 1) + ' dias'}</span></article>`).join('')
    : '<p class="suave">Nenhum evento marcado agora. Fica de olho no Instagram.</p>';
}

/* ---------- whatsapp (na demonstração: só prévia) ---------- */
function whats(fone, msg) {
  if (!S.exemplo) { open(linkWhats(fone, msg), '_blank', 'noopener'); return; }
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = `<div class="caixa"><button class="fechar" aria-label="Fechar">${ic('x')}</button><h2>Mandar no WhatsApp</h2><div class="whats-previa">${esc(msg)}</div>
    <p class="aviso-demo">Demonstração: aqui abriria o WhatsApp do Japa com a mensagem pronta.</p><button class="bt forte" data-copiar>${ic('copiar')}Copiar mensagem</button></div>`;
  document.body.appendChild(m); const fecha = () => { m.classList.add('sai'); setTimeout(() => m.remove(), 200); };
  m.addEventListener('click', e => { if (e.target === m || e.target.closest('.fechar')) fecha(); if (e.target.closest('[data-copiar]')) { navigator.clipboard?.writeText(msg).then(() => toast('Mensagem copiada'), () => toast('Não deu pra copiar')); } });
}

/* ---------- prancheta: o pedido em passos ---------- */
let P = null, passos = [], ip = 0;
const PASSOS = {
  tipo: { t: 'O que tu quer?', s: 'Escolhe o caminho. Dá pra mudar depois.' },
  corpo: { t: 'Onde no corpo?', s: 'Toca no boneco. Frente e costas.' },
  peca: { t: 'Qual peça?', s: 'O Japa pinta à mão. Tu entrega a peça, ele devolve arte.' },
  tamanho: { t: 'Tamanho e estilo', s: 'Arrasta a régua. A estimativa muda na hora.' },
  ideia: { t: 'Conta a ideia', s: 'Quanto mais detalhe, melhor. Manda referência se tiver.' },
  onde: { t: 'Onde tu tá?', s: 'O Japa vai até você. Escolhe a região e os dias que dá.' },
  contato: { t: 'Pra ele te chamar', s: 'O orçamento chega no teu WhatsApp.' },
};
function montarPassos() {
  passos = P.tipo === 'flash' ? ['corpo', 'onde', 'contato'] : P.tipo === 'customizacao' ? ['tipo', 'peca', 'ideia', 'onde', 'contato'] : ['tipo', 'corpo', 'tamanho', 'ideia', 'onde', 'contato'];
}
function abrirPrancheta(pre = {}, cx, cy) {
  P = { tipo: null, flashId: null, zona: null, vista: 'frente', tamanho: 10, estilo: 'blackwork', cor: false, peca: null, ideia: '', refs: [], reg: null, cidade: '', cidadeOutra: '', endereco: '', datas: [], nome: '', fone: '', insta: '', nasc: '', maior: false, ...pre };
  if (P.tipo === 'flash') { const f = flash(P.flashId); P.estilo = 'oldschool'; P.cor = true; P.tamanho = f.tamanho; P.ideia = 'Flash: ' + f.nome; }
  montarPassos(); ip = P.tipo && P.tipo !== 'flash' ? 1 : 0; if (!P.tipo) ip = 0;
  const pr = $('#prancheta'); const dentro = (v, max) => Math.max(0, Math.min(max, v ?? max / 2)); pr.style.setProperty('--cx', dentro(cx, innerWidth) + 'px'); pr.style.setProperty('--cy', dentro(cy, innerHeight) + 'px');
  pr.hidden = false; pr.classList.remove('sai'); document.body.style.overflow = 'hidden'; Som.zumbido(.5, .04); mostrarPasso();
}
function fecharPrancheta() { const pr = $('#prancheta'); pr.classList.add('sai'); setTimeout(() => { pr.hidden = true; document.body.style.overflow = ''; }, 320); }
function estimativaAtual() { return estimativa({ tipo: P.tipo || 'exclusiva', tamanho: P.tamanho, estilo: P.estilo, cor: P.cor, zona: P.zona, peca: P.peca, flashId: P.flashId }); }
function atualizarEstimativa() {
  const box = $('#prEst'); if (!P.tipo || (P.tipo === 'customizacao' && !P.peca)) { box.innerHTML = '<small>Estimativa</small><span>aparece quando tu escolher</span>'; return; }
  const e = estimativaAtual(), taxa = P.reg ? taxaDeslocamento(P.reg, P.cidade) : null;
  box.innerHTML = `<small>${e.fixo ? 'Preço do flash' : 'Estimativa'}</small><b>${faixa(e)}</b> <span>${e.oficina ? '· peça pintada à mão' : `· ~${String(e.horas).replace('.', ',')}h${e.sessoes > 1 ? ` · ${e.sessoes} sessões` : ''}`}${taxa !== null && P.cidade ? ` · deslocamento ${taxa ? brl(taxa) : 'grátis'}` : ''}</span>`;
}
function mostrarPasso(volta) {
  const id = passos[ip], meta = PASSOS[id], velho = $('#prPasso'), box = velho.cloneNode(false); velho.replaceWith(box); // elemento novo: os cliques não se acumulam
  $('#prTitulo').textContent = meta.t; $('#prSub').textContent = meta.s; box.className = volta ? 'volta' : '';
  box.innerHTML = RENDER[id](); LIGA[id]?.(box);
  $('#prVoltar').style.visibility = ip > 0 ? 'visible' : 'hidden'; $('#prSeguir').innerHTML = ip === passos.length - 1 ? `Mandar pro Japa ${ic('seta')}` : `Seguir ${ic('seta')}`;
  const tr = $('.pr-trilha'), w = tr.clientWidth - 46; $('.pr-caracol').style.left = (passos.length > 1 ? ip / (passos.length - 1) : 0) * w + 'px';
  $('.pr-corpo').scrollTop = 0; atualizarEstimativa(); validar();
}
const RENDER = {
  tipo: () => `<div class="opcoes">${Object.entries(TIPOS).map(([k, t]) => `<button class="opcao ${P.tipo === k ? 'sel' : ''}" data-tipo="${k}">${ic(t.icone)}<b>${esc(t.nome)}</b><span>${esc(t.txt)}</span></button>`).join('')}</div>`,
  corpo: () => { const f = P.flashId && flash(P.flashId);
    return `<div class="corpos"><div class="vista">${corpoSVG('frente', { sel: [P.zona] })}</div><div class="vista">${corpoSVG('costas', { sel: [P.zona] })}</div>
      <div class="escolhido">${f ? flashSVG(f.desenho) + `<span class="suave">${esc(f.nome)} · ~${f.tamanho} cm</span>` : ''}<span class="sten suave" style="font-size:.75rem">Lugar escolhido</span><b id="zonaNome">${P.zona ? esc(zonaNome(P.zona)) : '—'}</b>
      <span class="suave" style="font-size:.88rem">${P.tipo === 'retoque' ? 'Onde tá a tattoo que vai ser retocada ou coberta.' : 'Na dúvida, escolhe o mais perto. O Japa ajusta contigo.'}</span></div></div>`; },
  peca: () => `<div class="opcoes">${PECAS.map(p => `<button class="opcao ${P.peca === p[0] ? 'sel' : ''}" data-peca="${p[0]}"><b>${esc(p[1])}</b><span>${brl(p[2])} a ${brl(p[3])}</span></button>`).join('')}</div>`,
  tamanho: () => `<div class="grupo tamanho"><h4>Tamanho (o lado maior)</h4><div class="tam-txt"><b class="num" id="tamN">${P.tamanho} cm</b><span id="tamRef">${refTamanho(P.tamanho)}</span></div>
      <div class="regua"><i id="tamBar" style="width:${P.tamanho / 47 * 100}%"></i></div><input type="range" id="tam" min="3" max="47" value="${P.tamanho}" aria-label="Tamanho em centímetros"></div>
    <div class="grupo"><h4>Estilo</h4><div class="chips-sel" id="prEstilos">${ESTILOS.map(e => `<button class="${P.estilo === e.id ? 'sel' : ''}" data-estilo="${e.id}">${esc(e.nome)}</button>`).join('')}</div></div>
    <div class="grupo"><h4>Cor</h4><div class="chips-sel" id="cores"><button data-cor="0" class="${!P.cor ? 'sel' : ''}">Preto e cinza</button><button data-cor="1" class="${P.cor ? 'sel' : ''}">Colorida</button></div></div>`,
  ideia: () => `<div class="grupo"><h4>${P.tipo === 'customizacao' ? 'O que tu imagina na peça' : 'A ideia'}</h4><textarea id="ideia" rows="5" placeholder="${P.tipo === 'customizacao' ? 'Ex.: jaqueta jeans com uma caveira e cobras nas costas, bem colorida' : 'Ex.: uma carpa subindo a cachoeira, com flor de cerejeira, puxando pro oriental'}">${esc(P.ideia)}</textarea></div>
    ${P.tipo === 'customizacao' ? `<div class="grupo"><h4>Estilo</h4><div class="chips-sel" id="prEstilos">${ESTILOS.map(e => `<button class="${P.estilo === e.id ? 'sel' : ''}" data-estilo="${e.id}">${esc(e.nome)}</button>`).join('')}</div></div>` : ''}
    <div class="grupo"><h4>Referências (até 3 imagens)</h4><div class="refs" id="refs"></div></div>`,
  onde: () => { const tem = P.reg;
    return `<div class="opcoes">${S.regioes.map(r => `<button class="opcao reg r-${r.id} ${P.reg === r.id ? 'sel' : ''}" data-reg="${r.id}"><b>${esc(r.nome)}</b><span>${taxaTxt(r)}</span></button>`).join('')}</div>
    ${tem ? `<div class="form2" style="margin-top:22px"><label class="campo"><span>Cidade</span><select id="cidade"><option value="">Escolhe…</option>${cidadesDe(P.reg).map(c => `<option ${P.cidade === c[0] ? 'selected' : ''}>${esc(c[0])}</option>`).join('')}<option value="__outra" ${P.cidade === '__outra' ? 'selected' : ''}>Outra cidade</option></select></label>
      <label class="campo" ${P.cidade === '__outra' ? '' : 'hidden'} id="outraBox"><span>Qual cidade?</span><input id="cidadeOutra" value="${esc(P.cidadeOutra)}"></label>
      <label class="campo"><span>Bairro (opcional)</span><input id="endereco" value="${esc(P.endereco)}" placeholder="Só o bairro. O endereço tu passa no WhatsApp."></label></div>
      ${P.tipo === 'customizacao' ? '' : `<div class="grupo" style="margin-top:22px"><h4>Dias que dá pra ti (até 3) · quando o Japa tá em ${esc(regiao(P.reg).curto)}</h4><div class="dias-esc" id="dias">${diasPossiveis().map(d => `<button class="r-${P.reg} ${P.datas.includes(d) ? 'sel' : ''}" data-dia="${d}"><small>${semana(d)}</small><b>${new Date(d).getDate()}</b><span>${mesNome(d, true)}</span></button>`).join('') || '<p class="suave">Sem dia livre por enquanto. Manda mesmo assim: o Japa te avisa quando abrir.</p>'}</div></div>`}` : ''}`; },
  contato: () => { const e = P.tipo ? estimativaAtual() : null;
    return `<div class="form2"><label class="campo"><span>Nome</span><input id="nome" value="${esc(P.nome)}" autocomplete="name"></label><label class="campo"><span>WhatsApp</span><input id="fone" value="${esc(P.fone)}" inputmode="tel" placeholder="(54) 99999-9999" autocomplete="tel"></label>
      <label class="campo"><span>Instagram (opcional)</span><input id="insta" value="${esc(P.insta)}" placeholder="@teu.perfil"></label><label class="campo"><span>Aniversário (opcional)</span><input id="nasc" value="${esc(P.nasc)}" placeholder="dd/mm/aaaa" inputmode="numeric"></label></div>
    <label class="check" style="margin-top:16px"><input type="checkbox" id="maior" ${P.maior ? 'checked' : ''}><span>Tenho 18 anos ou mais (menor de idade, só com o responsável junto e autorização assinada).</span></label>
    <div class="resumo"><div><span>Pedido</span><b>${esc(TIPOS[P.tipo]?.nome || '')}${P.flashId ? ' · ' + esc(flash(P.flashId).nome) : ''}${P.peca ? ' · ' + esc(PECAS.find(p => p[0] === P.peca)[1]) : ''}</b></div>
      ${P.zona ? `<div><span>Lugar</span>${esc(zonaNome(P.zona))}</div>` : ''}${P.tipo !== 'flash' && P.tipo !== 'customizacao' ? `<div><span>Tamanho</span>${P.tamanho} cm · ${esc(estilo(P.estilo).nome)} · ${P.cor ? 'colorida' : 'preto e cinza'}</div>` : ''}
      <div><span>Onde</span>${esc(cidadeFinal())} · ${esc(regiao(P.reg)?.nome || '')}</div>${P.datas.length ? `<div><span>Dias</span>${P.datas.map(d => semana(d) + ' ' + dataBR(d)).join(', ')}</div>` : ''}
      ${e ? `<div><span>Estimativa</span><b>${faixa(e)}</b></div>` : ''}</div>
    <p class="aviso-demo" style="margin-top:14px">O valor final vem do Japa. A estimativa serve pra tu ter uma ideia.</p>`; },
};
const refTamanho = t => t <= 4 ? 'tipo uma moeda' : t <= 7 ? 'uma caixa de fósforo' : t <= 10 ? 'um cartão de crédito' : t <= 14 ? 'a palma da mão' : t <= 18 ? 'um celular' : t <= 24 ? 'um palmo' : t <= 30 ? 'o antebraço inteiro' : t <= 38 ? 'meia costas' : 'fechamento: costas, perna inteira';
const cidadeFinal = () => P.cidade === '__outra' ? P.cidadeOutra : P.cidade;
function diasPossiveis() { const e = estimativaAtual(); return diasNaRegiao(P.reg, { minLivre: Math.min(300, Math.max(120, (e.horas || 2) * 60)) }).slice(0, 21); }
const LIGA = {
  tipo: b => b.addEventListener('click', e => { const o = e.target.closest('[data-tipo]'); if (!o) return;
    // flash sem desenho escolhido: leva pra cartela, onde a pessoa pega o desenho (e a prancheta volta com ele)
    if (o.dataset.tipo === 'flash' && !P.flashId) { fecharPrancheta(); setTimeout(() => { $('#flashes').scrollIntoView({ behavior: 'smooth' }); toast('Escolhe um flash da cartela e toca nele', 'raio'); }, 350); return; }
    P.tipo = o.dataset.tipo; if (P.tipo !== 'flash') P.flashId = null; montarPassos();
    $$('.opcao', b).forEach(x => x.classList.toggle('sel', x === o)); Som.toque(); atualizarEstimativa(); validar(); }),
  corpo: b => { const pega = el => { P.zona = el.dataset.zona; $$('.zona', b).forEach(z => z.classList.toggle('sel', z.dataset.zona === P.zona)); $('#zonaNome').textContent = zonaNome(P.zona);
      const r = el.getBoundingClientRect(); FX.respingo(r.left + r.width / 2, r.top + r.height / 2, ['#ff3ea5', '#20d4ea'], 14); Som.zumbido(.22, .04); atualizarEstimativa(); validar(); };
    b.addEventListener('click', e => { const z = e.target.closest('.zona'); if (z) pega(z); }); b.addEventListener('keydown', e => { const z = e.target.closest('.zona'); if (z && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pega(z); } }); },
  peca: b => b.addEventListener('click', e => { const o = e.target.closest('[data-peca]'); if (!o) return; P.peca = o.dataset.peca; $$('.opcao', b).forEach(x => x.classList.toggle('sel', x === o)); Som.toque(); atualizarEstimativa(); validar(); }),
  tamanho: b => { $('#tam').addEventListener('input', e => { P.tamanho = +e.target.value; $('#tamN').textContent = P.tamanho + ' cm'; $('#tamRef').textContent = refTamanho(P.tamanho); $('#tamBar').style.width = P.tamanho / 47 * 100 + '%'; atualizarEstimativa(); });
    $('#prEstilos').addEventListener('click', e => { const o = e.target.closest('[data-estilo]'); if (!o) return; P.estilo = o.dataset.estilo; if (estilo(P.estilo).cor) P.cor = true; $$('#prEstilos button').forEach(x => x.classList.toggle('sel', x === o)); $$('#cores button').forEach(x => x.classList.toggle('sel', !!+x.dataset.cor === P.cor)); Som.toque(); atualizarEstimativa(); });
    $('#cores').addEventListener('click', e => { const o = e.target.closest('[data-cor]'); if (!o) return; P.cor = !!+o.dataset.cor; $$('#cores button').forEach(x => x.classList.toggle('sel', x === o)); Som.toque(); atualizarEstimativa(); }); },
  ideia: b => { $('#ideia').addEventListener('input', e => { P.ideia = e.target.value; validar(); }); $('#prEstilos')?.addEventListener('click', e => { const o = e.target.closest('[data-estilo]'); if (!o) return; P.estilo = o.dataset.estilo; $$('#prEstilos button').forEach(x => x.classList.toggle('sel', x === o)); });
    desenharRefs(); },
  onde: b => { b.addEventListener('click', e => { const o = e.target.closest('[data-reg]'); if (o) { if (P.reg !== o.dataset.reg) { P.reg = o.dataset.reg; P.cidade = ''; P.datas = []; } Som.toque(); mostrarPasso(); return; }
      const d = e.target.closest('[data-dia]'); if (d) { const v = +d.dataset.dia; if (P.datas.includes(v)) P.datas = P.datas.filter(x => x !== v); else { P.datas.push(v); if (P.datas.length > 3) P.datas.shift(); }
        $$('#dias button').forEach(x => x.classList.toggle('sel', P.datas.includes(+x.dataset.dia))); Som.toque(); } });
    $('#cidade')?.addEventListener('change', e => { P.cidade = e.target.value; $('#outraBox').hidden = P.cidade !== '__outra'; atualizarEstimativa(); validar(); });
    $('#cidadeOutra')?.addEventListener('input', e => { P.cidadeOutra = e.target.value; validar(); }); $('#endereco')?.addEventListener('input', e => { P.endereco = e.target.value; }); },
  contato: b => { for (const k of ['nome', 'fone', 'insta', 'nasc']) $('#' + k).addEventListener('input', e => { P[k] = e.target.value; validar(); }); $('#maior').addEventListener('change', e => { P.maior = e.target.checked; validar(); }); },
};
function desenharRefs() {
  const box = $('#refs'); if (!box) return;
  box.innerHTML = P.refs.map((r, i) => `<div class="ref"><img src="${r}" alt="Referência ${i + 1}"><button data-tira="${i}" aria-label="Tirar">${ic('x')}</button></div>`).join('') + (P.refs.length < 3 ? `<label>${ic('camera')}<br>Adicionar imagem<input type="file" accept="image/*" hidden id="refArq"></label>` : '');
  box.onclick = e => { const t = e.target.closest('[data-tira]'); if (t) { P.refs.splice(+t.dataset.tira, 1); desenharRefs(); } };
  $('#refArq')?.addEventListener('change', e => { const f = e.target.files[0]; if (!f) return; reduzirImagem(f, 520).then(url => { P.refs.push(url); desenharRefs(); Som.toque(); }).catch(() => toast('Não deu pra ler essa imagem', 'alerta')); });
}
function reduzirImagem(arq, max) {
  return new Promise((ok, erro) => { const r = new FileReader(); r.onerror = erro; r.onload = () => { const im = new Image(); im.onerror = erro; im.onload = () => {
    const k = Math.min(1, max / Math.max(im.width, im.height)), cv = document.createElement('canvas'); cv.width = Math.round(im.width * k); cv.height = Math.round(im.height * k);
    cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); ok(cv.toDataURL('image/jpeg', .72)); }; im.src = r.result; }; r.readAsDataURL(arq); });
}
function passoOk() {
  switch (passos[ip]) {
    case 'tipo': return !!P.tipo; case 'corpo': return !!P.zona; case 'peca': return !!P.peca; case 'tamanho': return !!P.estilo;
    case 'ideia': return P.ideia.trim().length >= 5;
    case 'onde': return !!P.reg && !!cidadeFinal()?.trim();
    case 'contato': return P.nome.trim().length >= 2 && soDigitos(P.fone).length >= 10 && P.maior;
  } return true;
}
function validar() { $('#prSeguir').disabled = !passoOk(); }
function seguir() {
  if (!passoOk()) return;
  if (ip < passos.length - 1) { ip++; Som.toque(); mostrarPasso(); return; }
  enviar();
}
function enviar() {
  const cid = cidadeFinal().trim(), c = achaOuCriaCliente({ nome: P.nome, fone: P.fone, insta: P.insta, cidade: cid, reg: P.reg, nascimento: P.nasc });
  if (P.endereco) c.bairro = P.endereco;
  const e = estimativaAtual();
  const p = { id: novoId('p'), clienteId: c.id, tipo: P.tipo, flashId: P.flashId, peca: P.peca, ideia: P.ideia.trim(), estilo: P.estilo, cor: P.cor || estilo(P.estilo).cor, tamanho: P.tipo === 'customizacao' ? 0 : P.tamanho,
    zona: P.zona, reg: P.reg, cidade: cid, endereco: P.endereco, refs: P.refs.slice(), datas: P.datas.slice().sort((a, b) => a - b), origem: 'site', estimativa: e, valor: e.fixo ? e.min : 0, sinal: 0,
    sessoesPrev: e.sessoes, status: 'novo', criadoEm: Date.now(), taxa: taxaDeslocamento(P.reg, cid), hist: [{ ts: Date.now(), txt: 'Pedido enviado pelo site' }] };
  S.pedidos.push(p); avisar('pedido', p.id, `Pedido novo de ${primeiro(c.nome)}`); salvar();
  const box = $('#prPasso'); $('#prTitulo').textContent = ''; $('#prSub').textContent = ''; $('.pr-pe').hidden = true;
  box.innerHTML = `<div class="enviado">${caracolSVG({ anima: true, cls: 'grande' })}<h2 class="mao">Ideia na mão do Japa!</h2>
    <p>Ele responde no teu WhatsApp <b>${esc(foneFmt(c.fone))}</b> com o orçamento${p.tipo === 'customizacao' ? '' : ' e os dias'}. Normalmente em até 24 horas.</p>
    <div class="capa-bts" style="opacity:1;animation:none"><button class="bt" data-whats-pedido>${ic('whats')}Avisar no WhatsApp</button><button class="bt forte" data-fim>Voltar pro site</button></div></div>`;
  FX.carimbo('Ideia enviada', 'o caracol já tá sabendo', 'var(--mag)'); setTimeout(() => { FX.respingo(innerWidth / 2, innerHeight / 2.4, ['#ff3ea5', '#20d4ea', '#d4ff3b'], 40); Som.plim(); }, 300);
  box.querySelector('[data-whats-pedido]').onclick = () => whats(S.artista.fone, `Salve, Japa! Aqui é ${primeiro(c.nome)}. Mandei pelo site uma ideia de ${TIPOS[p.tipo].nome.toLowerCase()}: ${p.ideia}${p.zona ? ' (' + zonaNome(p.zona) + ')' : ''}. Tô em ${cid}. 🐌`);
  box.querySelector('[data-fim]').onclick = () => { fecharPrancheta(); setTimeout(() => { $('.pr-pe').hidden = false; tudo(); }, 340); };
}

/* ---------- geral ---------- */
let obs = null;
function observar() {
  obs = obs || new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); obs.unobserve(e.target); } }), { threshold: 0, rootMargin: '0px 0px 8% 0px' });
  $$('.revela:not(.vis)').forEach(el => obs.observe(el));
}
function tudo() { ondeEstou(); mapa(); regioesCards(); calRota(); cartela(); eventos(); }
function rolagem() {
  let ultimo = 0; const topo = $('#topo');
  addEventListener('scroll', () => { const y = scrollY; topo.classList.toggle('solido', y > 40); topo.classList.toggle('some', y > ultimo && y > 400); ultimo = y;
    const sec = $('#como'), r = sec.getBoundingClientRect(), k = Math.min(1, Math.max(0, (innerHeight - r.top) / (r.height + innerHeight * .4))); const tr = $('.trilho-como'); $('.caracol-como').style.left = k * (tr.clientWidth - 70) + 'px'; }, { passive: true });
}
document.addEventListener('click', e => {
  const p = e.target.closest('[data-pedir]'); if (p) { e.preventDefault(); const pre = {}; if (p.dataset.pedir) pre.tipo = p.dataset.pedir; if (p.dataset.reg) pre.reg = p.dataset.reg; abrirPrancheta(pre, e.clientX, e.clientY); return; }
  if (e.target.closest('[data-whats]')) whats(S.artista.fone, 'Salve, Japa! Vim pelo site. 🐌');
});
$('#prFechar').onclick = fecharPrancheta;
$('#prVoltar').onclick = () => { if (ip > 0) { ip--; mostrarPasso(true); } };
$('#prSeguir').onclick = seguir;
addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#prancheta').hidden) fecharPrancheta(); });
$('#consulta').addEventListener('submit', e => { e.preventDefault(); minhaTattoo($('#consFone').value); });
aoMudar(() => { cartela(); regioesCards(); ondeEstou(); });

montarFixos(); estilos(); tudo(); rabisco(); rolagem(); observar();
// na demonstração: um botão para testar "Minha tattoo" com o número de um cliente de exemplo
if (S.exemplo) { const s = S.sessoes.filter(x => x.status === 'feita').sort((a, b) => b.inicio - a.inicio)[0];
  if (s) { const fone = cliente(s.clienteId).fone; $('#consulta').insertAdjacentHTML('afterend', `<button class="consulta-ex" type="button">Usar um número de exemplo</button>`);
    $('.consulta-ex').onclick = () => { $('#consFone').value = foneFmt(fone); minhaTattoo(fone); }; } }
