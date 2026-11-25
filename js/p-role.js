/* Rolê · Hoje — onde ele tá, a linha do dia com os deslocamentos, o próximo atendimento, a meta em pedras. */
'use strict';
const FRASES = ['Um traço de cada vez.', 'O estúdio anda contigo.', 'Devagar e sempre, igual caracol.', 'Pele boa é pele hidratada.', 'Hoje tem arte saindo da mochila.', 'Equilíbrio: pedra por pedra.'];
registrar('role', { nome: 'Rolê', comum: 'Hoje', icone: 'casa', render(el) {
  const h = new Date().getHours(), oi = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite', r = estouEm(), reg = regiao(r.reg);
  const hoje = sessoesDoDia(Date.now()).filter(s => s.status !== 'cancelada' && s.status !== 'faltou');
  const prox = hoje.find(s => s.status !== 'feita' && s.inicio + s.duracao * MIN > Date.now()) || S.sessoes.filter(s => ['marcada', 'confirmada'].includes(s.status) && s.inicio > Date.now()).sort((a, b) => a.inicio - b.inicio)[0];
  const novos = S.pedidos.filter(p => p.status === 'novo').sort((a, b) => b.criadoEm - a.criadoEm);
  const mesEnt = S.caixa.filter(l => l.tipo === 'entrada' && noMes(l.ts)).reduce((t, l) => t + l.valor, 0), meta = S.config.metaMes;
  const tatMes = S.sessoes.filter(s => s.status === 'feita' && noMes(s.inicio)).length;
  const kitHoje = S.kitFeito[hoje0()] || [], cuidar = paraCuidar().filter(x => !x.enviado);
  // em que dia da viagem ele tá
  const par = paradas({ de: somaDias(hoje0(), -20), dias: 40 }).find(p => p.ini <= hoje0() && p.fim >= hoje0());
  const viagemTxt = par && r.reg !== 'serra' && par.dias > 1 ? `Dia ${Math.round((hoje0() - par.ini) / DIA) + 1} de ${par.dias} em ${reg ? reg.curto : DIA_TIPOS[r.reg]}` : reg ? reg.frase : r.reg === 'folga' ? 'Dia de folga. Cachoeira?' : (r.nota || 'Evento');
  const proxPar = paradas({ de: somaDias(hoje0(), 1), dias: 40 }).find(p => p.reg !== r.reg && p.reg !== 'folga');
  const anivs = S.clientes.filter(c => { if (!c.nascimento) return false; const [d, m] = c.nascimento.split('/').map(Number); for (let i = 0; i < 7; i++) { const x = new Date(somaDias(hoje0(), i)); if (x.getDate() === d && x.getMonth() + 1 === m) return true; } return false; });
  const nov = S.novidades.filter(n => !n.visto && n.tipo === 'pedido');

  el.innerHTML = `
  ${nov.length ? `<div class="chegou">${ic('raio')}<div class="meio"><b>${nov.length === 1 ? esc(nov[0].txt) : nov.length + ' pedidos novos chegaram'}</b><br><span class="suave">${esc(pedido(nov[0].ref)?.ideia || '')}</span></div><button class="bt tinta peq" data-ver-novos>Ver</button></div>` : ''}
  <div class="grade g3" style="margin-bottom:16px">
    <div class="cartao destaque r-${r.reg}" style="grid-column: span 2"><div class="ola">${caracolSVG({ anima: true, concha: 'var(--rc)' })}<div><h2>${oi}, Japa!</h2><p>${esc(FRASES[new Date().getDate() % FRASES.length])}</p>
      <p style="margin-top:10px"><span class="etq reg r-${r.reg}">${esc(reg ? reg.nome : DIA_TIPOS[r.reg])}</span> <span class="suave">${esc(viagemTxt)}</span></p>
      ${proxPar ? `<p class="suave" style="font-size:.88rem">Próxima parada: <b style="color:var(--texto)">${esc(regiao(proxPar.reg)?.curto || DIA_TIPOS[proxPar.reg])}</b> em ${quando(proxPar.ini)} (${proxPar.dias} ${plural(proxPar.dias, 'dia', 'dias')})</p>` : ''}</div></div></div>
    <div class="cartao"><h3>${ic('mochila')} Mochila de hoje</h3><div style="display:flex;gap:14px;align-items:center">${anel(kitHoje.length, S.kit.length)}<div><p style="margin:0 0 10px">${kitHoje.length >= S.kit.length ? '<b class="ok-txt">Pronta pra sair! 🐌</b>' : `Faltam <b>${S.kit.length - kitHoje.length}</b> itens.`}</p><button class="bt peq" data-ir="mochila">Conferir</button></div></div></div>
  </div>
  <div class="cartao" style="margin-bottom:16px"><div class="cartao-cab"><h3>${ic('rota')} A linha do dia</h3><span class="suave" style="font-size:.85rem">${hoje.length ? `${hoje.length} ${plural(hoje.length, 'atendimento', 'atendimentos')} · ${kmDia(hoje)} km rodando` : ''}</span></div>${linhaDia(hoje)}</div>
  <div class="grade g2" style="margin-bottom:16px">
    <div class="cartao">${prox ? proximoAtendimento(prox) : `<h3>Próximo atendimento</h3>${vazio('Nada marcado. Bom dia pra desenhar flash novo.')}`}</div>
    <div class="cartao"><h3>${ic('estrela')} O mês em pedras</h3><div class="pedras-meta">${pilha(mesEnt / meta)}<div style="flex:1"><div class="kpi"><b>${brl(mesEnt)}</b><span>de ${brl(meta)} · ${Math.round(mesEnt / meta * 100)}% da meta</span></div>
      <div class="barra" style="margin:12px 0"><i data-w="${Math.min(100, mesEnt / meta * 100)}"></i></div><p class="suave" style="margin:0;font-size:.9rem">${tatMes} ${plural(tatMes, 'tattoo', 'tattoos')} no mês · meta ${S.config.metaTattoos}</p>
      <p class="suave" style="margin:6px 0 0;font-size:.9rem">${mesEnt >= meta ? 'Meta batida. A pilha ficou de pé! 🔥' : `Faltam ${brl(meta - mesEnt)}. Cada pedra é 10%.`}</p></div></div></div>
  </div>
  <div class="grade g3">
    <div class="cartao"><div class="cartao-cab"><h3>${ic('lapis')} Pedidos esperando</h3><button class="bt leve peq" data-ir="rascunhos">Todos</button></div>
      <div class="lista">${novos.slice(0, 4).map(p => { const c = cliente(p.clienteId); return `<button class="item" data-pedido="${p.id}">${avatar(c)}<span class="meio"><b>${esc(c.nome)}</b><span>${esc(p.ideia)}</span></span><span class="dir">${regEtq(p.reg)}<br><small class="suave">${quando(p.criadoEm)}</small></span></button>`; }).join('') || vazio('Nenhum pedido novo.')}</div></div>
    <div class="cartao"><div class="cartao-cab"><h3>${ic('gota')} Cicatrizando</h3><button class="bt leve peq" data-ir="cicatriza">Ver</button></div>
      ${cuidar.length ? `<p style="margin:0 0 10px"><b>${cuidar.length}</b> ${plural(cuidar.length, 'mensagem', 'mensagens')} de cuidado pra mandar hoje.</p><div class="lista">${cuidar.slice(0, 3).map(x => { const c = cliente(x.s.clienteId); return `<div class="item">${avatar(c)}<span class="meio"><b>${esc(c.nome)}</b><span>${esc(x.fz.t)}</span></span></div>`; }).join('')}</div>` : vazio('Tudo em dia com quem tá cicatrizando.')}</div>
    <div class="cartao"><h3>${ic('presente')} Aniversários da semana</h3><div class="lista">${anivs.slice(0, 4).map(c => `<button class="item" data-aniv="${c.id}">${avatar(c)}<span class="meio"><b>${esc(c.nome)}</b><span>${esc(c.nascimento.slice(0, 5))} · ${esc(c.cidade)}</span></span>${ic('whats')}</button>`).join('') || vazio('Ninguém de aniversário essa semana.')}</div></div>
  </div>`;

  setTimeout(() => $$('.barra i[data-w]', el).forEach(i => i.style.width = i.dataset.w + '%'), 80);
  el.querySelector('[data-ver-novos]')?.addEventListener('click', () => { for (const n of S.novidades) n.visto = true; salvar(); ir('rascunhos'); });
  el.addEventListener('click', e => {
    const s = e.target.closest('[data-sessao]'); if (s) acoesSessao(sessao(s.dataset.sessao));
    const p = e.target.closest('[data-pedido]'); if (p) abrirPedido(p.dataset.pedido);
    const a = e.target.closest('[data-aniv]'); if (a) { const c = cliente(a.dataset.aniv); whatsPara(c, preencher(S.mensagens.aniversario, dadosMsg(c))); }
    const b = e.target.closest('[data-cobrar]'); if (b) cobrarSessao(sessao(b.dataset.cobrar));
    const f = e.target.closest('[data-ficha]'); if (f) abrirFicha(f.dataset.ficha);
    const w = e.target.closest('[data-chegando]'); if (w) { const x = sessao(w.dataset.chegando), c = cliente(x.clienteId); whatsPara(c, `Salve, ${primeiro(c.nome)}! Tô a caminho, chego em uns 20 min. 🐌`); }
  });
  // o caracol anda na linha do dia conforme a hora
  clearInterval(window._relogio); window._relogio = setInterval(() => { const a = $('.linha-dia .agora'); if (!a) return clearInterval(window._relogio); a.style.left = posHora(Date.now()) + '%'; }, 30000);
} });
const DIA_INI = 8, DIA_FIM = 22;
const posHora = ts => { const m = minDoDia(ts) / 60; return Math.max(0, Math.min(100, (m - DIA_INI) / (DIA_FIM - DIA_INI) * 100)); };
// quilômetros de cada trecho: de casa até o 1º cliente e entre um cliente e outro
function trechos(ses) { let ant = null; return ses.map(s => { const km = ant ? (s.cidade === ant.cidade ? 4 : Math.abs((s.km || 0) - (ant.km || 0)) || 12) : Math.max(s.km || 0, 6); ant = s; return km; }); }
function kmDia(ses) { const t = trechos(ses); return t.reduce((a, b) => a + b, 0) + Math.max(ses[ses.length - 1]?.km || 0, 6); }
function linhaDia(ses) {
  if (!ses.length) return vazio(estouEm().reg === 'folga' ? 'Folga. Vai pra cachoeira empilhar umas pedras.' : 'Nenhum atendimento hoje.');
  const hrs = []; for (let h = DIA_INI; h <= DIA_FIM; h += 2) hrs.push(h);
  let estradas = '', ant = null;
  const kms = trechos(ses);
  for (const [i, s] of ses.entries()) { const ini = posHora(s.inicio), de = ant ? posHora(ant.inicio + ant.duracao * MIN) : Math.max(0, ini - 6), km = kms[i];
    estradas += `<div class="estrada" style="left:${de}%;width:${Math.max(.5, ini - de)}%"></div><span class="km" style="left:${(de + ini) / 2}%">${ic('carro')} ${km} km</span>`; ant = s; }
  return `<div class="linha-dia"><div class="eixo"></div>${hrs.map(h => `<span class="hr" style="left:${(h - DIA_INI) / (DIA_FIM - DIA_INI) * 100}%">${h}h</span>`).join('')}${estradas}
    ${ses.map(s => { const c = cliente(s.clienteId); return `<div class="ses r-${s.reg} ${s.status === 'feita' ? 'feita' : ''}" data-sessao="${s.id}" style="left:${posHora(s.inicio)}%;width:${Math.max(4, s.duracao / 60 / (DIA_FIM - DIA_INI) * 100)}%" title="${esc(c.nome)}">${hora(s.inicio)} ${esc(primeiro(c.nome))}${s.status === 'feita' ? ' ✓' : ''}</div>`; }).join('')}
    <div class="agora" style="left:${posHora(Date.now())}%">${caracolSVG({ anima: true })}</div></div>`;
}
function proximoAtendimento(s) {
  const c = cliente(s.clienteId), p = pedido(s.pedidoId), ehHoje = diasAte(s.inicio) === 0, f = p?.flashId && flash(p.flashId);
  return `<div class="cartao-cab"><h3>${ic('agulha')} ${ehHoje ? 'Próximo atendimento' : 'Próximo: ' + quando(s.inicio)}</h3><span class="st ${s.status}">${stTxt[s.status]}</span></div>
  <div class="prox-cli"><div>${f ? flashSVG(f.desenho) : corpoSVG(vistaDaZona(p?.zona), { sel: [p?.zona], ler: true })}</div><div>
    <h2>${esc(c.nome)}</h2><p class="ideia">${esc(p?.ideia || '')}</p>
    <div class="meta"><span>${ic('relogio')}${hora(s.inicio)} · ${duracaoTxt(s.duracao)}</span><span>${ic('pin')}${esc(s.cidade)}</span><span>${ic('grana')}${brl(s.valor + (s.taxa || 0))} a receber</span></div>
    ${c.ficha?.alergias ? `<div class="alerta-linha" style="margin-bottom:8px">${ic('alerta')}Alergia a ${esc(c.ficha.alergias)}${/l[áa]tex/i.test(c.ficha.alergias) ? ': leva as luvas nitrílicas!' : ''}</div>` : ''}
    ${c.ficha?.saude ? `<div class="alerta-linha leve" style="margin-bottom:8px">${ic('alerta')}${esc(c.ficha.saude)}</div>` : ''}
    ${!c.ficha?.assinadaEm ? `<div class="alerta-linha leve" style="margin-bottom:8px">${ic('assinar')}Ficha e termo ainda não assinados</div>` : ''}
    <div class="bts"><button class="bt forte peq" data-cobrar="${s.id}">${ic('check')}Finalizar</button><button class="bt peq" data-chegando="${s.id}">${ic('whats')}Tô chegando</button>
      <a class="bt peq" target="_blank" rel="noopener" href="${mapaLink(s.endereco, s.cidade)}">${ic('pin')}Mapa</a><button class="bt leve peq" data-ficha="${c.id}">Ficha</button></div></div></div>`;
}
function anel(n, total) { const r = 50, C = 2 * Math.PI * r, k = total ? n / total : 0;
  return `<svg class="anel" viewBox="0 0 120 120"><circle class="fundo-a" cx="60" cy="60" r="${r}"/><circle class="frente-a" cx="60" cy="60" r="${r}" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - k)}"/><text x="60" y="69" text-anchor="middle">${n}/${total}</text></svg>`; }
function pilha(k) {
  const n = 10, cheias = Math.min(n, Math.floor(k * 10)); let y = 160, h = '';
  for (let i = 0; i < n; i++) { const w = 104 - i * 7, alt = 17 - i * .6; y -= alt - 2; h += `<span class="pedra ${i < cheias ? 'cheia' : ''}" style="--k:${i};--r:${[-3, 2, -1, 4, -2, 3, -4, 1, -2, 2][i]}deg;width:${w}px;height:${alt}px;top:${y}px"></span>`; }
  return `<div class="pilha" title="${Math.round(k * 100)}% da meta">${h}</div>`;
}
