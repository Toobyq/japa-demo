/* Rota · Agenda — o mês pintado por região. Escolhe um "pincel" (Serra, POA, Litoral, Evento, Folga)
   e passa nos dias para planejar a viagem. Clica num dia para ver e marcar as sessões. */
'use strict';
let rotaMes = inicioMes(), rotaDia = hoje0(), pincel = null;
registrar('rota', { nome: 'Rota', comum: 'Agenda', icone: 'rota', render(el) {
  const ini = somaDias(rotaMes, -new Date(rotaMes).getDay()), dias = Array.from({ length: 42 }, (_, i) => somaDias(ini, i));
  const ultimoUsado = dias.findLastIndex(d => d < fimMes(rotaMes)); const mostra = dias.slice(0, Math.ceil((ultimoUsado + 1) / 7) * 7);
  el.innerHTML = `<div class="rota-lay"><div>
    <div class="cartao"><div class="cartao-cab"><div class="mes-nav"><button class="bt leve peq" data-mes="-1" aria-label="Mês anterior">${ic('volta')}</button><h2>${mesNome(rotaMes)} ${new Date(rotaMes).getFullYear()}</h2><button class="bt leve peq" data-mes="1" aria-label="Próximo mês">${ic('seta')}</button></div>
      <button class="bt peq" data-mes="0">Hoje</button></div>
      <div class="pincel-bar"><span class="sten suave" style="font-size:.75rem">Pincel:</span><div class="seg" id="pinceis">${['serra', 'poa', 'litoral', 'evento', 'folga'].map(k => `<button class="reg r-${k} ${pincel === k ? 'sel' : ''}" data-pincel="${k}">${DIA_TIPOS[k]}</button>`).join('')}</div>
        <span class="suave" style="font-size:.85rem">${pincel ? 'Arrasta pelos dias pra pintar. Toca no pincel de novo pra soltar.' : 'Escolhe um pincel pra planejar a viagem.'}</span></div>
      <div class="cal ${pincel ? 'pintando' : ''}" id="cal">${['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'].map(d => `<div class="dsem">${d}</div>`).join('')}
        ${mostra.map(d => { const r = rotaDe(d), ses = sessoesDoDia(d).filter(s => s.status !== 'cancelada');
          return `<button class="d r-${r.reg} ${d < rotaMes || d >= fimMes(rotaMes) ? 'fora' : ''} ${d === hoje0() ? 'hoje' : ''} ${d === rotaDia ? 'sel' : ''}" data-dia="${d}"><span class="n">${new Date(d).getDate()}</span><span class="r">${r.reg === 'evento' ? 'evento' : r.reg === 'folga' ? 'folga' : regiao(r.reg).curto}</span><span class="pts">${ses.map(s => `<i class="${s.status === 'feita' ? 'f' : ''}"></i>`).join('')}</span></button>`; }).join('')}</div></div>
    <div class="cartao" style="margin-top:16px"><h3>${ic('carro')} Próximas paradas</h3><div class="viagens">${paradas({ dias: 70 }).filter(p => p.reg !== 'folga').slice(0, 10).map(p => { const n = S.sessoes.filter(s => s.inicio >= p.ini && s.inicio < p.fim + DIA && s.status !== 'cancelada').length;
      return `<button class="viagem r-${p.reg}" data-dia="${p.ini}"><b>${esc(regiao(p.reg)?.curto || (p.nota || 'Evento').replace(' (exemplo)', ''))}</b><span>${dataBR(p.ini)}${p.dias > 1 ? ' a ' + dataBR(p.fim) : ''} · ${n} ${plural(n, 'sessão', 'sessões')}</span></button>`; }).join('')}</div></div>
  </div><div class="cartao" id="diaDet">${detalheDia(rotaDia)}</div></div>`;

  el.querySelectorAll('[data-mes]').forEach(b => b.onclick = () => { const k = +b.dataset.mes; if (!k) { rotaMes = inicioMes(); rotaDia = hoje0(); } else { const d = new Date(rotaMes); d.setMonth(d.getMonth() + k); rotaMes = d.getTime(); } atualizar(); });
  $('#pinceis').onclick = e => { const b = e.target.closest('[data-pincel]'); if (!b) return; pincel = pincel === b.dataset.pincel ? null : b.dataset.pincel; Som.toque(); atualizar(); };
  const cal = $('#cal'); let pintando = false, mudou = false;
  const pinta = b => { const d = +b.dataset.dia, r = S.rota.find(x => x.dia === d); if (r && r.reg === pincel) return; if (r) { r.reg = pincel; delete r.nota; } else S.rota.push({ dia: d, reg: pincel });
    b.className = b.className.replace(/r-\w+/, 'r-' + pincel); b.querySelector('.r').textContent = pincel === 'evento' || pincel === 'folga' ? pincel : regiao(pincel).curto; b.classList.remove('pinta'); void b.offsetWidth; b.classList.add('pinta'); Som.toque(); mudou = true; };
  cal.addEventListener('pointerdown', e => { const b = e.target.closest('[data-dia]'); if (!b) return; if (pincel) { pintando = true; cal.setPointerCapture?.(e.pointerId); pinta(b); e.preventDefault(); } });
  cal.addEventListener('pointermove', e => { if (!pintando) return; const b = document.elementFromPoint(e.clientX, e.clientY)?.closest('#cal [data-dia]'); if (b) pinta(b); });
  const fim = () => { if (pintando) { pintando = false; if (mudou) { mudou = false; S.rota.sort((a, b) => a.dia - b.dia); salvarE(() => toast('Rota atualizada: o site já mostra')); } } };
  cal.addEventListener('pointerup', fim); cal.addEventListener('pointercancel', fim);
  el.addEventListener('click', e => { const b = e.target.closest('[data-dia]'); if (b && !pincel) { rotaDia = +b.dataset.dia; if (rotaDia < rotaMes || rotaDia >= fimMes(rotaMes)) rotaMes = inicioMes(rotaDia); atualizar(); if (innerWidth < 1150) setTimeout(() => $('#diaDet')?.scrollIntoView({ behavior: 'smooth' }), 100); }
    const s = e.target.closest('[data-sessao]'); if (s) acoesSessao(sessao(s.dataset.sessao));
    const m = e.target.closest('[data-marcar]'); if (m) escolherPedidoParaMarcar(rotaDia);
    const rg = e.target.closest('[data-dia-reg]'); if (rg) { const d = rotaDia, r = S.rota.find(x => x.dia === d); if (r) { r.reg = rg.dataset.diaReg; delete r.nota; } else S.rota.push({ dia: d, reg: rg.dataset.diaReg }); salvarE(); } });
} });
function detalheDia(d) {
  const r = rotaDe(d), ses = sessoesDoDia(d), livre = S.config.horasDia * 60 - minutosOcupados(d);
  return `<div class="cartao-cab"><h3>${ic('cal')} ${esc(dataLonga(d))}</h3></div>
    <div class="seg" style="margin-bottom:14px">${['serra', 'poa', 'litoral', 'evento', 'folga'].map(k => `<button class="reg r-${k} ${r.reg === k ? 'sel' : ''}" data-dia-reg="${k}">${DIA_TIPOS[k]}</button>`).join('')}</div>
    ${r.nota ? `<p style="margin-top:0"><span class="etq reg r-evento">${esc(r.nota)}</span></p>` : ''}
    <div class="lista">${ses.map(s => { const c = cliente(s.clienteId), p = pedido(s.pedidoId);
      return `<button class="sessao item r-${s.reg}" data-sessao="${s.id}" style="display:grid"><span class="h">${hora(s.inicio)}<small>${duracaoTxt(s.duracao)}</small></span><span class="meio"><b>${esc(c.nome)} <span class="st ${s.status}">${stTxt[s.status]}</span></b><span>${esc(p?.ideia || '')}</span><span>${ic('pin')} ${esc(s.cidade)}</span></span></button>`; }).join('') || vazio(r.reg === 'folga' ? 'Folga.' : 'Dia livre.')}</div>
    ${['serra', 'poa', 'litoral'].includes(r.reg) && d >= hoje0() ? `<p class="suave" style="font-size:.88rem">${livre > 0 ? `Sobra ~${duracaoTxt(livre)} nesse dia.` : 'Dia cheio.'}</p><button class="bt forte peq" data-marcar>${ic('mais')}Marcar sessão</button>` : ''}`;
}
function escolherPedidoParaMarcar(d) {
  const reg = rotaDe(d).reg, l = S.pedidos.filter(p => ['sinal', 'orcado', 'agendado'].includes(p.status) && p.tipo !== 'customizacao').sort((a, b) => (b.reg === reg) - (a.reg === reg) || (b.status === 'sinal') - (a.status === 'sinal'));
  const j = janela(`<h2>Marcar quem?</h2><p class="suave" style="margin-top:-4px">${esc(dataLonga(d))} · ${regEtq(reg)}</p><div class="lista">${l.map(p => { const c = cliente(p.clienteId);
    return `<button class="item" data-p="${p.id}">${avatar(c)}<span class="meio"><b>${esc(c.nome)}</b><span>${esc(p.ideia)}</span></span><span class="dir">${regEtq(p.reg)}<br><small class="suave">${etapaNome(p.status)}</small></span></button>`; }).join('') || vazio('Nenhum pedido orçado ou com sinal.')}</div>`, { larga: true });
  j.el.addEventListener('click', e => { const b = e.target.closest('[data-p]'); if (b) { j.fechar(); marcarSessao(pedido(b.dataset.p), { dia: d }); } });
}
