/* Japa Oneightwo — painel: navegação, abertura, janelas, ações que várias telas usam
   (cobrar sessão, receber sinal, marcar sessão, WhatsApp) e o atalho ⌘K. Cada tela fica num p-*.js. */
'use strict';
const TELAS = {}, ORDEM = [];
const registrar = (id, t) => { TELAS[id] = t; ORDEM.push(id); };
let telaAtual = null;
const ABAS_CEL = ['role', 'rota', 'rascunhos', 'galera', 'mais'];
const COR_TELA = { role: 'var(--acido)', rota: 'var(--serra)', rascunhos: 'var(--mag)', galera: 'var(--ciano)', flash: 'var(--ouro)', mochila: 'var(--acido)', corre: 'var(--ok)', cicatriza: 'var(--ciano)', bancada: 'var(--texto)' };

/* ---------- navegação ---------- */
function badges() { return { rascunhos: S.pedidos.filter(p => p.status === 'novo').length, cicatriza: paraCuidar().filter(x => !x.enviado).length, mochila: S.mochila.filter(m => m.qtd < m.min).length }; }
function desenharNav() {
  const b = badges();
  $('#nav').innerHTML = ORDEM.map(id => { const t = TELAS[id]; return `<button data-ir="${id}" class="${telaAtual === id ? 'ativo' : ''}">${ic(t.icone)}<span><b>${esc(t.nome)}</b><small>${esc(t.comum)}</small></span>${b[id] ? `<span class="badge ${id === 'mochila' ? 'ok' : ''}">${b[id]}</span>` : ''}</button>`; }).join('');
  $('#abas').innerHTML = ABAS_CEL.map(id => id === 'mais' ? `<button data-mais>${ic('menu')}Mais</button>` : `<button data-ir="${id}" class="${telaAtual === id ? 'ativo' : ''}">${ic(TELAS[id].icone)}${esc(TELAS[id].nome)}${b[id] ? `<span class="badge">${b[id]}</span>` : ''}</button>`).join('');
  const r = estouEm(), reg = regiao(r.reg); const chip = $('#hojeChip'); chip.className = 'hoje-chip r-' + r.reg;
  chip.innerHTML = `<i></i>Hoje: ${esc(reg ? reg.curto : DIA_TIPOS[r.reg])}`;
  document.title = (b.rascunhos ? `(${b.rascunhos}) ` : '') + 'Japa Oneightwo · painel';
}
function ir(id, { semCortina = false, arg } = {}) {
  if (!TELAS[id]) id = 'role';
  const troca = () => { telaAtual = id; const t = TELAS[id]; $('#cabTitulo').textContent = t.nome; $('#cabComum').textContent = t.comum;
    const el = telaNova(true); t.render(el, arg); desenharNav(); scrollTo({ top: 0, behavior: 'instant' });
    if (location.hash !== '#' + id) history.replaceState(null, '', '#' + id); };
  if (semCortina || telaAtual === id || matchMedia('(prefers-reduced-motion: reduce)').matches) { troca(); return; }
  const c = $('#cortina'); c.style.setProperty('--cc', COR_TELA[id] || 'var(--mag)');
  c.innerHTML = Array.from({ length: 9 }, (_, k) => `<i style="--k:${[3, 0, 5, 2, 7, 1, 6, 4, 8][k]}"></i>`).join(''); c.classList.remove('vai'); void c.offsetWidth; c.classList.add('vai');
  setTimeout(troca, 300); setTimeout(() => c.classList.remove('vai'), 900);
}
// cada desenho usa um elemento novo: assim os cliques não se acumulam entre um desenho e outro
function telaNova(anima) { const v = $('#tela'), el = v.cloneNode(false); el.removeAttribute('style'); if (!anima) el.style.animation = 'none'; v.replaceWith(el); return el; }
const atualizar = () => { if (telaAtual) { const y = scrollY; TELAS[telaAtual].render(telaNova(false)); scrollTo({ top: y, behavior: 'instant' }); } desenharNav(); };
function salvarE(fn) { salvar(); atualizar(); fn?.(); }

