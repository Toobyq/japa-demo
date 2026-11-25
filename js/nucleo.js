/* Japa Oneightwo — núcleo usado pelo site (index.html) e pelo painel (painel.html).
   Scripts clássicos, escopo global: funciona abrindo o arquivo direto do disco, sem servidor.
   Os dados ficam no navegador (localStorage) e as duas abas conversam pelo evento "storage".
   Na versão de verdade, os dados vão para um servidor e o pedido do site chega no celular do Japa. */
'use strict';
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const brl = n => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const fmt = n => Number(n || 0).toLocaleString('pt-BR');
const num = v => { if (typeof v === 'number') return v; const s = String(v || '').trim().replace(/\s|R\$/g, ''); if (!s) return 0; const n = s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s; return Number(n) || 0; };
const soDigitos = s => String(s || '').replace(/\D/g, '');
const primeiro = nome => String(nome || '').trim().split(/\s+/)[0];
const plural = (n, um, varios) => n === 1 ? um : varios;
const ic = (id, cls = '') => `<svg class="ic ${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
const novoId = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const MIN = 6e4, HORA = 36e5, DIA = 864e5;
const dia0 = ts => { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); };
const hoje0 = () => dia0(Date.now());
const somaDias = (ts, n) => { const d = new Date(ts); d.setDate(d.getDate() + n); return d.getTime(); };
const diasAte = ts => Math.round((dia0(ts) - hoje0()) / DIA);
const hora = ts => new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
const dataBR = ts => new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
const dataAno = ts => new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
const dataLonga = ts => new Date(ts).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
const semana = ts => new Date(ts).toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
const mesNome = (ts, curto) => new Date(ts).toLocaleDateString('pt-BR', { month: curto ? 'short' : 'long' }).replace('.', '');
const inicioMes = (ts = Date.now()) => { const d = new Date(ts); d.setHours(0, 0, 0, 0); d.setDate(1); return d.getTime(); };
const fimMes = (ts = Date.now()) => { const d = new Date(inicioMes(ts)); d.setMonth(d.getMonth() + 1); return d.getTime(); };
const noMes = (ts, ref = Date.now()) => ts >= inicioMes(ref) && ts < fimMes(ref);
const mesAntes = (ts, n) => { const d = new Date(inicioMes(ts)); d.setMonth(d.getMonth() - n); return d.getTime(); };
const quando = ts => { const d = diasAte(ts); if (d === 0) return 'hoje'; if (d === 1) return 'amanhã'; if (d === -1) return 'ontem'; if (d > 1 && d < 7) return semana(ts) + ' ' + dataBR(ts); if (d < -1 && d > -30) return 'há ' + (-d) + ' dias'; return dataAno(ts); };
const hmTxt = min => String(Math.floor(min / 60)).padStart(2, '0') + ':' + String(min % 60).padStart(2, '0');
const minDoDia = ts => { const d = new Date(ts); return d.getHours() * 60 + d.getMinutes(); };
const duracaoTxt = min => { const h = Math.floor(min / 60), m = min % 60; return h ? `${h}h${m ? String(m).padStart(2, '0') : ''}` : `${m} min`; };
const foneFmt = f => { let d = soDigitos(f); if (d.length === 13 && d.startsWith('55')) d = d.slice(2); if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`; if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`; return f || ''; };
const foneNorm = f => { let d = soDigitos(f); if (d.startsWith('55') && d.length >= 12) d = d.slice(2); if (d.length === 8 || d.length === 9) d = '54' + d; return d; };
const arred = (v, passo = 10) => Math.round(v / passo) * passo;

/* ---------- o mundo do Japa ---------- */
const REGIOES_PADRAO = [
  { id: 'serra', nome: 'Serra Gaúcha', curto: 'Serra', base: 'Bento Gonçalves', taxa: { tipo: 'km', gratisAte: 15, porKm: 2 }, frase: 'Casa. Montanha, vinho e cachoeira.' },
  { id: 'poa', nome: 'Porto Alegre e região', curto: 'POA', taxa: { tipo: 'fixa', valor: 120 }, frase: 'A capital, pôr do sol no Guaíba.' },
  { id: 'litoral', nome: 'Litoral de Santa Catarina', curto: 'Litoral SC', taxa: { tipo: 'fixa', valor: 150 }, frase: 'Temporada de praia. Tattoo com cheiro de mar.' },
];
const CIDADES_PADRAO = {
  serra: [['Bento Gonçalves', 0], ['Garibaldi', 12], ['Monte Belo do Sul', 15], ['Carlos Barbosa', 22], ['Farroupilha', 25], ['Veranópolis', 35], ['Caxias do Sul', 40], ['Flores da Cunha', 45], ['Nova Petrópolis', 70], ['Nova Prata', 60], ['Gramado', 100], ['Canela', 105]],
  poa: [['Porto Alegre', 125], ['Canoas', 115], ['Novo Hamburgo', 100], ['São Leopoldo', 105], ['Esteio', 110], ['Gravataí', 135], ['Viamão', 140]],
  litoral: [['Florianópolis', 470], ['Garopaba', 420], ['Imbituba (Praia do Rosa)', 400], ['Balneário Camboriú', 560], ['Itapema', 550], ['Bombinhas', 590], ['Itajaí', 570]],
};
const DIA_TIPOS = { serra: 'Serra', poa: 'POA', litoral: 'Litoral SC', folga: 'Folga', evento: 'Evento' };
const ESTILOS = [
  { id: 'blackwork', nome: 'Blackwork', f: 1, cor: false, txt: 'Preto chapado, pontilhismo, flor de traço firme.' },
  { id: 'realismo', nome: 'Realismo', f: 1.45, cor: false, txt: 'Preto e cinza com sombra de verdade: rosto, bicho, fé.' },
  { id: 'aquarela', nome: 'Aquarela', f: 1.3, cor: true, txt: 'Tinta que escorre, cor que explode.' },
  { id: 'newschool', nome: 'New School', f: 1.35, cor: true, txt: 'Cartoon, cor saturada, personagem com atitude.' },
  { id: 'oldschool', nome: 'Old School', f: 1.1, cor: true, txt: 'Traço grosso e cor chapada. Premiado.', premio: true },
  { id: 'oriental', nome: 'Oriental', f: 1.3, cor: true, txt: 'Onda, carpa, dragão, flor de cerejeira.' },
  { id: 'lettering', nome: 'Lettering', f: .9, cor: false, txt: 'Caligrafia criminal, letra que tem peso.' },
  { id: 'fineline', nome: 'Fine line', f: .9, cor: false, txt: 'Traço fino, delicado, minimalista.' },
];
const estilo = id => ESTILOS.find(e => e.id === id) || ESTILOS[0];
const TIPOS = {
  flash: { nome: 'Flash', txt: 'Um desenho pronto da cartela. Preço fechado.', icone: 'raio' },
  exclusiva: { nome: 'Arte exclusiva', txt: 'Tua ideia vira um desenho só teu.', icone: 'lapis' },
  customizacao: { nome: 'Customização', txt: 'Jaqueta, tênis, boné, tela, peça do pet.', icone: 'tesoura' },
  retoque: { nome: 'Retoque / cobertura', txt: 'Reavivar uma antiga ou cobrir uma que não curte mais.', icone: 'gota' },
};
const PECAS = [['jaqueta', 'Jaqueta', 450, 900], ['camiseta', 'Camiseta / moletom', 180, 320], ['tenis', 'Tênis', 350, 650], ['bone', 'Boné', 150, 260], ['tela', 'Tela / quadro', 400, 1200], ['pet', 'Peça com o pet', 250, 500], ['outra', 'Outra peça', 200, 800]];
const ZONAS = {
  cabeca: { nome: 'Cabeça', f: 1.35 }, pescoco: { nome: 'Pescoço', f: 1.2 }, nuca: { nome: 'Nuca', f: 1.1 }, peito: { nome: 'Peito', f: 1.05 }, barriga: { nome: 'Barriga', f: 1.1 },
  costas: { nome: 'Costas', f: 1 }, lombar: { nome: 'Lombar', f: 1.05 }, quadril: { nome: 'Quadril', f: 1.1 },
  'costela-d': { nome: 'Costela direita', f: 1.3 }, 'costela-e': { nome: 'Costela esquerda', f: 1.3 },
};
for (const [k, n, f] of [['ombro', 'Ombro', 1], ['braco', 'Braço', 1], ['antebraco', 'Antebraço', 1], ['mao', 'Mão', 1.25], ['coxa', 'Coxa', 1], ['perna', 'Perna (canela/panturrilha)', 1.05], ['pe', 'Pé', 1.2]])
  for (const [s, ns] of [['d', 'direito'], ['e', 'esquerdo']]) ZONAS[`${k}-${s}`] = { nome: `${n} ${['mao', 'perna'].includes(k) ? (s === 'd' ? 'direita' : 'esquerda') : ns}`.replace('Perna (canela/panturrilha) direita', 'Perna direita').replace('Perna (canela/panturrilha) esquerda', 'Perna esquerda'), f };
const zonaNome = id => ZONAS[id]?.nome || (id ? id : '—');

/* ---------- estado ---------- */
const CHAVE = 'japa-oneightwo-v1', VERSAO = 2;
let S = null;
function carregar() {
  try { const raw = localStorage.getItem(CHAVE); S = raw ? JSON.parse(raw) : null; } catch (e) { S = null; }
  if (!S || S.versao !== VERSAO || !S.pedidos) { S = exemploEstado(); salvar(); return; }
  // demonstração: as datas andam com o calendário, para o exemplo sempre parecer "de hoje"
  if (S.exemplo && S.geradoEm) { const delta = hoje0() - dia0(S.geradoEm); if (delta >= DIA) { moverDatas(S, delta); S.geradoEm = hoje0(); salvar(); } }
}
function moverDatas(o, delta) {
  for (const k in o) { const v = o[k];
    if (typeof v === 'number' && v > 1e12 && v < 4e12 && k !== 'geradoEm') o[k] = v + delta;
    else if (v && typeof v === 'object') moverDatas(v, delta); }
}
function salvar() { try { S.salvoEm = Date.now(); localStorage.setItem(CHAVE, JSON.stringify(S)); } catch (e) { if (typeof toast === 'function') toast('O navegador não deixou salvar (espaço cheio?).', 'alerta'); } }
function recomecar() { S = exemploEstado(); salvar(); }
const ouvintes = [];
const aoMudar = fn => ouvintes.push(fn);
addEventListener('storage', e => { if (e.key === CHAVE && e.newValue) { try { S = JSON.parse(e.newValue); ouvintes.forEach(f => f()); } catch (er) { } } });

/* ---------- consultas ---------- */
const regiao = id => S.regioes.find(r => r.id === id);
const cliente = id => S.clientes.find(c => c.id === id);
const pedido = id => S.pedidos.find(p => p.id === id);
const flash = id => S.flashes.find(f => f.id === id);
const sessao = id => S.sessoes.find(s => s.id === id);
const cidadesDe = reg => S.cidades[reg] || [];
const kmDe = (reg, cid) => (cidadesDe(reg).find(c => c[0] === cid) || [0, 0])[1];
function taxaDeslocamento(reg, cid) {
  const r = regiao(reg); if (!r) return 0; const t = r.taxa;
  if (t.tipo === 'fixa') return t.valor;
  const km = kmDe(reg, cid); return km <= t.gratisAte ? 0 : arred(km * t.porKm);
}
function rotaDe(ts) {
  const d = dia0(ts), r = S.rota.find(x => x.dia === d);
  if (r) return r; return { dia: d, reg: new Date(d).getDay() === 0 ? 'folga' : 'serra', auto: true };
}
const sessoesDoDia = ts => S.sessoes.filter(s => dia0(s.inicio) === dia0(ts) && s.status !== 'cancelada').sort((a, b) => a.inicio - b.inicio);
const minutosOcupados = ts => sessoesDoDia(ts).reduce((t, s) => t + s.duracao, 0);
function diasNaRegiao(reg, { de = somaDias(hoje0(), 1), dias = 75, minLivre = 120 } = {}) {
  const out = [];
  for (let i = 0; i < dias; i++) { const d = somaDias(de, i), r = rotaDe(d);
    if (r.reg === reg && S.config.horasDia * 60 - minutosOcupados(d) >= minLivre) out.push(d); }
  return out;
}
// as "paradas": blocos de dias seguidos na mesma região (para o site e o painel mostrarem a rota)
function paradas({ de = hoje0(), dias = 60 } = {}) {
  const out = []; let at = null;
  for (let i = 0; i < dias; i++) { const d = somaDias(de, i), r = rotaDe(d);
    if (at && at.reg === r.reg) { at.fim = d; at.dias++; } else { at = { reg: r.reg, ini: d, fim: d, dias: 1, nota: r.nota }; out.push(at); } }
  return out;
}
const estouEm = () => rotaDe(Date.now());
function proximaParada(reg) { return paradas({ de: somaDias(hoje0(), 1), dias: 90 }).find(p => p.reg === reg); }

/* ---------- preço ---------- */
function estimativa({ tipo = 'exclusiva', tamanho = 10, estilo: est = 'blackwork', cor = false, zona = null, peca = null, flashId = null } = {}) {
  const c = S.config;
  if (tipo === 'flash') { const f = flash(flashId); const v = f ? f.preco : c.minimo; return { min: v, max: v, horas: f ? f.horas : 2, sessoes: 1, fixo: true }; }
  if (tipo === 'customizacao') { const p = PECAS.find(x => x[0] === peca) || PECAS[PECAS.length - 1]; return { min: p[2], max: p[3], horas: 0, sessoes: 0, oficina: true }; }
  const e = estilo(est), fz = ZONAS[zona]?.f || 1, comCor = cor || e.cor;
  let p = (c.base + c.porCm * Math.pow(tamanho, 1.75)) * e.f * fz * (comCor && !e.cor ? 1.2 : 1);
  if (tipo === 'retoque') p *= .55;
  p = Math.max(c.minimo, p);
  const horas = Math.max(1, .6 + Math.pow(tamanho, 1.4) * .05 * e.f * (comCor ? 1.15 : 1));
  return { min: Math.max(c.minimo, arred(p * .88, 10)), max: Math.max(c.minimo, arred(p * 1.15, 10)), horas: Math.round(horas * 2) / 2, sessoes: Math.max(1, Math.ceil(horas / c.horasSessao)) };
}
const faixa = e => e.fixo || e.min === e.max ? brl(e.min) : `${brl(e.min)} a ${brl(e.max)}`;
const sinalDe = valor => Math.max(S.config.sinalMin, arred(valor * S.config.sinalPct / 100, 10));

/* ---------- pedidos, sessões e dinheiro ---------- */
const ETAPAS = [['novo', 'Chegou'], ['orcado', 'Orçado'], ['sinal', 'Sinal pago'], ['agendado', 'Agendado'], ['feito', 'Tatuado']];
const etapaNome = id => (ETAPAS.find(e => e[0] === id) || [0, id === 'recusado' ? 'Arquivado' : id])[1];
const pedidosDe = cid => S.pedidos.filter(p => p.clienteId === cid).sort((a, b) => b.criadoEm - a.criadoEm);
const sessoesDe = cid => S.sessoes.filter(s => s.clienteId === cid).sort((a, b) => b.inicio - a.inicio);
const sessoesDoPedido = pid => S.sessoes.filter(s => s.pedidoId === pid).sort((a, b) => a.inicio - b.inicio);
const tattoosDe = cid => S.pedidos.filter(p => p.clienteId === cid && p.status === 'feito' && p.tipo !== 'customizacao');
const totalGasto = cid => S.caixa.filter(l => l.clienteId === cid && l.tipo === 'entrada').reduce((t, l) => t + l.valor, 0);
function lancar(l) { const x = { id: novoId('l'), ts: Date.now(), forma: 'pix', ...l }; S.caixa.push(x); return x; }
function achaOuCriaCliente({ nome, fone, insta, cidade, reg, nascimento }) {
  const f = foneNorm(fone); let c = S.clientes.find(x => x.fone === f && f);
  if (!c) { c = { id: novoId('c'), nome: nome.trim(), fone: f, insta: (insta || '').replace(/^@/, ''), cidade, reg, nascimento: nascimento || '', desde: Date.now(), ficha: null, obs: '' }; S.clientes.push(c); }
  else { c.cidade = cidade || c.cidade; c.reg = reg || c.reg; if (insta) c.insta = insta.replace(/^@/, ''); if (nascimento) c.nascimento = nascimento; }
  return c;
}
function avisar(tipo, ref, txt) { S.novidades.unshift({ id: novoId('n'), tipo, ref, txt, ts: Date.now(), visto: false }); S.novidades = S.novidades.slice(0, 40); }
// fase da cicatrização: dias desde a sessão concluída
const CUIDADOS = [
  { dia: 0, t: 'Hoje: o filme fica', txt: 'Deixa o filme (ou o plástico) o tempo que o Japa falou. Lava com sabonete neutro, seca com papel toalha, sem esfregar.' },
  { dia: 1, t: 'Dia 1: lavar e respirar', txt: 'Lava 3x por dia com água fria e sabonete neutro. Camada fina da pomada. Nada de abafar.' },
  { dia: 3, t: 'Dia 3: vai coçar', txt: 'Normal coçar. Não coça, dá tapinha. Nada de sol, piscina nem mar.' },
  { dia: 7, t: 'Dia 7: casquinha', txt: 'Vai descamar. Não arranca! Troca a pomada por hidratante sem perfume.' },
  { dia: 15, t: 'Dia 15: quase lá', txt: 'A pele tá fechando. Mar e piscina ainda não. Protetor solar quando sair no sol.' },
  { dia: 30, t: 'Dia 30: cicatrizada', txt: 'Ficou pronta! Protetor solar sempre. Se precisar de retoque, chama o Japa (grátis até 45 dias).' },
];
function faseCuidado(ts) { const d = Math.max(0, -diasAte(ts)); let f = CUIDADOS[0]; for (const c of CUIDADOS) if (d >= c.dia) f = c; return { ...f, diasPassados: d, pct: Math.min(100, Math.round(d / 30 * 100)) }; }
function preencher(txt, dados) { return String(txt || '').replace(/\{(\w+)\}/g, (m, k) => dados[k] ?? m); }
function linkWhats(fone, msg) { const f = foneNorm(fone); return `https://wa.me/55${f}?text=${encodeURIComponent(msg || '')}`; }
