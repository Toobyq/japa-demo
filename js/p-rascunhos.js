/* Rascunhos · Pedidos — o quadro: Chegou → Orçado → Sinal pago → Agendado → Tatuado.
   Arrastar um cartão para a próxima coluna faz a ação certa (mandar orçamento, receber sinal, marcar). */
'use strict';
let filtroReg = '';
registrar('rascunhos', { nome: 'Rascunhos', comum: 'Pedidos e orçamentos', icone: 'lapis', render(el) {
  if (S.novidades.some(n => n.tipo === 'pedido' && !n.visto)) { for (const n of S.novidades) if (n.tipo === 'pedido') n.visto = true; salvar(); }
  const vis = p => !filtroReg || p.reg === filtroReg;
  const lim = Date.now() - 21 * DIA;
  el.innerHTML = `<div class="busca-bar"><div class="seg" id="fReg"><button class="${!filtroReg ? 'sel' : ''}" data-f="">Todas</button>${S.regioes.map(r => `<button class="reg r-${r.id} ${filtroReg === r.id ? 'sel' : ''}" data-f="${r.id}">${esc(r.curto)}</button>`).join('')}</div>
    <span class="suave" style="font-size:.88rem">Arrasta o cartão pra próxima coluna, ou toca nele.</span></div>
  <div class="kanban">${ETAPAS.map(([id, nome]) => { let l = S.pedidos.filter(p => p.status === id && vis(p));
    if (id === 'feito') l = l.filter(p => (p.feitoEm || sessoesDoPedido(p.id).slice(-1)[0]?.inicio || p.criadoEm) > lim);
    l.sort((a, b) => id === 'agendado' ? (proxSessao(a)?.inicio || 9e15) - (proxSessao(b)?.inicio || 9e15) : b.criadoEm - a.criadoEm);
    return `<section class="coluna" data-col="${id}"><h3><span>${esc(nome)}</span><span>${l.length}</span></h3><div class="cards">${l.map(cartaoPedido).join('') || `<p class="suave" style="font-size:.85rem;padding:6px">${id === 'feito' ? 'Nada nas últimas 3 semanas.' : 'Vazio.'}</p>`}</div></section>`; }).join('')}</div>`;
  $('#fReg').onclick = e => { const b = e.target.closest('[data-f]'); if (!b) return; filtroReg = b.dataset.f; atualizar(); };
  let arrastado = null;
  el.addEventListener('dragstart', e => { const c = e.target.closest('.pcard'); if (!c) return; arrastado = c.dataset.pedido; c.classList.add('arrasta'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', arrastado); });
  el.addEventListener('dragend', e => { e.target.closest?.('.pcard')?.classList.remove('arrasta'); $$('.coluna', el).forEach(x => x.classList.remove('sobre')); });
  $$('.coluna', el).forEach(col => { col.addEventListener('dragover', e => { e.preventDefault(); col.classList.add('sobre'); }); col.addEventListener('dragleave', () => col.classList.remove('sobre'));
    col.addEventListener('drop', e => { e.preventDefault(); col.classList.remove('sobre'); const p = pedido(arrastado || e.dataTransfer.getData('text/plain')); if (p) moverPara(p, col.dataset.col); arrastado = null; }); });
  el.addEventListener('click', e => { const c = e.target.closest('.pcard'); if (c) abrirPedido(c.dataset.pedido); });
} });
const proxSessao = p => sessoesDoPedido(p.id).find(s => ['marcada', 'confirmada'].includes(s.status));
function cartaoPedido(p) {
  const c = cliente(p.clienteId), s = proxSessao(p), val = p.valor ? brl(p.valor) : p.estimativa ? '~' + brl(p.estimativa.min) : '';
  const quanto = p.status === 'novo' ? quando(p.criadoEm) : s ? `${ic('cal')} ${semana(s.inicio)} ${dataBR(s.inicio)}` : p.tipo === 'customizacao' && p.entrega ? `entrega ${dataBR(p.entrega)}` : '';
  return `<button class="pcard r-${p.reg}" draggable="true" data-pedido="${p.id}"><div class="topo-c"><b>${esc(c.nome)}</b>${p.status === 'novo' && p.origem === 'site' && Date.now() - p.criadoEm < 2 * DIA ? '<span class="novo-dot" title="Chegou pelo site"></span>' : ic(TIPOS[p.tipo]?.icone || 'lapis')}</div>
    <p>${esc(p.ideia)}</p>${p.refs?.length ? `<div class="refmini">${p.refs.slice(0, 3).map(r => `<img src="${r}" alt="">`).join('')}</div>` : ''}
    <div class="pe-c"><span class="val">${val}</span><span>${quanto}</span>${regEtq(p.reg)}</div>
    ${p.tipo === 'customizacao' && p.status === 'agendado' ? `<div class="barra"><i style="width:${p.progresso || 0}%"></i></div>` : ''}</button>`;
}
function moverPara(p, alvo) {
  if (alvo === p.status) return; const ord = ETAPAS.map(e => e[0]), de = ord.indexOf(p.status), para = ord.indexOf(alvo);
  if (para !== de + 1) { toast('Uma etapa de cada vez. Abre o cartão pra ver as opções.', 'alerta'); return; }
  if (alvo === 'orcado') mandarOrcamento(p);
  else if (alvo === 'sinal') receberSinal(p);
  else if (alvo === 'agendado') p.tipo === 'customizacao' ? (p.status = 'agendado', p.progresso = 0, salvarE(() => toast('Peça na bancada!'))) : marcarSessao(p);
  else if (alvo === 'feito') { const s = proxSessao(p); if (s) cobrarSessao(s); else if (p.tipo === 'customizacao') entregarPeca(p); else toast('Sem sessão marcada.', 'alerta'); }
}
function mandarOrcamento(p, depois) {
  const c = cliente(p.clienteId), e = p.estimativa || estimativa(p), valor0 = p.valor || arred((e.min + e.max) / 2, 50);
  const j = janela(`<h2>Orçamento</h2><p class="suave" style="margin-top:-4px">${esc(c.nome)} · estimativa do site: ${faixa(e)}</p>
    <div class="form"><div class="linha3"><label class="campo"><span>Valor</span><input id="oV" inputmode="decimal" value="${valor0}"></label><label class="campo"><span>Sessões</span><input id="oS" type="number" min="1" value="${p.sessoesPrev || e.sessoes || 1}" ${p.tipo === 'customizacao' ? 'disabled' : ''}></label><label class="campo"><span>Sinal</span><input id="oSi" inputmode="decimal" value="${sinalDe(valor0)}"></label></div>
    <label class="campo"><span>Mensagem</span><textarea id="oM" rows="6"></textarea></label><button class="bt forte" id="oOk">${ic('whats')}Mandar orçamento</button></div>`, { larga: true });
  const msg = () => { const v = num(j.$('#oV').value), n = +j.$('#oS').value || 1, dias = (p.datas?.length ? p.datas : diasNaRegiao(p.reg).slice(0, 3)).map(d => semana(d) + ' ' + dataBR(d)).join(', ');
    return preencher(S.mensagens.orcamento, dadosMsg(c, { ideia: p.ideia, local: p.zona ? zonaNome(p.zona).toLowerCase() : 'na peça', valor: brl(v), sessoes: p.tipo === 'customizacao' ? 'peça pintada à mão' : n + ' ' + plural(n, 'sessão', 'sessões'), sinal: brl(num(j.$('#oSi').value)), regiao: regiao(p.reg)?.curto || '', datas: dias || 'a combinar' })); };
  j.$('#oM').value = msg(); j.$('#oV').addEventListener('input', () => { j.$('#oSi').value = sinalDe(num(j.$('#oV').value)); j.$('#oM').value = msg(); }); j.$('#oS').addEventListener('input', () => j.$('#oM').value = msg()); j.$('#oSi').addEventListener('input', () => j.$('#oM').value = msg());
  j.$('#oOk').onclick = () => { const v = num(j.$('#oV').value); if (!v) { toast('Qual o valor?', 'alerta'); return; }
    const texto = j.$('#oM').value; j.fechar();
    whatsPara(c, texto, () => { p.valor = v; p.sessoesPrev = +j.$('#oS').value || 1; p.sinal = 0; p.sinalPrev = num(j.$('#oSi').value); p.status = 'orcado'; p.orcadoEm = Date.now(); (p.hist = p.hist || []).push({ ts: Date.now(), txt: 'Orçamento mandado · ' + brl(v) }); salvarE(); FX.carimbo('Orçado', brl(v), 'var(--ouro)'); depois?.(); }); };
}
function entregarPeca(p) {
  const c = cliente(p.clienteId), falta = Math.max(0, (p.valor || 0) - (p.sinal || 0));
  const j = janela(`<h2>Entregar a peça</h2><p class="suave" style="margin-top:-4px">${esc(c.nome)} · ${esc(p.ideia)}</p><div class="form"><label class="campo"><span>Falta receber</span><input id="eV" inputmode="decimal" value="${falta}"></label><button class="bt forte" id="eOk">${ic('check')}Entregue!</button></div>`);
  j.$('#eOk').onclick = () => { const v = num(j.$('#eV').value); if (v > 0) lancar({ tipo: 'entrada', cat: 'customizacao', valor: v, clienteId: c.id, pedidoId: p.id, desc: 'Customização · ' + primeiro(c.nome) });
    p.status = 'feito'; p.feitoEm = Date.now(); p.progresso = 100; (p.hist = p.hist || []).push({ ts: Date.now(), txt: 'Peça entregue' }); j.fechar(); salvarE(); FX.carimbo('Entregue!', 'arte que veste', 'var(--mag)'); Som.plim(4); };
}
function abrirPedido(id) {
  const p = pedido(id), c = cliente(p.clienteId), e = p.estimativa || {}, f = p.flashId && flash(p.flashId), ses = sessoesDoPedido(p.id), peca = PECAS.find(x => x[0] === p.peca);
  const acao = { novo: `<button class="bt forte" data-a="orcar">${ic('whats')}Mandar orçamento</button>`, orcado: `<button class="bt forte" data-a="sinal">${ic('grana')}Recebi o sinal</button><button class="bt" data-a="orcar">Reenviar orçamento</button>`,
    sinal: p.tipo === 'customizacao' ? `<button class="bt forte" data-a="bancada">${ic('tesoura')}Começar a peça</button>` : `<button class="bt forte" data-a="marcar">${ic('cal')}Marcar sessão</button>`,
    agendado: p.tipo === 'customizacao' ? `<button class="bt forte" data-a="entregar">${ic('check')}Entregar</button>` : `${ses.some(s => ['marcada', 'confirmada'].includes(s.status)) ? '' : `<button class="bt forte" data-a="marcar">${ic('cal')}Marcar próxima</button>`}<button class="bt" data-a="marcar">${ic('mais')}Outra sessão</button>`, feito: '' }[p.status] || '';
  const j = janela(`<div class="ficha-cab">${avatar(c, true)}<div><h2>${esc(c.nome)}</h2><span class="suave">${esc(TIPOS[p.tipo]?.nome || '')} · ${etapaNome(p.status)} · chegou ${quando(p.criadoEm)} ${p.origem === 'site' ? 'pelo site' : p.origem === 'insta' ? 'pelo Insta' : 'pelo WhatsApp'}</span></div></div>
    <div class="ped-lay"><div>${f ? `<div style="background:var(--papel);border-radius:12px;padding:10px">${flashSVG(f.desenho)}</div>` : p.zona ? corpoSVG(vistaDaZona(p.zona), { sel: [p.zona], ler: true }) : `<div class="oficina-mini">${ic('tesoura')}</div>`}</div><div>
      <p style="font-size:1.1rem;margin:0 0 6px"><b>${esc(p.ideia)}</b></p>
      ${p.refs?.length ? `<div class="refs-g">${p.refs.map(r => `<img src="${r}" alt="Referência" data-zoom>`).join('')}</div>` : ''}
      <dl class="dl">${p.zona ? `<dt>Lugar</dt><dd>${esc(zonaNome(p.zona))}</dd>` : ''}${peca ? `<dt>Peça</dt><dd>${esc(peca[1])}</dd>` : ''}${p.tipo !== 'flash' && p.tipo !== 'customizacao' ? `<dt>Tamanho</dt><dd>${p.tamanho} cm · ${esc(estilo(p.estilo).nome)} · ${p.cor ? 'colorida' : 'preto e cinza'}</dd>` : ''}
        <dt>Onde</dt><dd>${esc(p.cidade)}${p.endereco ? ' · ' + esc(p.endereco) : ''} ${regEtq(p.reg)}</dd>
        <dt>Estimativa</dt><dd>${e.min ? faixa(e) : '—'}${e.horas ? ` · ~${String(e.horas).replace('.', ',')}h` : ''}</dd>
        <dt>Valor</dt><dd><b>${p.valor ? brl(p.valor) : 'a orçar'}</b>${p.sinal ? ` · sinal ${brl(p.sinal)} pago` : p.sinalPrev ? ` · sinal combinado ${brl(p.sinalPrev)}` : ''}${p.taxa ? ` · deslocamento ${brl(p.taxa)}` : ''}</dd>
        ${p.datas?.length ? `<dt>Dias que pediu</dt><dd>${p.datas.map(d => semana(d) + ' ' + dataBR(d)).join(', ')}</dd>` : ''}
        <dt>Contato</dt><dd>${esc(foneFmt(c.fone))}${c.insta ? ' · @' + esc(c.insta) : ''}</dd></dl>
      ${p.tipo === 'customizacao' && p.status === 'agendado' ? `<label class="campo"><span>Andamento da peça: <b id="prgT">${p.progresso || 0}%</b></span><input type="range" id="prg" min="0" max="100" step="5" value="${p.progresso || 0}"></label>` : ''}
      ${ses.length ? `<div class="lista" style="margin:10px 0">${ses.map(s => `<button class="sessao item r-${s.reg}" data-s="${s.id}" style="display:grid"><span class="h">${dataBR(s.inicio)}<small>${hora(s.inicio)}</small></span><span class="meio"><b>${duracaoTxt(s.duracao)} <span class="st ${s.status}">${stTxt[s.status]}</span></b><span>${esc(s.cidade)} · ${brl(s.valor)}</span></span></button>`).join('')}</div>` : ''}
      <div class="bts" style="margin-top:12px">${acao}<button class="bt leve" data-a="whats">${ic('whats')}Conversar</button><button class="bt leve" data-a="ficha">Ficha</button>${p.status !== 'feito' ? '<button class="bt leve" data-a="arquivar">Arquivar</button>' : ''}</div>
      ${p.hist?.length ? `<div class="hist">${p.hist.slice().reverse().map(h => `<span>${quando(h.ts)} · ${esc(h.txt)}</span>`).join('')}</div>` : ''}</div></div>`, { larga: true });
  j.$('#prg')?.addEventListener('input', ev => { p.progresso = +ev.target.value; j.$('#prgT').textContent = p.progresso + '%'; }); j.$('#prg')?.addEventListener('change', () => salvarE());
  j.el.addEventListener('click', async ev => { const z = ev.target.closest('[data-zoom]'); if (z) janela(`<img src="${z.src}" alt="Referência" style="width:100%;border-radius:12px">`, { larga: true });
    const s = ev.target.closest('[data-s]'); if (s) { j.fechar(); acoesSessao(sessao(s.dataset.s)); }
    const a = ev.target.closest('[data-a]')?.dataset.a; if (!a) return;
    if (a === 'orcar') { j.fechar(); mandarOrcamento(p); } if (a === 'sinal') { j.fechar(); receberSinal(p); } if (a === 'marcar') { j.fechar(); marcarSessao(p); }
    if (a === 'bancada') { p.status = 'agendado'; p.progresso = 0; j.fechar(); salvarE(() => toast('Peça na bancada!')); } if (a === 'entregar') { j.fechar(); entregarPeca(p); }
    if (a === 'whats') whatsPara(c, `Salve, ${primeiro(c.nome)}! Aqui é o Japa 🐌 `); if (a === 'ficha') { j.fechar(); abrirFicha(c.id); }
    if (a === 'arquivar' && await pergunta('Arquivar esse pedido?', { sim: 'Arquivar' })) { p.status = 'recusado'; (p.hist = p.hist || []).push({ ts: Date.now(), txt: 'Arquivado' }); j.fechar(); salvarE(() => toast('Pedido arquivado')); } });
}