/* ---------- janelas ---------- */
function janela(html, { larga = false, aoFechar } = {}) {
  const m = document.createElement('div'); m.className = 'modal' + (larga ? ' larga' : ''); m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
  m.innerHTML = `<div class="caixa"><button class="fechar" aria-label="Fechar">${ic('x')}</button>${html}</div>`; document.body.appendChild(m);
  const fechar = () => { if (!m.isConnected) return; m.classList.add('sai'); setTimeout(() => m.remove(), 200); document.removeEventListener('keydown', esc_); aoFechar?.(); };
  const esc_ = e => { if (e.key === 'Escape' && document.querySelectorAll('.modal').length && [...document.querySelectorAll('.modal')].pop() === m) fechar(); };
  document.addEventListener('keydown', esc_);
  m.addEventListener('click', e => { if (e.target === m || e.target.closest('.fechar')) fechar(); });
  setTimeout(() => m.querySelector('input:not([type=checkbox]):not([type=range]), select, textarea')?.focus(), 80);
  return { el: m, fechar, $: s => m.querySelector(s) };
}
function pergunta(txt, { sim = 'Sim', perigo = false } = {}) {
  return new Promise(ok => { const j = janela(`<h2>${esc(txt)}</h2><div class="bts" style="margin-top:18px"><button class="bt ${perigo ? 'tinta' : 'forte'}" data-s>${esc(sim)}</button><button class="bt leve" data-n>Cancelar</button></div>`, { aoFechar: () => ok(false) });
    j.$('[data-s]').onclick = () => { ok(true); j.fechar(); }; j.$('[data-n]').onclick = () => j.fechar(); });
}
function whatsPara(c, msg, aoMandar) {
  if (!S.exemplo) { open(linkWhats(c.fone, msg), '_blank', 'noopener'); aoMandar?.(); return; }
  const j = janela(`<h2>WhatsApp pra ${esc(primeiro(c.nome))}</h2><p class="suave" style="margin-top:-4px">${esc(foneFmt(c.fone))}</p>
    <textarea id="wMsg" rows="6">${esc(msg)}</textarea><p class="suave" style="font-size:.85rem">Demonstração: os números são inventados, então aqui só dá pra ver e copiar. Na versão de verdade abre o WhatsApp com a mensagem pronta.</p>
    <div class="bts"><button class="bt forte" data-m>${ic('whats')}Marcar como mandada</button><button class="bt" data-c>${ic('copiar')}Copiar</button></div>`);
  j.$('[data-c]').onclick = () => navigator.clipboard?.writeText(j.$('#wMsg').value).then(() => toast('Copiado'), () => toast('Não deu pra copiar', 'alerta'));
  j.$('[data-m]').onclick = () => { j.fechar(); aoMandar?.(); toast('Mensagem mandada', 'whats'); };
}
const regEtq = reg => `<span class="etq reg r-${reg}">${esc(regiao(reg)?.curto || DIA_TIPOS[reg] || reg)}</span>`;
const avatar = (c, g) => `<span class="ava r-${c?.reg || 'serra'} ${g ? 'g' : ''}">${esc((c?.nome || '?').split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase())}</span>`;
const vazio = txt => `<div class="vazio">${caracolSVG({ concha: 'var(--linha2)', corpo: 'var(--cartao2)', traco: 'var(--apagado)' })}<span>${esc(txt)}</span></div>`;
const stTxt = { marcada: 'marcada', confirmada: 'confirmada', feita: 'feita', cancelada: 'cancelada', faltou: 'faltou' };
const mapaLink = (end, cid) => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent([end, cid].filter(Boolean).join(', '));
function dadosMsg(c, extra = {}) { return { nome: primeiro(c.nome), ...extra }; }

