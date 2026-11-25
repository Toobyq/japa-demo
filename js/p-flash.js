/* Flash Sheet · Flashes — a cartela: disponível / reservado / tatuado, preço, "único",
   novo flash (desenho da casa ou foto do papel) e o story pronto para o Instagram (PNG 1080×1920). */
'use strict';
registrar('flash', { nome: 'Flash Sheet', comum: 'Flashes', icone: 'raio', render(el) {
  const disp = S.flashes.filter(f => f.status === 'disponivel').length;
  el.innerHTML = `<div class="busca-bar"><button class="bt forte" data-a="novo">${ic('mais')}Novo flash</button><button class="bt tinta" data-a="story">${ic('insta')}Story da cartela</button>
    <span class="suave" style="font-size:.88rem">${disp} ${plural(disp, 'disponível', 'disponíveis')} no site · ${S.flashes.filter(f => f.status === 'tatuado').length} já ${plural(S.flashes.filter(f => f.status === 'tatuado').length, 'foi', 'foram')} pra pele</span></div>
  <div class="flashes-p">${S.flashes.map(f => { const vendas = S.pedidos.filter(p => p.flashId === f.id && p.status === 'feito').length, olho = S.pedidos.filter(p => p.flashId === f.id && ['novo', 'orcado'].includes(p.status)).length;
    return `<div class="fp ${f.status}"><button class="editar" data-ed="${f.id}" aria-label="Editar">${ic('lapis')}</button>${desenhoFlash(f)}<h4>${esc(f.nome)}</h4><span class="preco">${brl(f.preco)}</span>
      <span class="vendas">~${f.tamanho} cm · ${f.unico ? 'único' : 'repete'}${vendas ? ` · tatuado ${vendas}x` : ''}${olho ? ` · 👀 ${olho} de olho` : ''}</span>
      <div class="seg">${[['disponivel', 'livre'], ['reservado', 'reserv.'], ['tatuado', 'tatuado']].map(([k, n]) => `<button class="${f.status === k ? 'sel' : ''}" data-st="${f.id}:${k}">${n}</button>`).join('')}</div></div>`; }).join('')}</div>`;
  el.addEventListener('click', e => { const a = e.target.closest('[data-a]')?.dataset.a; if (a === 'novo') editarFlash(); if (a === 'story') storyCartela();
    const ed = e.target.closest('[data-ed]'); if (ed) editarFlash(ed.dataset.ed);
    const st = e.target.closest('[data-st]'); if (st) { const [id, k] = st.dataset.st.split(':'); const f = flash(id); if (f.status === k) return; f.status = k; salvarE(); if (k === 'tatuado') { FX.carimbo('Tatuado', f.nome, 'var(--verm)'); } else Som.toque(); } });
} });
const desenhoFlash = f => f.imagem ? `<img class="flash-img" src="${f.imagem}" alt="">` : flashSVG(f.desenho);
function editarFlash(id) {
  const f = id ? flash(id) : { id: novoId('f'), desenho: 'caracol', nome: '', preco: 300, tamanho: 10, horas: 2, unico: true, status: 'disponivel', criadoEm: Date.now() }; let des = f.desenho, img = f.imagem || '';
  const j = janela(`<h2>${id ? 'Editar flash' : 'Novo flash'}</h2><div class="form">
    <div class="campo"><span>Desenho</span><div class="escolhe-desenho" id="eD">${Object.keys(DESENHOS).map(k => `<button class="${!img && des === k ? 'sel' : ''}" data-d="${k}" title="${esc(NOMES_DESENHO[k])}">${flashSVG(k)}</button>`).join('')}
      <label class="bt leve peq" style="height:auto;white-space:normal;text-align:center">${ic('camera')}Foto do papel<input type="file" accept="image/*" hidden id="eI"></label></div>${img ? `<img src="${img}" alt="" style="width:110px;border-radius:10px;margin-top:8px" id="eIp">` : ''}</div>
    <label class="campo"><span>Nome</span><input id="eN" value="${esc(f.nome)}" placeholder="Ex.: Caveira florida"></label>
    <div class="linha3"><label class="campo"><span>Preço</span><input id="eP" inputmode="decimal" value="${f.preco}"></label><label class="campo"><span>Tamanho (cm)</span><input id="eT" type="number" value="${f.tamanho}"></label><label class="campo"><span>Horas</span><input id="eH" type="number" step=".5" value="${f.horas}"></label></div>
    <label class="check"><input type="checkbox" id="eU" ${f.unico ? 'checked' : ''}><span>Único: tatuou uma vez, sai da cartela</span></label>
    <div class="bts"><button class="bt forte" id="eOk">${ic('check')}Salvar</button>${id ? '<button class="bt leve" id="eX">Tirar da cartela</button>' : ''}</div></div>`);
  j.$('#eD').addEventListener('click', e => { const b = e.target.closest('[data-d]'); if (!b) return; des = b.dataset.d; img = ''; j.$('#eIp')?.remove(); $$('#eD button', j.el).forEach(x => x.classList.toggle('sel', x === b)); if (!j.$('#eN').value) j.$('#eN').value = NOMES_DESENHO[des]; });
  j.$('#eI').addEventListener('change', e => { const a = e.target.files[0]; if (!a) return; reduzir(a, 600).then(u => { img = u; $$('#eD button', j.el).forEach(x => x.classList.remove('sel')); j.$('#eIp')?.remove(); j.$('#eD').insertAdjacentHTML('afterend', `<img src="${u}" alt="" style="width:110px;border-radius:10px;margin-top:8px" id="eIp">`); }); });
  j.$('#eOk').onclick = () => { const nome = j.$('#eN').value.trim() || NOMES_DESENHO[des] || 'Flash'; Object.assign(f, { desenho: des, imagem: img || undefined, nome, preco: num(j.$('#eP').value) || f.preco, tamanho: +j.$('#eT').value || 10, horas: +j.$('#eH').value || 2, unico: j.$('#eU').checked });
    if (!id) S.flashes.unshift(f); j.fechar(); salvarE(); if (!id) { FX.carimbo('Na cartela!', nome, 'var(--ouro)'); } else toast('Flash salvo'); };
  j.$('#eX')?.addEventListener('click', async () => { if (await pergunta('Tirar esse flash da cartela?', { sim: 'Tirar', perigo: true })) { S.flashes = S.flashes.filter(x => x.id !== f.id); j.fechar(); salvarE(() => toast('Saiu da cartela')); } });
}
function reduzir(arq, max) { return new Promise((ok, erro) => { const r = new FileReader(); r.onerror = erro; r.onload = () => { const im = new Image(); im.onerror = erro; im.onload = () => { const k = Math.min(1, max / Math.max(im.width, im.height)), cv = document.createElement('canvas'); cv.width = im.width * k; cv.height = im.height * k; cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); ok(cv.toDataURL('image/jpeg', .78)); }; im.src = r.result; }; r.readAsDataURL(arq); }); }
const carregaImg = src => new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src; });
async function storyCartela() {
  const l = S.flashes.filter(f => f.status === 'disponivel').slice(0, 9); if (!l.length) { toast('Nenhum flash disponível', 'alerta'); return; }
  await document.fonts.ready; const W = 1080, H = 1920, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
  c.fillStyle = '#efe7d6'; c.fillRect(0, 0, W, H); c.strokeStyle = 'rgba(0,0,0,.06)'; c.lineWidth = 2; for (let x = 0; x < W; x += 54) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); } for (let y = 0; y < H; y += 54) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
  for (const [cor, x, y, r] of [['rgba(255,62,165,.18)', 140, 260, 260], ['rgba(32,212,234,.16)', 960, 1600, 300], ['rgba(212,255,59,.22)', 900, 380, 200]]) { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, cor); g.addColorStop(1, 'transparent'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
  c.fillStyle = '#141114'; c.textAlign = 'center'; c.font = '128px Marker'; c.save(); c.translate(W / 2, 230); c.rotate(-.04); c.fillText('FLASHES', 0, 0); c.restore();
  c.font = '800 46px Stencil'; c.fillStyle = '#c0185f'; c.fillText('DISPONÍVEIS · ESCOLHE O TEU', W / 2, 310);
  const cols = 3, cw = 300, ch = 400, x0 = (W - cols * cw - 2 * 30) / 2, y0 = 390;
  for (let i = 0; i < l.length; i++) { const f = l[i], cx = x0 + (i % cols) * (cw + 30), cy = y0 + Math.floor(i / cols) * (ch + 34), rot = ROTS_S[i % ROTS_S.length];
    c.save(); c.translate(cx + cw / 2, cy + ch / 2); c.rotate(rot); c.shadowColor = 'rgba(0,0,0,.25)'; c.shadowBlur = 24; c.shadowOffsetY = 10; c.fillStyle = '#fffdf6'; c.fillRect(-cw / 2, -ch / 2, cw, ch); c.shadowColor = 'transparent';
    c.fillStyle = 'rgba(240,230,190,.75)'; c.fillRect(-50, -ch / 2 - 14, 100, 30);
    const src = f.imagem || 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(flashSVG(f.desenho).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" '));
    const im = await carregaImg(src); if (im) c.drawImage(im, -115, -ch / 2 + 22, 230, 230);
    c.fillStyle = '#141114'; c.font = '38px Marker'; c.fillText(f.nome.length > 15 ? f.nome.slice(0, 14) + '…' : f.nome, 0, ch / 2 - 92); c.font = '900 52px Stencil'; c.fillText(brl(f.preco), 0, ch / 2 - 32);
    if (f.unico) { c.save(); c.translate(cw / 2 - 52, -ch / 2 + 30); c.rotate(.12); c.strokeStyle = '#c0185f'; c.lineWidth = 3; c.strokeRect(-40, -18, 80, 34); c.fillStyle = '#c0185f'; c.font = '800 22px Stencil'; c.fillText('ÚNICO', 0, 7); c.restore(); }
    c.restore(); }
  const r = estouEm(), par = paradas({ dias: 40 }).filter(p => S.regioes.some(x => x.id === p.reg)).slice(0, 3);
  c.fillStyle = '#141114'; c.fillRect(0, H - 250, W, 250); c.fillStyle = '#d4ff3b'; c.font = '62px Marker'; c.fillText('Japa Oneightwo 🐌', W / 2, H - 160);
  c.fillStyle = '#f2ede4'; c.font = '700 34px Grotesk'; c.fillText('Tattoo a domicílio · ' + par.map(p => `${regiao(p.reg).curto} ${dataBR(p.ini)}`).join(' · '), W / 2, H - 100);
  c.fillStyle = '#a59e96'; c.font = '600 30px Grotesk'; c.fillText('Chama no direct ou no WhatsApp', W / 2, H - 52);
  const url = cv.toDataURL('image/png');
  const j = janela(`<h2>Story da cartela</h2><img class="story-prev" src="${url}" alt="Prévia do story"><div class="bts" style="margin-top:14px;justify-content:center"><a class="bt forte" download="flashes-japa-${dataAno(Date.now()).replace(/\//g, '-')}.png" href="${url}">${ic('baixar')}Baixar PNG</a></div><p class="suave" style="text-align:center;font-size:.85rem">1080 × 1920, no tamanho do story.</p>`);
  void j; Som.plim();
}
const ROTS_S = [-.04, .03, -.02, .035, -.03, .02, .04, -.035, .015];
