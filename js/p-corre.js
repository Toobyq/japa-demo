/* Corre · Grana — o mês (entrou, saiu, sobrou), por categoria, os últimos 6 meses,
   e o que só tatuador que viaja precisa: cada viagem se pagou? */
'use strict';
let correMes = inicioMes(), verTodos = false;
const CATS = { sinal: ['Sinais', 'var(--ciano)'], sessao: ['Sessões', 'var(--mag)'], flash: ['Flashes', 'var(--ouro)'], customizacao: ['Customização', 'var(--acido)'], deslocamento: ['Deslocamento', 'var(--musgo)'], evento: ['Eventos', 'var(--evento)'], outra: ['Outros', 'var(--suave)'],
  material: ['Material', 'var(--verm)'], combustivel: ['Combustível', 'var(--ouro)'], pedagio: ['Pedágio', 'var(--alerta)'], hospedagem: ['Hospedagem', 'var(--ciano)'], alimentacao: ['Rango na estrada', 'var(--musgo)'], divulgacao: ['Divulgação', 'var(--mag)'] };
const ENTRADAS = ['sessao', 'sinal', 'flash', 'customizacao', 'deslocamento', 'evento', 'outra'], SAIDAS = ['material', 'combustivel', 'pedagio', 'hospedagem', 'alimentacao', 'divulgacao', 'outra'];
registrar('corre', { nome: 'Corre', comum: 'Grana', icone: 'grana', render(el) {
  const doMes = S.caixa.filter(l => noMes(l.ts, correMes)), ent = doMes.filter(l => l.tipo === 'entrada'), sai = doMes.filter(l => l.tipo === 'saida');
  const tE = ent.reduce((t, l) => t + l.valor, 0), tS = sai.reduce((t, l) => t + l.valor, 0), feitas = S.sessoes.filter(s => s.status === 'feita' && noMes(s.inicio, correMes));
  const ant = S.caixa.filter(l => noMes(l.ts, mesAntes(correMes, 1)) && l.tipo === 'entrada').reduce((t, l) => t + l.valor, 0), dif = ant ? Math.round((tE - ant) / ant * 100) : 0;
  const km = feitas.reduce((t, s) => t + (s.km || 0) * 2, 0);
  const porCat = (l, cats) => cats.map(k => [k, l.filter(x => (x.cat || 'outra') === k).reduce((t, x) => t + x.valor, 0)]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]);
  const pe = porCat(ent, ENTRADAS), ps = porCat(sai, SAIDAS), maxC = Math.max(1, ...pe.map(x => x[1]), ...ps.map(x => x[1]));
  const meses = Array.from({ length: 6 }, (_, i) => mesAntes(Date.now(), 5 - i)).map(m => ({ m, v: S.caixa.filter(l => l.tipo === 'entrada' && noMes(l.ts, m)).reduce((t, l) => t + l.valor, 0) })), maxM = Math.max(1, ...meses.map(x => x.v));
  el.innerHTML = `<div class="busca-bar"><div class="mes-nav"><button class="bt leve peq" data-m="-1" aria-label="Mês anterior">${ic('volta')}</button><h2>${mesNome(correMes)} ${new Date(correMes).getFullYear()}</h2><button class="bt leve peq" data-m="1" aria-label="Próximo mês" ${correMes >= inicioMes() ? 'disabled' : ''}>${ic('seta')}</button></div>
    <button class="bt forte" data-a="novo">${ic('mais')}Lançar</button></div>
  <div class="grade g4" style="margin-bottom:16px">
    <div class="cartao kpi"><b class="ok-txt">${brl(tE)}</b><span>entrou ${ant ? `<span class="${dif >= 0 ? 'sobe' : 'desce'}">${dif >= 0 ? '▲' : '▼'} ${Math.abs(dif)}%</span> vs mês passado` : ''}</span></div>
    <div class="cartao kpi"><b class="perigo-txt">${brl(tS)}</b><span>saiu (material e estrada)</span></div>
    <div class="cartao kpi destaque" style="--rc:var(--acido)"><b>${brl(tE - tS)}</b><span>sobrou no bolso</span></div>
    <div class="cartao kpi"><b>${feitas.length ? brl(Math.round(ent.filter(l => ['sessao', 'sinal', 'flash'].includes(l.cat)).reduce((t, l) => t + l.valor, 0) / feitas.length)) : '—'}</b><span>por tattoo · ${feitas.length} ${plural(feitas.length, 'tattoo', 'tattoos')} · ~${fmt(km)} km</span></div></div>
  <div class="grade g2" style="margin-bottom:16px">
    <div class="cartao"><h3>${ic('carro')} As viagens valeram?</h3><div class="lista">${viagens().slice(0, 5).map(v => `<div class="item r-${v.reg}" style="border-left:4px solid var(--rc)"><span class="meio viagem-res"><b>${esc(regiao(v.reg).nome)} · ${dataBR(v.ini)}${v.dias > 1 ? ' a ' + dataBR(v.fim) : ''}</b><span>${v.n} ${plural(v.n, 'tattoo', 'tattoos')} · entrou ${brl(v.ent)} · gastou ${brl(v.sai)} na estrada</span>
      <span class="veredito" style="color:${v.luc > 0 ? 'var(--ok)' : 'var(--perigo)'}">${v.emAndamento ? 'Rolando agora…' : v.luc > v.sai * 3 ? 'Valeu muito a viagem 🔥' : v.luc > 0 ? 'Se pagou, sobrou um troco' : 'Não se pagou: junta mais gente na próxima'}</span></span><span class="dir num" style="font-size:1.2rem">${brl(v.luc)}</span></div>`).join('') || vazio('Nenhuma viagem pra fora da Serra ainda.')}</div></div>
    <div class="cartao"><h3>${ic('estrela')} Últimos 6 meses</h3><div class="meses">${meses.map((x, i) => `<div class="m ${i === 5 ? 'atual' : ''}"><small>${x.v >= 1000 ? (x.v / 1000).toFixed(1).replace('.', ',') + 'k' : fmt(x.v)}</small><div class="col" style="height:${Math.max(4, x.v / maxM * 120)}px;animation-delay:${i * 70}ms"></div><span>${mesNome(x.m, true)}</span></div>`).join('')}</div>
      <p class="suave" style="font-size:.85rem;margin-bottom:0">Meta do mês: ${brl(S.config.metaMes)}</p></div></div>
  <div class="grade g2" style="margin-bottom:16px">
    <div class="cartao"><h3>Entrou por</h3><div class="barras">${pe.map(([k, v]) => barraCat(k, v, maxC)).join('') || vazio('Nada ainda.')}</div></div>
    <div class="cartao"><h3>Saiu por</h3><div class="barras">${ps.map(([k, v]) => barraCat(k, v, maxC)).join('') || vazio('Nada ainda.')}</div></div></div>
  <div class="cartao"><h3>Lançamentos</h3><div class="lista">${doMes.slice().sort((a, b) => b.ts - a.ts).slice(0, verTodos ? 999 : 15).map(l => `<div class="item"><span class="meio"><b>${esc(l.desc || CATS[l.cat]?.[0] || '')}</b><span>${dataBR(l.ts)} · ${esc(CATS[l.cat]?.[0] || l.cat)} · ${l.forma === 'cartao' ? 'cartão' : esc(l.forma || '')}</span></span>
    <span class="dir num ${l.tipo === 'entrada' ? 'ok-txt' : 'perigo-txt'}">${l.tipo === 'entrada' ? '+' : '−'}${brl(l.valor)}</span><button class="bt leve peq" data-x="${l.id}" aria-label="Apagar lançamento">${ic('lixo')}</button></div>`).join('') || vazio('Nenhum lançamento nesse mês.')}</div>${doMes.length > 15 && !verTodos ? `<button class="bt leve peq" style="margin-top:10px" data-todos>Ver os ${doMes.length} lançamentos</button>` : ''}</div>`;
  setTimeout(() => $$('.barras .t i[data-w]', el).forEach(i => i.style.width = i.dataset.w + '%'), 60);
  el.addEventListener('click', async e => { const m = e.target.closest('[data-m]'); if (m) { const d = new Date(correMes); d.setMonth(d.getMonth() + +m.dataset.m); correMes = d.getTime(); verTodos = false; atualizar(); }
    if (e.target.closest('[data-a="novo"]')) novoLancamento(); if (e.target.closest('[data-todos]')) { verTodos = true; atualizar(); }
    const x = e.target.closest('[data-x]'); if (x && await pergunta('Apagar esse lançamento?', { sim: 'Apagar', perigo: true })) { S.caixa = S.caixa.filter(l => l.id !== x.dataset.x); salvarE(() => toast('Lançamento apagado')); } });
} });
const barraCat = (k, v, max) => `<div class="b"><span>${esc(CATS[k]?.[0] || k)}</span><span class="t"><i data-w="${v / max * 100}" style="background:${CATS[k]?.[1] || 'var(--suave)'}"></i></span><span class="v">${brl(v)}</span></div>`;
function viagens() {
  return paradas({ de: somaDias(hoje0(), -120), dias: 121 }).filter(p => p.reg === 'poa' || p.reg === 'litoral').reverse().map(p => {
    const dentro = ts => ts >= p.ini && ts < p.fim + DIA; const ses = S.sessoes.filter(s => s.status === 'feita' && dentro(s.inicio));
    const ent = S.caixa.filter(l => l.tipo === 'entrada' && dentro(l.ts) && l.cat !== 'sinal').reduce((t, l) => t + l.valor, 0) + ses.reduce((t, s) => t + (pedido(s.pedidoId)?.sinal || 0), 0);
    const sai = S.caixa.filter(l => l.tipo === 'saida' && dentro(l.ts) && l.cat !== 'material').reduce((t, l) => t + l.valor, 0);
    return { ...p, n: ses.length, ent, sai, luc: ent - sai, emAndamento: p.fim >= hoje0() };
  });
}
function novoLancamento() {
  let tipo = 'entrada', forma = 'pix';
  const j = janela(`<h2>Lançar</h2><div class="form"><div class="seg" id="lT"><button class="sel" data-t="entrada">Entrou</button><button data-t="saida">Saiu</button></div>
    <div class="linha2"><label class="campo"><span>Valor</span><input id="lV" inputmode="decimal" placeholder="0,00"></label><label class="campo"><span>Categoria</span><select id="lC"></select></label></div>
    <label class="campo"><span>Descrição</span><input id="lD" placeholder="Ex.: gasolina pra Caxias"></label>
    <div class="campo"><span>Forma</span><div class="seg" id="lF">${['pix', 'dinheiro', 'cartao'].map((f, i) => `<button data-f="${f}" class="${i ? '' : 'sel'}">${f === 'cartao' ? 'cartão' : f}</button>`).join('')}</div></div>
    <button class="bt forte" id="lOk">${ic('check')}Lançar</button></div>`);
  const cats = () => j.$('#lC').innerHTML = (tipo === 'entrada' ? ENTRADAS : SAIDAS).map(k => `<option value="${k}">${CATS[k][0]}</option>`).join(''); cats();
  j.$('#lT').onclick = e => { const b = e.target.closest('[data-t]'); if (!b) return; tipo = b.dataset.t; $$('#lT button', j.el).forEach(x => x.classList.toggle('sel', x === b)); cats(); };
  j.$('#lF').onclick = e => { const b = e.target.closest('[data-f]'); if (!b) return; forma = b.dataset.f; $$('#lF button', j.el).forEach(x => x.classList.toggle('sel', x === b)); };
  j.$('#lOk').onclick = () => { const v = num(j.$('#lV').value); if (v <= 0) { toast('Qual o valor?', 'alerta'); return; } const cat = j.$('#lC').value;
    lancar({ tipo, cat, valor: v, forma, desc: j.$('#lD').value.trim() || CATS[cat][0] }); j.fechar(); salvarE(() => toast(tipo === 'entrada' ? 'Entrou! 🔥' : 'Saída lançada')); if (tipo === 'entrada') Som.plim(); };
}