/* ---------- ações que várias telas usam ---------- */
function cobrarSessao(s) {
  const c = cliente(s.clienteId), p = pedido(s.pedidoId), feitas = sessoesDoPedido(p.id).filter(x => x.status === 'feita').length, ultima = feitas + 1 >= (p.sessoesPrev || 1);
  const j = janela(`<h2>Finalizar a sessão</h2><p class="suave" style="margin-top:-4px">${esc(c.nome)} · ${esc(p.ideia)}</p>
    <div class="form"><div class="linha2"><label class="campo"><span>Valor da sessão</span><input id="cV" inputmode="decimal" value="${s.valor}"></label><label class="campo"><span>Deslocamento</span><input id="cT" inputmode="decimal" value="${s.taxa || 0}"></label></div>
    <div class="campo"><span>Forma</span><div class="seg" id="cF">${['pix', 'dinheiro', 'cartao'].map((f, i) => `<button data-f="${f}" class="${i ? '' : 'sel'}">${f === 'cartao' ? 'cartão' : f}</button>`).join('')}</div></div>
    <p class="suave" style="margin:0">Sinal já recebido: ${brl(p.sinal)} · Total do projeto: ${brl(p.valor)}${p.sessoesPrev > 1 ? ` · sessão ${feitas + 1} de ${p.sessoesPrev}` : ''}</p>
    <label class="check"><input type="checkbox" id="cC" checked><span>Mandar os cuidados do dia 0 no WhatsApp</span></label>
    <button class="bt forte" id="cOk">${ic('check')}Tatuado! Receber ${brl(s.valor + (s.taxa || 0))}</button></div>`);
  let forma = 'pix'; const total = () => num(j.$('#cV').value) + num(j.$('#cT').value);
  j.el.addEventListener('input', () => j.$('#cOk').innerHTML = `${ic('check')}Tatuado! Receber ${brl(total())}`);
  j.$('#cF').onclick = e => { const b = e.target.closest('[data-f]'); if (!b) return; forma = b.dataset.f; $$('#cF button', j.el).forEach(x => x.classList.toggle('sel', x === b)); };
  j.$('#cOk').onclick = () => {
    const v = num(j.$('#cV').value), t = num(j.$('#cT').value), manda = j.$('#cC').checked;
    if (v > 0) lancar({ tipo: 'entrada', cat: p.tipo === 'flash' ? 'flash' : 'sessao', valor: v, forma, clienteId: c.id, pedidoId: p.id, desc: (p.tipo === 'flash' ? 'Flash ' + (flash(p.flashId)?.nome || '') : 'Sessão') + ' · ' + primeiro(c.nome) });
    if (t > 0) lancar({ tipo: 'entrada', cat: 'deslocamento', valor: t, forma, clienteId: c.id, pedidoId: p.id, desc: 'Deslocamento · ' + s.cidade });
    s.status = 'feita'; s.pago = true; s.valor = v; s.taxa = t; s.feitaEm = Date.now();
    if (ultima) { p.status = 'feito'; p.feitoEm = Date.now(); const f = p.flashId && flash(p.flashId); if (f && f.unico) f.status = 'tatuado'; else if (f) f.status = 'disponivel'; }
    (p.hist = p.hist || []).push({ ts: Date.now(), txt: `Sessão feita · ${brl(v + t)}` });
    j.fechar(); salvarE(); FX.carimbo('Tatuado!', ultima ? 'mais uma pele com arte' : `sessão ${feitas + 1} de ${p.sessoesPrev}`, 'var(--acido)');
    setTimeout(() => { FX.respingo(innerWidth / 2, innerHeight / 2, ['#d4ff3b', '#ff3ea5', '#20d4ea'], 44); Som.plim(4); }, 300);
    if (manda) setTimeout(() => whatsPara(c, preencher(S.mensagens.cuidado, dadosMsg(c, { fase: 'Hoje é o dia 0', dica: CUIDADOS[0].txt })), () => { S.cuidadosEnviados[s.id + ':0'] = Date.now(); salvarE(); }), 1500);
  };
}
function receberSinal(p, depois) {
  const c = cliente(p.clienteId), sugerido = p.sinal || sinalDe(p.valor || p.estimativa?.max || S.config.minimo);
  const j = janela(`<h2>Recebi o sinal</h2><p class="suave" style="margin-top:-4px">${esc(c.nome)} · ${esc(p.ideia)}</p>
    <div class="form"><label class="campo"><span>Valor do sinal</span><input id="sV" inputmode="decimal" value="${sugerido}"></label>
    <div class="campo"><span>Forma</span><div class="seg" id="sF">${['pix', 'dinheiro', 'cartao'].map((f, i) => `<button data-f="${f}" class="${i ? '' : 'sel'}">${f === 'cartao' ? 'cartão' : f}</button>`).join('')}</div></div>
    <button class="bt forte" id="sOk">${ic('check')}Lançar sinal</button></div>`);
  let forma = 'pix'; j.$('#sF').onclick = e => { const b = e.target.closest('[data-f]'); if (!b) return; forma = b.dataset.f; $$('#sF button', j.el).forEach(x => x.classList.toggle('sel', x === b)); };
  j.$('#sOk').onclick = () => { const v = num(j.$('#sV').value); if (v <= 0) { toast('Valor do sinal?', 'alerta'); return; }
    lancar({ tipo: 'entrada', cat: 'sinal', valor: v, forma, clienteId: c.id, pedidoId: p.id, desc: 'Sinal · ' + primeiro(c.nome) });
    p.sinal = v; p.sinalEm = Date.now(); if (p.status === 'novo' || p.status === 'orcado') p.status = 'sinal'; (p.hist = p.hist || []).push({ ts: Date.now(), txt: 'Sinal recebido · ' + brl(v) });
    const f = p.flashId && flash(p.flashId); if (f && f.status === 'disponivel') f.status = 'reservado';
    j.fechar(); salvarE(); FX.carimbo('Sinal pago', brl(v) + ' no bolso', 'var(--ok)'); Som.plim(); depois?.(); };
}
function marcarSessao(p, { dia: diaPre, depois } = {}) {
  const c = cliente(p.clienteId), dur0 = p.tipo === 'flash' ? (flash(p.flashId)?.horas || 2) * 60 : Math.min(330, Math.round((p.estimativa?.horas || 3) / (p.sessoesPrev || 1) * 2) * 30) || 180;
  const dias = [...new Set([...(p.datas || []).filter(d => d > Date.now() - DIA), ...diasNaRegiao(p.reg, { minLivre: Math.min(dur0, 240) }).slice(0, 14)])].sort((a, b) => a - b).slice(0, 18);
  let dia = diaPre || dias[0];
  const j = janela(`<h2>Marcar sessão</h2><p class="suave" style="margin-top:-4px">${esc(c.nome)} · ${esc(p.cidade)} ${regEtq(p.reg)}</p>
    <div class="form"><div class="campo"><span>Dia (tracejado = o cliente pediu)</span><div class="dias-mini" id="mD">${dias.map(d => `<button class="r-${rotaDe(d).reg} ${(p.datas || []).includes(d) ? 'pref' : ''} ${d === dia ? 'sel' : ''}" data-d="${d}"><small>${semana(d)}</small>${dataBR(d)}</button>`).join('') || '<span class="suave">Sem dia na região. Pinta uns dias na Rota.</span>'}</div></div>
    <div class="linha2"><label class="campo"><span>Hora</span><input id="mH" type="time" value="${hmTxt(S.config.horaInicio * 60 + 60)}" step="900"></label><label class="campo"><span>Duração (min)</span><input id="mM" type="number" step="30" value="${dur0}"></label></div>
    <div class="linha2"><label class="campo"><span>Endereço</span><input id="mE" value="${esc(p.endereco || c.endereco || '')}"></label><label class="campo"><span>Valor desta sessão</span><input id="mV" inputmode="decimal" value="${Math.max(0, Math.round(((p.valor || 0) - (p.sinal || 0)) / Math.max(1, (p.sessoesPrev || 1) - sessoesDoPedido(p.id).filter(s => s.status === 'feita').length)))}"></label></div>
    <label class="check"><input type="checkbox" id="mW" checked><span>Mandar a confirmação no WhatsApp</span></label>
    <button class="bt forte" id="mOk">${ic('cal')}Marcar</button></div>`);
  j.$('#mD').onclick = e => { const b = e.target.closest('[data-d]'); if (!b) return; dia = +b.dataset.d; $$('#mD button', j.el).forEach(x => x.classList.toggle('sel', x === b)); };
  j.$('#mOk').onclick = () => { if (!dia) { toast('Escolhe um dia', 'alerta'); return; }
    const [h, m] = j.$('#mH').value.split(':').map(Number), ini = dia0(dia) + (h * 60 + m) * MIN, dur = num(j.$('#mM').value) || 120;
    const s = { id: novoId('s'), pedidoId: p.id, clienteId: c.id, inicio: ini, duracao: dur, status: 'marcada', valor: num(j.$('#mV').value), taxa: p.taxa ?? taxaDeslocamento(p.reg, p.cidade) /* cada sessão a domicílio é uma viagem: o deslocamento vale por visita */, pago: false, cidade: p.cidade, reg: p.reg, endereco: j.$('#mE').value, km: kmDe(p.reg, p.cidade) };
    S.sessoes.push(s); p.status = 'agendado'; p.endereco = s.endereco; (p.hist = p.hist || []).push({ ts: Date.now(), txt: 'Sessão marcada pra ' + dataBR(ini) });
    const r = rotaDe(ini); if (r.auto) S.rota.push({ dia: dia0(ini), reg: p.reg });
    const manda = j.$('#mW').checked; j.fechar(); salvarE(); FX.carimbo('Marcado', dataLonga(ini), 'var(--ciano)'); Som.plim(2); depois?.();
    if (manda) setTimeout(() => whatsPara(c, preencher(S.mensagens.confirmacao, dadosMsg(c, { data: dataLonga(ini), hora: hora(ini), cidade: p.cidade }))), 1300); };
}
function acoesSessao(s) {
  const c = cliente(s.clienteId), p = pedido(s.pedidoId), futura = s.status === 'marcada' || s.status === 'confirmada';
  const j = janela(`<h2>${esc(c.nome)}</h2><p class="suave" style="margin-top:-4px">${esc(dataLonga(s.inicio))}, ${hora(s.inicio)} · ${duracaoTxt(s.duracao)} <span class="st ${s.status}">${stTxt[s.status]}</span></p>
    <dl class="dl"><dt>Tattoo</dt><dd>${esc(p?.ideia || '')}</dd><dt>Lugar</dt><dd>${esc(zonaNome(p?.zona))}</dd><dt>Onde</dt><dd>${esc(s.endereco || '')} · ${esc(s.cidade)} ${regEtq(s.reg)}</dd><dt>A receber</dt><dd>${brl(s.valor)}${s.taxa ? ' + ' + brl(s.taxa) + ' deslocamento' : ''}</dd></dl>
    ${c.ficha?.alergias ? `<div class="alerta-linha">${ic('alerta')}Alergia: ${esc(c.ficha.alergias)}</div>` : ''}
    <div class="bts" style="margin-top:14px">${futura ? `<button class="bt forte" data-a="cobrar">${ic('check')}Finalizar e cobrar</button>${s.status === 'marcada' ? `<button class="bt" data-a="confirmar">${ic('whats')}Confirmar</button>` : ''}<button class="bt" data-a="lembrar">${ic('relogio')}Lembrete</button>
      <a class="bt" target="_blank" rel="noopener" href="${mapaLink(s.endereco, s.cidade)}">${ic('pin')}Mapa</a><button class="bt leve" data-a="faltou">Faltou</button><button class="bt leve" data-a="cancelar">Desmarcar</button>` : ''}
      <button class="bt leve" data-a="ficha">${ic('galera')}Ficha</button></div>`);
  j.el.addEventListener('click', async e => { const a = e.target.closest('[data-a]')?.dataset.a; if (!a) return;
    if (a === 'cobrar') { j.fechar(); cobrarSessao(s); }
    if (a === 'confirmar') whatsPara(c, preencher(S.mensagens.confirmacao, dadosMsg(c, { data: dataLonga(s.inicio), hora: hora(s.inicio), cidade: s.cidade })), () => { s.status = 'confirmada'; j.fechar(); salvarE(); });
    if (a === 'lembrar') whatsPara(c, preencher(S.mensagens.lembrete, dadosMsg(c, { hora: hora(s.inicio), cidade: s.cidade })));
    if (a === 'faltou' && await pergunta(`${primeiro(c.nome)} faltou?`, { sim: 'Faltou' })) { s.status = 'faltou'; if (p) { p.status = 'sinal'; } j.fechar(); salvarE(() => toast('Marcado como falta. O sinal fica de crédito ou não: tu decide.')); }
    if (a === 'cancelar' && await pergunta('Desmarcar essa sessão?', { sim: 'Desmarcar', perigo: true })) { s.status = 'cancelada'; if (p && !sessoesDoPedido(p.id).some(x => ['marcada', 'confirmada'].includes(x.status))) p.status = p.sinal ? 'sinal' : 'orcado'; j.fechar(); salvarE(() => toast('Sessão desmarcada')); }
    if (a === 'ficha') { j.fechar(); abrirFicha(c.id); } });
}
// quem tá cicatrizando e que mensagem toca hoje
function paraCuidar() {
  const out = [];
  for (const s of S.sessoes) { if (s.status !== 'feita') continue; const d = -diasAte(s.inicio); if (d > 31) continue; const fz = faseCuidado(s.inicio);
    out.push({ s, fz, dias: d, enviado: !!S.cuidadosEnviados[s.id + ':' + fz.dia] }); }
  return out.sort((a, b) => a.enviado - b.enviado || a.dias - b.dias);
}

