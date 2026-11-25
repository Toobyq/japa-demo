/* Galera · Clientes — busca, filtros e a ficha: mapa do corpo com as tattoos que ele fez,
   ficha de saúde, termo assinado no celular (com o dedo), histórico e observações. */
'use strict';
let galBusca = '', galFiltro = 'todos';
const FILTROS_GAL = [['todos', 'Todos'], ['marcados', 'Com sessão marcada'], ['semficha', 'Sem termo assinado'], ['aniv', 'Aniversário no mês'], ['serra', 'Serra'], ['poa', 'POA'], ['litoral', 'Litoral SC']];
registrar('galera', { nome: 'Galera', comum: 'Clientes', icone: 'galera', render(el) {
  el.innerHTML = `<div class="busca-bar"><input id="gBusca" placeholder="Buscar nome, cidade, @insta…" value="${esc(galBusca)}" aria-label="Buscar cliente"><div class="seg" id="gFil">${FILTROS_GAL.map(([k, n]) => `<button class="${galFiltro === k ? 'sel' : ''} ${S.regioes.some(r => r.id === k) ? 'reg r-' + k : ''}" data-f="${k}">${n}</button>`).join('')}</div></div><div id="gLista"></div>`;
  const lista = () => { const q = galBusca.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''), mes = new Date().getMonth() + 1;
    const l = S.clientes.filter(c => (!q || (c.nome + ' ' + c.cidade + ' ' + c.insta + ' ' + c.fone).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q)) && (
      galFiltro === 'todos' || (galFiltro === 'marcados' && S.sessoes.some(s => s.clienteId === c.id && ['marcada', 'confirmada'].includes(s.status))) || (galFiltro === 'semficha' && !c.ficha?.assinadaEm) ||
      (galFiltro === 'aniv' && c.nascimento && +c.nascimento.split('/')[1] === mes) || c.reg === galFiltro))
      .map(c => ({ c, t: tattoosDe(c.id).length, u: sessoesDe(c.id)[0]?.inicio || c.desde })).sort((a, b) => b.u - a.u);
    $('#gLista').innerHTML = `<p class="suave" style="font-size:.85rem;margin:0 0 10px">${l.length} ${plural(l.length, 'pessoa', 'pessoas')}</p><div class="clientes">${l.slice(0, 120).map(({ c, t, u }) => `<button class="item" data-c="${c.id}">${avatar(c)}<span class="meio"><b>${esc(c.nome)}</b><span>${esc(c.cidade)} · ${t} ${plural(t, 'tattoo', 'tattoos')} · ${quando(u)}</span></span>${!c.ficha?.assinadaEm ? `<span title="Termo não assinado" style="color:var(--alerta)">${ic('assinar')}</span>` : ''}</button>`).join('')}</div>` + (l.length ? '' : vazio('Ninguém com esse filtro.')); };
  lista();
  $('#gBusca').addEventListener('input', e => { galBusca = e.target.value; lista(); });
  $('#gFil').onclick = e => { const b = e.target.closest('[data-f]'); if (!b) return; galFiltro = b.dataset.f; $$('#gFil button').forEach(x => x.classList.toggle('sel', x === b)); lista(); };
  el.addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (b) abrirFicha(b.dataset.c); });
} });
function abrirFicha(id) {
  const c = cliente(id), tats = tattoosDe(c.id), tem = {}; for (const p of tats) if (p.zona) tem[p.zona] = (tem[p.zona] || 0) + 1;
  const peds = pedidosDe(c.id), prox = S.sessoes.filter(s => s.clienteId === c.id && ['marcada', 'confirmada'].includes(s.status)).sort((a, b) => a.inicio - b.inicio)[0];
  c.ficha = c.ficha || { alergias: '', saude: '', assinadaEm: 0, assinatura: '' };
  const j = janela(`<div class="ficha-cab">${avatar(c, true)}<div style="flex:1"><h2>${esc(c.nome)}</h2><span class="suave">${esc(c.cidade)} ${regEtq(c.reg)} · desde ${dataAno(c.desde)}${c.nascimento ? ' · 🎂 ' + esc(c.nascimento.slice(0, 5)) : ''}</span></div>
      <div class="bts"><button class="bt peq" data-a="whats">${ic('whats')}${esc(foneFmt(c.fone))}</button>${c.insta ? `<a class="bt peq leve" target="_blank" rel="noopener" href="https://www.instagram.com/${encodeURIComponent(c.insta)}/">${ic('insta')}@${esc(c.insta)}</a>` : ''}</div></div>
    <div class="ficha-lay"><div><div class="corpos-mini">${corpoSVG('frente', { tem, ler: true })}${corpoSVG('costas', { tem, ler: true })}</div>
      <div class="grade g2" style="margin-top:12px;gap:8px"><div class="kpi"><b>${tats.length}</b><span>${plural(tats.length, 'tattoo', 'tattoos')}</span></div><div class="kpi"><b>${brl(totalGasto(c.id))}</b><span>no total</span></div></div></div>
    <div>${prox ? `<div class="alerta-linha leve" style="margin-bottom:12px;cursor:pointer" data-s="${prox.id}">${ic('cal')}Próxima: ${esc(dataLonga(prox.inicio))}, ${hora(prox.inicio)}</div>` : ''}
      <h3 class="sten suave" style="font-size:.8rem;margin:0 0 8px">Ficha de saúde</h3>
      <div class="form"><div class="linha2"><label class="campo"><span>Alergias</span><input id="fA" value="${esc(c.ficha.alergias)}" placeholder="Látex, níquel, remédio…"></label><label class="campo"><span>Saúde / remédios</span><input id="fS" value="${esc(c.ficha.saude)}" placeholder="Diabetes, anticoagulante…"></label></div>
      <div class="linha2"><label class="campo"><span>WhatsApp</span><input id="fF" value="${esc(foneFmt(c.fone))}"></label><label class="campo"><span>Endereço</span><input id="fE" value="${esc(c.endereco || c.bairro || '')}"></label></div>
      <label class="campo"><span>Observações (como gosta, pele, dor…)</span><textarea id="fO" rows="2">${esc(c.obs || '')}</textarea></label></div>
      <div style="margin:14px 0">${c.ficha.assinadaEm ? `<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><span class="ok-txt">${ic('check')} Termo assinado em ${dataAno(c.ficha.assinadaEm)}</span>${c.ficha.assinatura ? `<img class="assinatura-img" src="${c.ficha.assinatura}" alt="Assinatura">` : ''}<button class="bt leve peq" data-a="assinar">Assinar de novo</button></div>`
        : `<button class="bt tinta" data-a="assinar">${ic('assinar')}Assinar ficha e termo agora</button>`}</div>
      <h3 class="sten suave" style="font-size:.8rem;margin:16px 0 8px">Histórico</h3>
      <div class="lista">${peds.map(p => `<button class="item" data-p="${p.id}">${ic(TIPOS[p.tipo]?.icone || 'lapis')}<span class="meio"><b>${esc(p.ideia)}</b><span>${esc(zonaNome(p.zona))} · ${etapaNome(p.status)} · ${quando(sessoesDoPedido(p.id).slice(-1)[0]?.inicio || p.criadoEm)}</span></span><span class="dir num">${p.valor ? brl(p.valor) : ''}</span></button>`).join('') || vazio('Sem pedidos ainda.')}</div></div></div>`, { larga: true,
    aoFechar: () => { const f = j.el; const a = f.querySelector('#fA').value.trim(), s = f.querySelector('#fS').value.trim(), fo = foneNorm(f.querySelector('#fF').value), en = f.querySelector('#fE').value.trim(), o = f.querySelector('#fO').value.trim();
      if (a !== c.ficha.alergias || s !== c.ficha.saude || fo !== c.fone || en !== (c.endereco || c.bairro || '') || o !== (c.obs || '')) { c.ficha.alergias = a; c.ficha.saude = s; if (fo.length >= 10) c.fone = fo; c.endereco = en; c.obs = o; salvarE(() => toast('Ficha salva')); } } });
  j.el.addEventListener('click', e => { const a = e.target.closest('[data-a]')?.dataset.a;
    if (a === 'whats') whatsPara(c, `Salve, ${primeiro(c.nome)}! Aqui é o Japa 🐌 `);
    if (a === 'assinar') assinarTermo(c, () => { j.fechar(); abrirFicha(c.id); });
    const p = e.target.closest('[data-p]'); if (p) { j.fechar(); abrirPedido(p.dataset.p); }
    const s = e.target.closest('[data-s]'); if (s) { j.fechar(); acoesSessao(sessao(s.dataset.s)); } });
}
function assinarTermo(c, depois) {
  const j = janela(`<h2>Ficha e termo</h2><p class="suave" style="margin-top:-4px">Passa o celular pra ${esc(primeiro(c.nome))} ler e assinar com o dedo.</p>
    <div class="termo"><p><b>Termo de consentimento para tatuagem</b></p><p>Eu, ${esc(c.nome)}, declaro ter 18 anos ou mais, que as informações de saúde que passei são verdadeiras e que fui informado(a) sobre o procedimento, os riscos (alergia, infecção, cicatrização) e os cuidados depois da tatuagem.</p>
      <p>Autorizo o tatuador Japa Oneightwo a realizar o trabalho combinado, com material descartável aberto na minha frente. Entendo que o resultado da cicatrização depende também dos meus cuidados.</p><p>Alergias informadas: ${esc(c.ficha?.alergias || 'nenhuma')}. Saúde: ${esc(c.ficha?.saude || 'nada a declarar')}.</p></div>
    <p class="suave" style="font-size:.8rem">Modelo de exemplo. Antes de usar de verdade, vale revisar o texto com um advogado ou com a vigilância sanitária da cidade.</p>
    <canvas class="assina" id="aC" aria-label="Espaço para assinar"></canvas>
    <div class="bts" style="margin-top:12px"><button class="bt forte" id="aOk" disabled>${ic('check')}Assinado</button><button class="bt leve" id="aLimpa">Limpar</button></div>`);
  const cv = j.$('#aC'), ctx = cv.getContext('2d'); let riscou = false, desenhando = false, ult = null;
  const tam = () => { const r = cv.getBoundingClientRect(), k = devicePixelRatio || 1; cv.width = r.width * k; cv.height = r.height * k; ctx.setTransform(k, 0, 0, k, 0, 0); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#141114'; };
  setTimeout(tam, 50);
  const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  cv.addEventListener('pointerdown', e => { desenhando = true; ult = pos(e); cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => { if (!desenhando) return; const p = pos(e), v = Math.hypot(p[0] - ult[0], p[1] - ult[1]); ctx.lineWidth = Math.max(1.4, 3.6 - v * .08); ctx.beginPath(); ctx.moveTo(...ult); ctx.lineTo(...p); ctx.stroke(); ult = p; if (!riscou) { riscou = true; j.$('#aOk').disabled = false; } });
  cv.addEventListener('pointerup', () => desenhando = false);
  j.$('#aLimpa').onclick = () => { ctx.clearRect(0, 0, cv.width, cv.height); riscou = false; j.$('#aOk').disabled = true; };
  j.$('#aOk').onclick = () => { c.ficha = c.ficha || {}; c.ficha.assinadaEm = Date.now(); c.ficha.assinatura = cv.toDataURL('image/png'); j.fechar(); salvarE(); FX.carimbo('Assinado', primeiro(c.nome), 'var(--ciano)'); depois?.(); };
}
