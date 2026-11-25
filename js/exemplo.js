/* Japa Oneightwo — dados de EXEMPLO da demonstração (inventados; semente fixa: sempre os mesmos).
   ~5 meses de rota, clientes, tattoos, caixa e pedidos chegando. As datas andam com o calendário. */
'use strict';
function exemploEstado() {
  let semente = 1820; const rnd = () => { semente |= 0; semente = semente + 0x6D2B79F5 | 0; let t = Math.imul(semente ^ semente >>> 15, 1 | semente); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const pega = a => a[Math.floor(rnd() * a.length)], entre = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const H = hoje0(), dt = (d, h = 0, m = 0) => somaDias(H, d) + (h * 60 + m) * MIN;
  const regioes = JSON.parse(JSON.stringify(REGIOES_PADRAO)), cidades = JSON.parse(JSON.stringify(CIDADES_PADRAO));
  const E = {
    versao: VERSAO, exemplo: true, geradoEm: H, comecoDoZero: false,
    artista: { nome: 'Japa Oneightwo', fone: '54981450982', insta: 'japa_182tattoo', email: '', cidadeBase: 'Bento Gonçalves', lema: 'O estúdio anda comigo.' },
    config: { base: 180, porCm: 3.2, minimo: 250, horasSessao: 5, horasDia: 9, horaInicio: 10, sinalPct: 30, sinalMin: 100, metaMes: 22000, metaTattoos: 26, retoqueGratisDias: 45, custoKm: .85 },
    regioes, cidades, rota: [], eventos: [], clientes: [], pedidos: [], sessoes: [], caixa: [], flashes: [], mochila: [], kit: [], kitFeito: {}, novidades: [], cuidadosEnviados: {},
    mensagens: {
      orcamento: 'Salve, {nome}! 🐌 Aqui é o Japa. Vi tua ideia ({ideia}) no {local}. Fica em {valor}, {sessoes}. Pra garantir a data, o sinal é de {sinal} no Pix. Tô em {regiao} nos dias {datas}. Bora?',
      confirmacao: 'Fechado, {nome}! {data} às {hora} eu chego aí em {cidade} com o estúdio na mochila. 🐌🔥 Come bem antes, bebe bastante água e nada de álcool na véspera.',
      lembrete: 'E aí, {nome}! Amanhã é o dia: {hora} tô chegando em {cidade}. Separa um cantinho com mesa e tomada perto. Qualquer coisa me chama. 🐌',
      cuidado: 'Oi, {nome}! {fase} da tua tattoo. {dica} Manda uma foto pra eu ver como tá! 🐌',
      aniversario: 'Feliz aniversário, {nome}! 🎉 Presente do caracol: 10% numa tattoo até o fim do mês. 🐌🔥',
    },
  };

  /* rota: blocos de dias em cada região (domingo é folga quando ele tá na Serra) */
  const frente = [['serra', 7], ['poa', 4], ['serra', 6], ['evento', 2], ['serra', 5], ['litoral', 7], ['serra', 8], ['poa', 4], ['serra', 9], ['litoral', 6], ['serra', 10], ['poa', 3], ['serra', 8]];
  const tras = [['poa', 4], ['serra', 8], ['litoral', 6], ['serra', 9], ['poa', 3], ['serra', 7], ['evento', 1], ['serra', 10], ['litoral', 5], ['serra', 8], ['poa', 4], ['serra', 9], ['litoral', 6], ['serra', 12], ['poa', 3], ['serra', 15]];
  const marca = (d, reg) => { const dom = new Date(dt(d)).getDay() === 0; E.rota.push({ dia: dt(d), reg: reg === 'serra' && dom ? 'folga' : reg }); };
  let d = -3; for (const [reg, n] of frente) for (let i = 0; i < n; i++) marca(d++, reg);
  d = -4; for (const [reg, n] of tras) for (let i = 0; i < n; i++) marca(d--, reg);
  E.rota.sort((a, b) => a.dia - b.dia);
  const evts = E.rota.filter(r => r.reg === 'evento'); const nomesEv = ['Festival Mata Adentro', 'Feira Underground da Serra'];
  const blocosEv = []; for (const r of evts) { const b = blocosEv.find(b => b.fim === r.dia - DIA || Math.abs(b.fim - r.dia) <= DIA + 4 * HORA); if (b) b.fim = r.dia; else blocosEv.push({ ini: r.dia, fim: r.dia }); }
  blocosEv.forEach((b, i) => { const nome = nomesEv[i % 2] + ' (exemplo)'; E.eventos.push({ id: 'ev' + i, nome, ini: b.ini, fim: b.fim, cidade: i % 2 ? 'Caxias do Sul' : 'Gramado', txt: i % 2 ? 'Estande com flash a preço de evento.' : 'Tattoo no meio da mata, entre um set e outro.' });
    for (const r of E.rota) if (r.dia >= b.ini && r.dia <= b.fim) r.nota = nome; });

  /* flashes */
  const precos = { caracol: 280, adaga: 450, coracao: 380, olho: 350, caveira: 420, raio: 250, lua: 320, pedras: 300, onda: 520, cogumelo: 300, ancora: 280 };
  Object.keys(DESENHOS).forEach((k, i) => E.flashes.push({ id: 'f' + i, desenho: k, nome: NOMES_DESENHO[k], preco: precos[k], tamanho: k === 'onda' ? 14 : entre(7, 12), horas: k === 'onda' ? 3 : 2, unico: i % 3 !== 2, status: 'disponivel', criadoEm: dt(-entre(5, 90)) }));

  /* clientes */
  // nomes e sobrenomes comuns, escolhidos para NÃO coincidir com pessoas marcadas no Instagram do Japa (a demo pode ficar pública)
  const nomes = ['Ana', 'Gabriel', 'Lívia', 'Vitor', 'Sofia', 'Rafael', 'Helena', 'Bruno', 'Clara', 'Daniel', 'Marina', 'Caio', 'Beatriz', 'Otávio', 'Lara', 'Samuel', 'Isadora', 'Arthur', 'Valentina', 'Enzo', 'Manuela', 'Davi', 'Alice', 'Heitor', 'Laura', 'Miguel', 'Cecília', 'Theo', 'Luíza', 'Gustavo', 'Elisa', 'Nicolas', 'Joana', 'Bento', 'Melissa', 'Joaquim', 'Antônia', 'Lorenzo', 'Pietra', 'Benício', 'Olívia', 'Ravi', 'Catarina', 'Murilo', 'Heloísa', 'Vicente', 'Mirela', 'Teodoro'];
  const sobren = ['Silva', 'Souza', 'Costa', 'Pereira', 'Almeida', 'Nunes', 'Carvalho', 'Teixeira', 'Rocha', 'Dias', 'Martins', 'Barros', 'Freitas', 'Moura', 'Cardoso', 'Lopes', 'Mendes', 'Pinto', 'Ribeiro', 'Gomes', 'Araújo', 'Campos', 'Fonseca', 'Monteiro'];
  const novoCliente = reg => { const nome = pega(nomes) + ' ' + pega(sobren), cid = pega(cidades[reg].slice(0, reg === 'serra' ? 8 : 5))[0];
    const c = { id: 'c' + E.clientes.length, nome, fone: '5499' + String(1000000 + E.clientes.length * 7919 % 8999999).slice(0, 7), insta: nome.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '.') + (rnd() < .5 ? '_' : ''),
      cidade: cid, reg, nascimento: rnd() < .7 ? `${String(entre(1, 28)).padStart(2, '0')}/${String(entre(1, 12)).padStart(2, '0')}/${entre(1980, 2005)}` : '', desde: 0, obs: '', ficha: null, endereco: `Rua ${pega(['das Hortênsias', 'Garibaldi', 'Silveira Martins', 'XV de Novembro', 'dos Ipês', 'Marechal Deodoro', 'Bento Gonçalves', 'das Araucárias'])}, ${entre(20, 1900)}` };
    if (rnd() < .8) c.ficha = { alergias: rnd() < .15 ? pega(['Látex', 'Níquel', 'Dipirona']) : '', saude: rnd() < .1 ? pega(['Diabetes tipo 1 (controlada)', 'Hipertensão', 'Toma anticoagulante']) : '', assinadaEm: 0, assinatura: '' };
    E.clientes.push(c); return c; };
  for (const reg of ['serra', 'serra', 'serra', 'poa', 'litoral']) for (let i = 0; i < 8; i++) novoCliente(reg);
  // aniversário de alguém nesta semana, para a tela de hoje ter o que mostrar
  const hj = new Date(somaDias(H, 2)); E.clientes[3].nascimento = `${String(hj.getDate()).padStart(2, '0')}/${String(hj.getMonth() + 1).padStart(2, '0')}/1996`;
  const doReg = reg => { const l = E.clientes.filter(c => c.reg === reg); return rnd() < .62 ? pega(l) : novoCliente(reg); };

  const IDEIAS = [['Carpa subindo a cachoeira com flor de cerejeira', 'oriental', true], ['Retrato da minha cachorra Mel', 'realismo', false], ['Caveira em aquarela com borboletas', 'aquarela', true], ['A palavra "Respira" em caligrafia criminal', 'lettering', false],
    ['Lobo uivando pra lua cheia', 'realismo', false], ['Personagem de DJ com fone, bem colorido', 'newschool', true], ['Mandala pontilhada', 'blackwork', false], ['Rosa com adaga, old school raiz', 'oldschool', true],
    ['Montanhas da Serra com araucárias', 'fineline', false], ['Olho que chora com um raio', 'blackwork', false], ['Dragão oriental subindo pelas costas', 'oriental', true], ['Nome da minha filha com estrelinhas', 'lettering', false],
    ['Cogumelos e um sol psicodélico', 'newschool', true], ['Pedras empilhadas na beira do rio', 'fineline', false], ['Virgem Maria com terço', 'realismo', false], ['Andorinha e âncora pro meu avô', 'oldschool', true]];
  const zonasComuns = ['antebraco-d', 'antebraco-e', 'braco-d', 'braco-e', 'perna-d', 'coxa-e', 'costela-d', 'ombro-e', 'peito', 'costas', 'mao-d', 'nuca', 'panturrilha'].filter(z => ZONAS[z]);
  const novoPedido = (c, base, extra = {}) => { const [ideia, est, cor] = pega(IDEIAS), costas = /costas/.test(ideia), tam = costas ? 40 : pega([6, 8, 10, 12, 15, 18, 22]), zona = costas ? 'costas' : pega(zonasComuns);
    const e = estimativa.call(null, { tipo: 'exclusiva', tamanho: tam, estilo: est, cor, zona }), valor = arred((e.min + e.max) / 2, 50);
    const p = { id: 'p' + E.pedidos.length, clienteId: c.id, tipo: 'exclusiva', ideia, estilo: est, cor, tamanho: tam, zona, reg: c.reg, cidade: c.cidade, endereco: c.endereco, refs: [], datas: [], origem: pega(['site', 'whats', 'insta']),
      estimativa: e, valor, sinal: 0, sessoesPrev: e.sessoes, status: 'novo', criadoEm: base - entre(6, 20) * DIA, hist: [], ...extra };
    E.pedidos.push(p); return p; };
  const Sprev = S; S = E; // estimativa() e taxaDeslocamento() leem S

  /* passado: sessões feitas em cada dia de trabalho */
  const passado = E.rota.filter(r => r.dia < H && ['serra', 'poa', 'litoral'].includes(r.reg));
  for (const r of passado) {
    const n = r.reg === 'serra' ? (rnd() < .42 ? 1 : rnd() < .22 ? 2 : 0) : (rnd() < .45 ? 1 : 2);
    for (let k = 0; k < n; k++) {
      const c = doReg(r.reg), usaFlash = rnd() < .22, fl = usaFlash ? pega(E.flashes) : null;
      const p = usaFlash ? (() => { const x = novoPedido(c, r.dia, { tipo: 'flash', flashId: fl.id, ideia: 'Flash: ' + fl.nome, estilo: 'oldschool', cor: true, tamanho: fl.tamanho }); x.valor = fl.preco; return x; })() : novoPedido(c, r.dia);
      if (!c.desde || c.desde > p.criadoEm) c.desde = p.criadoEm;
      const ini = r.dia + ((k === 0 ? 10 : 15) * 60 + (k === 0 ? 30 : 0)) * MIN, dur = Math.min(300, Math.round((p.estimativa?.horas || 2) * 60 / 30) * 30) || 120;
      const taxa = taxaDeslocamento(r.reg, c.cidade);
      p.status = 'feito'; p.sinal = sinalDe(p.valor); p.sinalEm = p.criadoEm + 2 * DIA; p.taxa = taxa;
      const s = { id: 's' + E.sessoes.length, pedidoId: p.id, clienteId: c.id, inicio: ini, duracao: dur, status: 'feita', valor: p.valor - p.sinal, taxa, pago: true, cidade: c.cidade, reg: r.reg, endereco: c.endereco, km: kmDe(r.reg, c.cidade) };
      E.sessoes.push(s);
      E.caixa.push({ id: 'l' + E.caixa.length, ts: p.sinalEm, tipo: 'entrada', cat: 'sinal', valor: p.sinal, forma: 'pix', clienteId: c.id, pedidoId: p.id, desc: 'Sinal · ' + primeiro(c.nome) });
      E.caixa.push({ id: 'l' + E.caixa.length, ts: ini + dur * MIN, tipo: 'entrada', cat: usaFlash ? 'flash' : 'sessao', valor: s.valor, forma: pega(['pix', 'pix', 'pix', 'dinheiro', 'cartao']), clienteId: c.id, pedidoId: p.id, desc: (usaFlash ? 'Flash ' + fl.nome : 'Sessão') + ' · ' + primeiro(c.nome) });
      if (taxa) E.caixa.push({ id: 'l' + E.caixa.length, ts: ini + dur * MIN, tipo: 'entrada', cat: 'deslocamento', valor: taxa, forma: 'pix', clienteId: c.id, pedidoId: p.id, desc: 'Deslocamento · ' + c.cidade });
      if (usaFlash && fl.unico && rnd() < .5 && E.flashes.filter(x => x.status === 'tatuado').length < 2) fl.status = 'tatuado';
    }
    // custos da estrada
    const custo = (cat, valor, desc) => E.caixa.push({ id: 'l' + E.caixa.length, ts: r.dia + 20 * HORA, tipo: 'saida', cat, valor, forma: 'cartao', desc });
    if (r.reg === 'serra' && rnd() < .35) custo('combustivel', entre(60, 140), 'Gasolina · Serra');
    const ant = E.rota.find(x => x.dia === r.dia - DIA);
    if (r.reg !== 'serra' && (!ant || ant.reg !== r.reg)) { // primeiro dia da viagem
      if (r.reg === 'poa') { custo('combustivel', 190, 'Gasolina ida e volta · POA'); custo('pedagio', 34, 'Pedágio · BR-386'); }
      else { custo('combustivel', 520, 'Gasolina ida e volta · Litoral SC'); custo('pedagio', 48, 'Pedágio · BR-101'); }
    }
    if (r.reg !== 'serra') { custo('hospedagem', r.reg === 'poa' ? 110 : 140, 'Hospedagem · ' + DIA_TIPOS[r.reg]); custo('alimentacao', entre(45, 80), 'Rango na estrada'); }
  }
  // eventos: flash vendido no estande
  for (const ev of E.eventos) if (ev.fim < H) for (let i = 0; i < entre(3, 5); i++) E.caixa.push({ id: 'l' + E.caixa.length, ts: ev.ini + (13 + i) * HORA, tipo: 'entrada', cat: 'evento', valor: pega([200, 250, 300]), forma: pega(['pix', 'dinheiro']), desc: 'Flash no estande · ' + ev.nome.replace(' (exemplo)', '') });
  // material todo mês
  for (let m = 0; m < 7; m++) E.caixa.push({ id: 'l' + E.caixa.length, ts: somaDias(mesAntes(H, m), 4) + 11 * HORA, tipo: 'saida', cat: 'material', valor: entre(380, 620), forma: 'cartao', desc: 'Reposição de material' });

  /* hoje: duas sessões, para o "Rolê" ter vida */
  const hojeReg = rotaDe(H).reg === 'folga' ? 'serra' : rotaDe(H).reg;
  if (rotaDe(H).reg !== hojeReg) { const r = E.rota.find(x => x.dia === H); if (r) r.reg = hojeReg; else E.rota.push({ dia: H, reg: hojeReg }); }
  const agenda = (dia, h, c, p, dur, status = 'marcada') => { const s = { id: 's' + E.sessoes.length, pedidoId: p.id, clienteId: c.id, inicio: dt(dia, h, h % 1 ? 0 : 0), duracao: dur, status, valor: p.valor - p.sinal, taxa: taxaDeslocamento(p.reg, c.cidade), pago: false, cidade: c.cidade, reg: p.reg, endereco: c.endereco, km: kmDe(p.reg, c.cidade) }; E.sessoes.push(s); return s; };
  const fechar = (c, extra, quantoAntes = 8) => { const p = novoPedido(c, H, extra); p.status = 'agendado'; p.sinal = sinalDe(p.valor); p.sinalEm = H - quantoAntes * DIA; p.taxa = taxaDeslocamento(p.reg, c.cidade);
    E.caixa.push({ id: 'l' + E.caixa.length, ts: p.sinalEm, tipo: 'entrada', cat: 'sinal', valor: p.sinal, forma: 'pix', clienteId: c.id, pedidoId: p.id, desc: 'Sinal · ' + primeiro(c.nome) }); return p; };
  const serraCli = E.clientes.filter(c => c.reg === hojeReg);
  const c1 = serraCli[1], c2 = serraCli[5];
  if (c1.ficha) c1.ficha.alergias = 'Látex'; c1.ficha = c1.ficha || { alergias: 'Látex', saude: '', assinadaEm: 0 };
  const p1 = fechar(c1, { ideia: 'Carpa subindo a cachoeira com flor de cerejeira', estilo: 'oriental', cor: true, tamanho: 18, zona: 'antebraco-e', valor: 1300 }); p1.valor = 1300; p1.sinal = sinalDe(1300);
  agenda(0, 10.5, c1, p1, 270, 'confirmada').inicio = dt(0, 10, 30);
  const p2 = fechar(c2, { tipo: 'flash', flashId: 'f0', ideia: 'Flash: Caracol nômade', estilo: 'oldschool', cor: true, tamanho: 9, zona: 'perna-d' }); p2.valor = 280; p2.sinal = 100; E.flashes[0].status = 'reservado';
  agenda(0, 16, c2, p2, 120);
  // um projeto grande em sessões: fechamento oriental nas costas (2 feitas, 1 marcada)
  const cb = E.clientes.find(c => c.reg === 'serra' && c.id !== c1.id && c.id !== c2.id);
  const pb = novoPedido(cb, dt(-70), { ideia: 'Fechamento oriental nas costas: dragão, ondas e peônias', estilo: 'oriental', cor: true, tamanho: 45, zona: 'costas', sessoesPrev: 3 }); pb.valor = 4800; pb.sinal = 800; pb.sinalEm = dt(-62); pb.status = 'agendado'; pb.taxa = 0;
  E.caixa.push({ id: 'l' + E.caixa.length, ts: pb.sinalEm, tipo: 'entrada', cat: 'sinal', valor: 800, forma: 'pix', clienteId: cb.id, pedidoId: pb.id, desc: 'Sinal · ' + primeiro(cb.nome) });
  for (const [dd, st] of [[-48, 'feita'], [-20, 'feita'], [9, 'marcada']]) { const s = agenda(dd, 11, cb, pb, 330, st); s.inicio = dt(dd, 11); s.valor = 1333; if (st === 'feita') { s.pago = true; E.caixa.push({ id: 'l' + E.caixa.length, ts: s.inicio + 6 * HORA, tipo: 'entrada', cat: 'sessao', valor: 1333, forma: 'pix', clienteId: cb.id, pedidoId: pb.id, desc: 'Sessão ' + (dd === -48 ? '1' : '2') + '/3 · ' + primeiro(cb.nome) }); } }
  for (const r of E.rota) if (r.dia === dt(9) || r.dia === dt(-20) || r.dia === dt(-48)) r.reg = 'serra';

  /* próximos dias: sessões marcadas na região em que ele vai estar */
  let marcadas = 0;
  for (const r of E.rota) { if (r.dia <= H || r.dia > dt(24) || !['serra', 'poa', 'litoral'].includes(r.reg) || marcadas > 13) continue;
    if (rnd() < .5) { const c = doReg(r.reg); const p = fechar(c, {}, entre(2, 12)); const dur = Math.min(300, Math.round(p.estimativa.horas * 2) * 30) || 120; const s = agenda(diasAte(r.dia), 11, c, p, dur, rnd() < .5 ? 'confirmada' : 'marcada'); s.inicio = r.dia + 11 * HORA; marcadas++; } }

  /* pedidos na esteira: chegaram pelo site, orçados, com sinal esperando data */
  const chegou = (reg, extra, hAtras) => { const c = doReg(reg); const p = novoPedido(c, H, extra); p.criadoEm = Date.now() - hAtras * HORA; p.origem = 'site'; p.status = 'novo';
    p.datas = diasNaRegiao(reg).slice(0, 3); return p; };
  const n1 = chegou('poa', { ideia: 'Lobo uivando pra lua cheia, no antebraço todo', estilo: 'realismo', cor: false, tamanho: 20, zona: 'antebraco-d' }, 2);
  const n2 = chegou('litoral', { ideia: 'Onda com sol nascendo, lembrança da Praia do Rosa', estilo: 'aquarela', cor: true, tamanho: 12, zona: 'costela-e' }, 9);
  const n3 = chegou('serra', { tipo: 'customizacao', peca: 'jaqueta', ideia: 'Jaqueta jeans com caveira e cobras nas costas', estilo: 'newschool', cor: true, tamanho: 0, zona: null }, 20);
  const n4 = chegou('serra', { tipo: 'flash', flashId: 'f4', ideia: 'Flash: Caveira florida', estilo: 'oldschool', cor: true, tamanho: 10, zona: 'ombro-d' }, 30); n4.valor = 420;
  for (const p of [n1, n2, n3, n4]) { if (p.tipo === 'customizacao') { p.estimativa = estimativa({ tipo: 'customizacao', peca: p.peca }); p.valor = 0; } if (p.tipo === 'exclusiva') p.estimativa = estimativa(p); }
  E.novidades.push({ id: 'n0', tipo: 'pedido', ref: n1.id, txt: 'Pedido novo de ' + primeiro(cliente(n1.clienteId).nome), ts: n1.criadoEm, visto: false }, { id: 'n1', tipo: 'pedido', ref: n2.id, txt: 'Pedido novo de ' + primeiro(cliente(n2.clienteId).nome), ts: n2.criadoEm, visto: false });
  for (let i = 0; i < 3; i++) { const c = doReg(pega(['serra', 'poa'])); const p = novoPedido(c, H); p.status = 'orcado'; p.orcadoEm = Date.now() - entre(10, 60) * HORA; p.estimativa = estimativa(p); p.datas = diasNaRegiao(c.reg).slice(0, 2); }
  { const c = doReg('litoral'); const p = novoPedido(c, H); p.status = 'sinal'; p.sinal = sinalDe(p.valor); p.sinalEm = Date.now() - 30 * HORA; p.estimativa = estimativa(p); p.datas = diasNaRegiao('litoral').slice(0, 2);
    E.caixa.push({ id: 'l' + E.caixa.length, ts: p.sinalEm, tipo: 'entrada', cat: 'sinal', valor: p.sinal, forma: 'pix', clienteId: c.id, pedidoId: p.id, desc: 'Sinal · ' + primeiro(c.nome) }); }
  { const c = E.clientes.find(c => c.reg === 'serra' && c.nome.startsWith('Clara')) || doReg('serra'); const p = novoPedido(c, H, { tipo: 'customizacao', peca: 'tenis', ideia: 'Tênis branco com chamas e o nome da banda', estilo: 'newschool', cor: true, tamanho: 0, zona: null });
    p.status = 'agendado'; p.estimativa = estimativa({ tipo: 'customizacao', peca: 'tenis' }); p.valor = 520; p.sinal = 160; p.sinalEm = dt(-5); p.entrega = dt(6); p.progresso = 60;
    E.caixa.push({ id: 'l' + E.caixa.length, ts: p.sinalEm, tipo: 'entrada', cat: 'sinal', valor: 160, forma: 'pix', clienteId: c.id, pedidoId: p.id, desc: 'Sinal customização · ' + primeiro(c.nome) }); }

  /* mochila: estoque e o kit de saída */
  const it = (nome, cat, qtd, min, un, custo) => E.mochila.push({ id: 'm' + E.mochila.length, nome, cat, qtd, min, un, custo });
  it('Cartuchos RL (traço)', 'agulha', 34, 20, 'un', 4.5); it('Cartuchos RM / Magnum (pintura)', 'agulha', 12, 20, 'un', 5); it('Cartuchos RS (sombra)', 'agulha', 22, 15, 'un', 4.8);
  it('Tinta preta de traço', 'tinta', 2, 1, 'frasco', 85); it('Tinta preta de sombra', 'tinta', 1, 1, 'frasco', 80); it('Kit de cores (12)', 'tinta', 1, 1, 'kit', 390); it('Branco de luz', 'tinta', 0, 1, 'frasco', 60);
  it('Luvas nitrílicas pretas', 'descartavel', 46, 50, 'pares', .9); it('Filme PVC', 'descartavel', 2, 1, 'rolo', 22); it('Filme cicatrizante', 'descartavel', 1, 1, 'rolo', 120); it('Papel toalha', 'descartavel', 6, 4, 'rolo', 4);
  it('Lençol descartável de maca', 'descartavel', 8, 10, 'un', 3.2); it('Barreira de máquina / clip cord', 'descartavel', 40, 25, 'un', .6); it('Batoques de tinta', 'descartavel', 300, 100, 'un', .05);
  it('Papel hectográfico (stencil)', 'stencil', 18, 20, 'folhas', 2.8); it('Gel de transferência', 'stencil', 1, 1, 'frasco', 45);
  it('Álcool 70%', 'higiene', 2, 1, 'litro', 14); it('Clorexidina 2%', 'higiene', 1, 1, 'frasco', 18); it('Sabonete neutro', 'higiene', 3, 2, 'frasco', 9); it('Vaselina / pomada de sessão', 'higiene', 1, 1, 'pote', 25);
  it('Saco de lixo infectante', 'higiene', 9, 10, 'un', .8); it('Caixa de perfurocortante', 'higiene', 1, 1, 'un', 12);
  E.kit = ['Máquina pen + bateria carregada (e a reserva)', 'Cartuchos do dia', 'Tintas do desenho', 'Stencil impresso (e um extra)', 'Luvas', 'Filme PVC e filme cicatrizante', 'Álcool 70% e clorexidina', 'Lençol, barreiras e batoques', 'Lixo infectante e perfurocortante', 'Maca dobrável e luminária', 'Extensão elétrica', 'Ficha e termo do cliente'].map((t, i) => ({ id: 'k' + i, t }));

  // cuidados já mandados para quem tatuou nos últimos dias
  for (const s of E.sessoes) if (s.status === 'feita' && s.inicio > H - 40 * DIA) for (const c of CUIDADOS) if (-diasAte(s.inicio) > c.dia) E.cuidadosEnviados[s.id + ':' + c.dia] = s.inicio + c.dia * DIA;
  // fichas assinadas de quem já tatuou
  for (const c of E.clientes) if (c.ficha && E.sessoes.some(s => s.clienteId === c.id && s.status === 'feita')) { c.ficha.assinadaEm = c.desde + 3 * DIA; }
  for (const c of E.clientes) if (!c.desde) c.desde = dt(-entre(10, 140));
  S = Sprev; return E;
}
