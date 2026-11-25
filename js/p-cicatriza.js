/* Cicatriza · Pós-tattoo — quem tá cicatrizando, em que fase, e a mensagem de cuidado pronta.
   Também lembra do retoque grátis (até 45 dias). */
'use strict';
registrar('cicatriza', { nome: 'Cicatriza', comum: 'Pós-tattoo', icone: 'gota', render(el) {
  const l = paraCuidar(), pend = l.filter(x => !x.enviado), ok = l.filter(x => x.enviado);
  const retoque = S.sessoes.filter(s => s.status === 'feita' && -diasAte(s.inicio) >= 30 && -diasAte(s.inicio) <= S.config.retoqueGratisDias && !S.cuidadosEnviados[s.id + ':retoque']);
  const card = x => { const c = cliente(x.s.clienteId), p = pedido(x.s.pedidoId);
    return `<div class="cic"><div class="dia" style="--p:${x.fz.pct}"><span>${x.dias}<small>DIAS</small></span></div><div style="min-width:0"><b>${esc(c.nome)}</b> <span class="suave">· ${esc(p?.ideia || '')} · ${esc(zonaNome(p?.zona))}</span>
      <div class="msg"><b style="color:var(--texto)">${esc(x.fz.t)}.</b> ${esc(x.fz.txt)}</div></div>
      <div class="bts">${x.enviado ? `<span class="ok-txt">${ic('check')} mandada</span>` : `<button class="bt forte peq" data-m="${x.s.id}">${ic('whats')}Mandar</button>`}</div></div>`; };
  el.innerHTML = `<div class="grade g3" style="margin-bottom:16px"><div class="cartao kpi"><b>${l.length}</b><span>${plural(l.length, 'pele', 'peles')} cicatrizando (últimos 30 dias)</span></div>
    <div class="cartao kpi destaque" style="--rc:var(--ciano)"><b>${pend.length}</b><span>${plural(pend.length, 'mensagem', 'mensagens')} pra mandar hoje</span></div>
    <div class="cartao kpi"><b>${retoque.length}</b><span>na janela do retoque grátis</span></div></div>
  <div class="cartao" style="margin-bottom:16px"><div class="cartao-cab"><h3>${ic('gota')} Pra mandar hoje</h3>${pend.length > 1 ? `<button class="bt peq" data-todas>Mandar todas</button>` : ''}</div><div class="lista">${pend.map(card).join('') || vazio('Tudo em dia. Pele boa é pele bem cuidada.')}</div></div>
  ${retoque.length ? `<div class="cartao" style="margin-bottom:16px"><h3>${ic('agulha')} Retoque grátis acabando</h3><div class="lista">${retoque.map(s => { const c = cliente(s.clienteId), resta = S.config.retoqueGratisDias + diasAte(s.inicio);
    return `<div class="item">${avatar(c)}<span class="meio"><b>${esc(c.nome)}</b><span>${esc(pedido(s.pedidoId)?.ideia || '')} · faltam ${resta} dias pro retoque grátis</span></span><button class="bt peq" data-r="${s.id}">${ic('whats')}Perguntar</button></div>`; }).join('')}</div></div>` : ''}
  <div class="cartao"><h3>Já mandadas</h3><div class="lista">${ok.slice(0, 20).map(card).join('') || vazio('Nenhuma ainda.')}</div></div>`;
  const manda = (id, depois) => { const x = l.find(y => y.s.id === id), c = cliente(x.s.clienteId);
    whatsPara(c, preencher(S.mensagens.cuidado, dadosMsg(c, { fase: x.fz.dia === 0 ? 'Hoje é o dia 0' : `Dia ${x.dias}`, dica: x.fz.txt })), () => { S.cuidadosEnviados[id + ':' + x.fz.dia] = Date.now(); salvarE(); depois?.(); }); };
  el.addEventListener('click', e => { const m = e.target.closest('[data-m]'); if (m) manda(m.dataset.m);
    const r = e.target.closest('[data-r]'); if (r) { const s = sessao(r.dataset.r), c = cliente(s.clienteId); whatsPara(c, `E aí, ${primeiro(c.nome)}! Como ficou a tattoo? Se precisar de retoque, até ${dataBR(somaDias(s.inicio, S.config.retoqueGratisDias))} é por minha conta. 🐌`, () => { S.cuidadosEnviados[s.id + ':retoque'] = Date.now(); salvarE(); }); }
    if (e.target.closest('[data-todas]')) { const fila = pend.map(x => x.s.id); const prox = () => { const id = fila.shift(); if (id) manda(id, () => setTimeout(prox, 250)); }; prox(); } });
} });