/* ---------- novidades vindas do site ---------- */
function avisosNovos() {
  const nov = S.novidades.filter(n => !n.visto && n.tipo === 'pedido'); if (!nov.length) return;
  const n = nov[0], p = pedido(n.ref); if (!p) return;
  const vistos = JSON.parse(sessionStorage.getItem('japa-avisados') || '[]'); if (vistos.includes(n.id)) return;
  vistos.push(n.id); sessionStorage.setItem('japa-avisados', JSON.stringify(vistos));
  Som.plim(7); toast(`${n.txt}: ${p.ideia.slice(0, 40)}`, 'raio'); FX.respingo(innerWidth - 60, 60, ['#ff3ea5', '#d4ff3b'], 22);
}

/* ---------- atalho ⌘K ---------- */
function atalho() {
  if ($('.atalho')) return;
  const el = document.createElement('div'); el.className = 'atalho'; el.innerHTML = `<div class="caixa"><input placeholder="Cliente, tela ou ação…" aria-label="Buscar"><div class="res"></div></div>`; document.body.appendChild(el);
  const inp = el.querySelector('input'), res = el.querySelector('.res'); let itens = [], sel = 0;
  const acoes = [...ORDEM.map(id => ({ t: TELAS[id].nome + ' · ' + TELAS[id].comum, i: TELAS[id].icone, d: 'tela', f: () => ir(id) })),
    { t: 'Lançar entrada ou saída', i: 'grana', d: 'ação', f: () => { ir('corre'); setTimeout(() => novoLancamento(), 700); } },
    { t: 'Conferir a mochila', i: 'mochila', d: 'ação', f: () => ir('mochila') }, { t: 'Novo flash', i: 'raio', d: 'ação', f: () => { ir('flash'); setTimeout(() => editarFlash(), 700); } },
    { t: 'Abrir o site', i: 'olho', d: 'ação', f: () => open('index.html', '_blank') }];
  const fecha = () => el.remove();
  const desenha = () => { const q = inp.value.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const cli = q.length > 1 ? S.clientes.filter(c => (c.nome + ' ' + c.cidade + ' ' + c.insta).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q)).slice(0, 6).map(c => ({ t: c.nome, i: 'galera', d: c.cidade, f: () => abrirFicha(c.id) })) : [];
    itens = [...cli, ...acoes.filter(a => !q || a.t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q))]; sel = 0;
    res.innerHTML = itens.map((x, i) => `<button data-i="${i}" class="${i === sel ? 'sel' : ''}">${ic(x.i)}<span>${esc(x.t)}</span><small>${esc(x.d)}</small></button>`).join('') || '<p class="suave" style="padding:10px">Nada por aqui.</p>'; };
  inp.addEventListener('input', desenha);
  inp.addEventListener('keydown', e => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + itens.length) % itens.length; $$('button', res).forEach((b, i) => b.classList.toggle('sel', i === sel)); }
    if (e.key === 'Enter' && itens[sel]) { fecha(); itens[sel].f(); } if (e.key === 'Escape') fecha(); });
  res.addEventListener('click', e => { const b = e.target.closest('[data-i]'); if (b) { fecha(); itens[+b.dataset.i].f(); } });
  el.addEventListener('click', e => { if (e.target === el) fecha(); }); desenha(); inp.focus();
}

