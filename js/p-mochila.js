/* Mochila · Materiais — o checklist antes de sair (zera todo dia) e o estoque com lista de compras. */
'use strict';
const CAT_MOCHILA = { agulha: 'Cartuchos', tinta: 'Tintas', descartavel: 'Descartáveis', stencil: 'Stencil', higiene: 'Higiene e biossegurança' };
registrar('mochila', { nome: 'Mochila', comum: 'Materiais e kit de saída', icone: 'mochila', render(el) {
  const feito = S.kitFeito[hoje0()] || [], faltam = S.mochila.filter(m => m.qtd < m.min);
  el.innerHTML = `<div class="grade g2" style="margin-bottom:16px;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr)">
    <div class="cartao"><div class="cartao-cab"><h3>${ic('check')} Antes de sair de casa</h3><button class="bt leve peq" data-a="zera">Recomeçar</button></div>
      <div style="display:flex;gap:18px;align-items:center;margin-bottom:14px">${anel(feito.length, S.kit.length)}<p style="margin:0">${feito.length >= S.kit.length ? '<b class="mao" style="font-size:1.5rem;color:var(--acido)">Mochila pronta. Bora! 🐌</b>' : `Toca em cada item quando ele estiver na mochila.<br><span class="suave">Zera sozinho todo dia.</span>`}</p></div>
      <div class="kit">${S.kit.map(k => `<button class="${feito.includes(k.id) ? 'ok' : ''}" data-k="${k.id}"><span class="cx">${feito.includes(k.id) ? ic('check') : ''}</span>${esc(k.t)}</button>`).join('')}</div></div>
    <div class="cartao"><div class="cartao-cab"><h3>${ic('alerta')} Lista de compras</h3>${faltam.length ? `<button class="bt peq" data-a="copia">${ic('copiar')}Copiar</button>` : ''}</div>
      <div class="lista">${faltam.map(m => `<div class="item"><span class="meio"><b>${esc(m.nome)}</b><span>tem ${fmt(m.qtd)} · mínimo ${fmt(m.min)} ${esc(m.un)}</span></span><span class="dir num ${m.qtd === 0 ? 'perigo-txt' : ''}">+${fmt(Math.max(m.min * 2 - m.qtd, 1))}</span></div>`).join('') || vazio('Tudo abastecido.')}</div>
      ${faltam.length ? `<p class="suave" style="font-size:.88rem">~${brl(faltam.reduce((t, m) => t + Math.max(m.min * 2 - m.qtd, 1) * m.custo, 0))} pra repor.</p>` : ''}</div></div>
  <div class="cartao"><div class="cartao-cab"><h3>${ic('mochila')} Estoque</h3><button class="bt peq" data-a="novo">${ic('mais')}Item</button></div><div class="tabela-rola"><table class="estoque"><thead><tr><th>Item</th><th>Tipo</th><th>Quantidade</th><th>Mínimo</th><th>Custo un.</th></tr></thead><tbody>
    ${S.mochila.slice().sort((a, b) => (a.qtd / a.min) - (b.qtd / b.min)).map(m => `<tr class="${m.qtd === 0 ? 'zero' : m.qtd < m.min ? 'baixo' : ''}"><td>${esc(m.nome)}</td><td class="suave">${esc(CAT_MOCHILA[m.cat] || m.cat)}</td>
      <td><span class="qtd"><button data-q="${m.id}:-1" aria-label="Menos">−</button><b>${fmt(m.qtd)}</b><button data-q="${m.id}:1" aria-label="Mais">+</button></span> <span class="suave">${esc(m.un)}</span></td><td>${fmt(m.min)}</td><td>${brl(m.custo)}</td></tr>`).join('')}</tbody></table></div></div>`;
  el.addEventListener('click', e => {
    const k = e.target.closest('[data-k]'); if (k) { const f = S.kitFeito[hoje0()] = S.kitFeito[hoje0()] || []; const i = f.indexOf(k.dataset.k); if (i >= 0) f.splice(i, 1); else f.push(k.dataset.k);
      for (const d in S.kitFeito) if (+d < hoje0() - 7 * DIA) delete S.kitFeito[d];
      const r = k.getBoundingClientRect(); if (i < 0) { FX.respingo(r.left + 24, r.top + r.height / 2, ['#d4ff3b'], 10); Som.toque(); }
      salvarE(); if (i < 0 && f.length === S.kit.length) { FX.carimbo('Mochila pronta', 'o estúdio tá nas costas', 'var(--acido)'); setTimeout(() => Som.plim(5), 250); } }
    const q = e.target.closest('[data-q]'); if (q) { const [id, d] = q.dataset.q.split(':'); const m = S.mochila.find(x => x.id === id); m.qtd = Math.max(0, m.qtd + +d); Som.toque(); salvarE(); }
    const a = e.target.closest('[data-a]')?.dataset.a;
    if (a === 'zera') { delete S.kitFeito[hoje0()]; salvarE(); }
    if (a === 'copia') navigator.clipboard?.writeText('Comprar:\n' + faltam.map(m => `- ${m.nome}: ${Math.max(m.min * 2 - m.qtd, 1)} ${m.un}`).join('\n')).then(() => toast('Lista copiada'), () => toast('Não deu pra copiar', 'alerta'));
    if (a === 'novo') { const j = janela(`<h2>Novo item</h2><div class="form"><label class="campo"><span>Nome</span><input id="nN"></label><div class="linha2"><label class="campo"><span>Tipo</span><select id="nC">${Object.entries(CAT_MOCHILA).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label><label class="campo"><span>Unidade</span><input id="nU" value="un"></label></div>
        <div class="linha3"><label class="campo"><span>Tem</span><input id="nQ" type="number" value="0"></label><label class="campo"><span>Mínimo</span><input id="nM" type="number" value="1"></label><label class="campo"><span>Custo</span><input id="nP" inputmode="decimal" value="0"></label></div><button class="bt forte" id="nOk">Salvar</button></div>`);
      j.$('#nOk').onclick = () => { const nome = j.$('#nN').value.trim(); if (!nome) return; S.mochila.push({ id: novoId('m'), nome, cat: j.$('#nC').value, un: j.$('#nU').value || 'un', qtd: +j.$('#nQ').value || 0, min: +j.$('#nM').value || 1, custo: num(j.$('#nP').value) }); j.fechar(); salvarE(() => toast('Item na mochila')); }; }
  });
} });
