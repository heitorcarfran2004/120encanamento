// Monta a página de vendas a partir do layout (_fonte/*.html) + textos de um idioma (textos/<idioma>.json).
//   node _montar.cjs        -> espanhol (textos/es.json), saída nesta pasta
// Copiado de funis/hidroponia-vertical (mesmo motor). Nunca edite o index.html/promo.html gerados: edite _fonte/ ou textos/.
//
// Marcações do layout:
//   {{a.b}}               texto (procura no item do laço atual e depois na raiz)
//   {{#lista}}...{{/lista}}  repete para cada item; se não for lista, mostra o bloco quando verdadeiro
//   {{^chave}}...{{/chave}}  mostra quando falso/vazio
//   {{.}} item simples · {{.0}} {{.1}} posição num item-lista · {{@n}} número do item (1, 2, 3...)
const fs = require('fs');
const path = require('path');

const idioma = process.argv[2] || 'pt';
const T = JSON.parse(fs.readFileSync(path.join(__dirname, 'textos', idioma + '.json'), 'utf8'));
const C = T.config;

// ---------- preço na moeda do idioma ----------
function fmt(v, curto) {
  const m = C.moeda;
  let [int, dec] = Number(v).toFixed(2).split('.');
  int = int.replace(/\B(?=(\d{3})+(?!\d))/g, m.milhar);
  const num = curto && dec === '00' ? int : int + m.decimal + dec;
  const sp = m.espaco ? ' ' : '';
  return m.antes ? m.simbolo + sp + num : num + sp + m.simbolo;
}
const P = C.precos;
// 2 planos: preço, "de" (âncora riscada) e economia, com centavos (R$ 17,90 · de R$ 47,90 · economiza R$ 30,00)
T.p = { basico: fmt(P.basico), deBasico: fmt(P.deBasico), ecoBasico: fmt(P.deBasico - P.basico),
  completo: fmt(P.completo), deCompleto: fmt(P.deCompleto), ecoCompleto: fmt(P.deCompleto - P.completo),
  popup: fmt(P.popup), difPopup: fmt(P.popup - P.basico), saida: fmt(P.saida) };
(T.bonus.itens || []).forEach((b) => { b.valorFmt = fmt(b.valor, true); });
T.garantiaDias = C.garantiaDias;
T.base = (C.saida && C.saida !== '.') ? '../' : '';

// ---------- motor de modelo ----------
function busca(nome, pilha) {
  if (nome === '.') return pilha[0];
  if (nome.startsWith('@')) return pilha.__n;
  const partes = nome.replace(/^\./, '').split('.');
  const fontes = nome.startsWith('.') ? [pilha[0]] : pilha;
  for (const f of fontes) {
    let v = f;
    let ok = true;
    for (const k of partes) {
      if (v != null && typeof v === 'object' && k in v) v = v[k]; else { ok = false; break; }
    }
    if (ok) return v;
  }
  return undefined;
}
function render(tpl, pilha, n) {
  pilha.__n = n;
  // blocos (o mais interno com o mesmo nome fecha primeiro: não aninhe o mesmo nome)
  const bloco = /\{\{([#^])([\w.@]+)\}\}([\s\S]*?)\{\{\/\2\}\}/;
  let m;
  while ((m = bloco.exec(tpl))) {
    const [tudo, tipo, nome, dentro] = m;
    const v = busca(nome, pilha);
    let out = '';
    if (tipo === '^') out = (!v || (Array.isArray(v) && !v.length)) ? render(dentro, pilha, n) : '';
    else if (Array.isArray(v)) out = v.map((it, i) => { const pp = [it, ...pilha]; return render(dentro, pp, i + 1); }).join('');
    else if (v) out = render(dentro, pilha, n);
    pilha.__n = n;
    tpl = tpl.slice(0, m.index) + out + tpl.slice(m.index + tudo.length);
  }
  return tpl.replace(/\{\{([\w.@]+)\}\}/g, (_, nome) => {
    const v = busca(nome, pilha);
    if (v === undefined) { faltando.add(nome); return '{{' + nome + '}}'; }
    const s = String(v);
    return s.includes('{{') ? render(s, [T], n) : s;
  });
}
const faltando = new Set();

// ---------- minificação (só performance: tira comentário e espaço, não mexe em texto nem em script externo) ----------
// O HTML gerado sai enxuto; a fonte em _fonte/ continua legível e comentada.
function minCss(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ')
    .replace(/\s*([{};,])\s*/g, '$1').replace(/:\s+/g, ':').replace(/;}/g, '}').trim();
}
function minJs(js) {
  // conservador: tira só linha inteira de comentário, indentação e linha vazia (comentário no fim
  // da linha fica, porque "//" pode estar dentro de uma URL ou string)
  return js.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('//')).join('\n');
}
function minificar(html) {
  const partes = html.split(/(<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>)/i);
  return partes.map((p, i) => {
    if (i % 2) {
      const m = p.match(/^(<(script|style)\b[^>]*>)([\s\S]*?)(<\/\2>)$/i);
      if (!m) return p;
      const corpo = m[2].toLowerCase() === 'style' ? minCss(m[3]) : (/\bsrc=/.test(m[1]) ? m[3] : minJs(m[3]));
      return m[1] + corpo + m[4];
    }
    return p.replace(/<!--[\s\S]*?-->/g, '').replace(/\r/g, '').replace(/\n[ \t]+/g, '\n').replace(/\n{2,}/g, '\n');
  }).join('');
}

const pastaSaida = path.join(__dirname, C.saida || '.');
fs.mkdirSync(pastaSaida, { recursive: true });
for (const arq of fs.readdirSync(path.join(__dirname, '_fonte')).filter((f) => f.endsWith('.html'))) {
  const tpl = fs.readFileSync(path.join(__dirname, '_fonte', arq), 'utf8');
  fs.writeFileSync(path.join(pastaSaida, arq), minificar(render(tpl, [T], 0)));
  console.log('ok', path.relative(__dirname, path.join(pastaSaida, arq)));
}
if (faltando.size) { console.log('TEXTOS QUE FALTAM no ' + idioma + '.json:', [...faltando].join(', ')); process.exitCode = 1; }