/* ---------- abertura: ligar a máquina ---------- */
function abertura(depois) {
  if (sessionStorage.getItem('japa-abertura')) { depois(); return; }
  const a = $('#abertura'); a.hidden = false; $('#abLogo').innerHTML = logoSVG(); $('#abLogo').classList.add('parado');
  const sai = () => { sessionStorage.setItem('japa-abertura', '1'); a.classList.add('some'); setTimeout(() => { a.hidden = true; }, 950); depois(); };
  $('#abPular').onclick = sai;
  $('#abLigar').onclick = () => { $('#abLigar').style.visibility = 'hidden'; $('#abPular').hidden = true; $('#abLogo').classList.remove('parado'); $('#abLogo').innerHTML = logoSVG({ anima: true });
    a.classList.add('liga'); Som.zumbido(2.1, .07); setTimeout(() => { a.classList.remove('liga'); FX.respingo(innerWidth / 2, innerHeight / 2, ['#ff3ea5', '#20d4ea', '#d4ff3b', '#f2ede4'], 60); Som.carimbo(); }, 2050); setTimeout(sai, 2700); };
}

/* ---------- tema e som ---------- */
function temaSom() {
  const t = (() => { try { return localStorage.getItem('japa-tema'); } catch (e) { return null; } })(); if (t) document.documentElement.dataset.tema = t;
  const pinta = () => { const claro = document.documentElement.dataset.tema === 'claro'; $('#btTema').innerHTML = ic(claro ? 'lua' : 'sol'); $('#btSom').innerHTML = ic(Som.ligado ? 'som' : 'mudo'); };
  $('#btTema').onclick = () => { const claro = document.documentElement.dataset.tema !== 'claro'; document.documentElement.dataset.tema = claro ? 'claro' : 'escuro'; try { localStorage.setItem('japa-tema', claro ? 'claro' : 'escuro'); } catch (e) { } pinta(); };
  $('#btSom').onclick = () => { Som.ligado = !Som.ligado; pinta(); if (Som.ligado) Som.toque(); }; pinta();
}

function iniciarPainel() {
  carregar(); temaSom(); $('#ladoLogo').innerHTML = logoSVG();
  document.addEventListener('click', e => { const b = e.target.closest('[data-ir]'); if (b) { e.preventDefault(); ir(b.dataset.ir); return; }
    if (e.target.closest('[data-mais]')) { const j = janela(`<h2>Mais telas</h2><div class="lista">${ORDEM.filter(id => !ABAS_CEL.includes(id)).map(id => `<button class="item" data-ir="${id}">${ic(TELAS[id].icone)}<span class="meio"><b>${esc(TELAS[id].nome)}</b><span>${esc(TELAS[id].comum)}</span></span></button>`).join('')}</div>`); j.el.addEventListener('click', e2 => { if (e2.target.closest('[data-ir]')) j.fechar(); }); } });
  addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); atalho(); } });
  $('#btAtalho').onclick = atalho;
  aoMudar(() => { atualizar(); avisosNovos(); });
  abertura(() => { ir(location.hash.slice(1) || 'role', { semCortina: true }); setTimeout(avisosNovos, 900); });
  addEventListener('hashchange', () => { const id = location.hash.slice(1); if (id && id !== telaAtual) ir(id); });
}
