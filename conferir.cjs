// Conferência da página do HIDRODIAG: ids que os scripts procuram, carrosséis, imagens que faltam,
// imagens emprestadas do concorrente (rascunho), links de checkout dos 2 planos e marcações TROCAR.
//   node conferir.cjs
const fs = require('fs');
const path = require('path');
const pasta = __dirname;
const s = fs.readFileSync(path.join(pasta, 'index.html'), 'utf8');

const ids = ['trilho', 'trilho2', 'zoom', 'oferta', 'fichas'];
const faltam = ids.filter((i) => !s.includes('id="' + i + '"'));
console.log('ids dos scripts:', faltam.length ? 'FALTAM ' + faltam.join(', ') : 'todos presentes');
for (const t of ['trilho', 'trilho2']) {
  const bloco = s.slice(s.indexOf('id="' + t + '"'));
  const n = (bloco.slice(0, bloco.indexOf('</div>')).match(/<figure/g) || []).length;
  console.log('carrossel ' + t + ': ' + n / 2 + ' fichas (x2 para o loop)');
}
const ck = [...s.matchAll(/<a[^>]*data-checkout[^>]*>/g)].map((m) => ({
  plano: (m[0].match(/data-plano="([^"]+)"/) || [])[1], href: (m[0].match(/href="([^"]+)"/) || [])[1] }));
console.log('botões de checkout (data-checkout):', ck.length);
ck.forEach((c) => console.log('   ' + c.plano + ': ' + c.href + (/^https:\/\/pay\.wiapy\.com\//.test(c.href) ? '' : '   <- AINDA PLACEHOLDER (config.checkout no textos/pt.json)')));
const refs = [...s.matchAll(/(?:src|href)="([^"]+\.(?:webp|png|jpg|mp4))"/g)].map((m) => m[1]);
const unicas = [...new Set(refs)];
const sem = unicas.filter((f) => !fs.existsSync(path.join(pasta, f)));
console.log('imagens citadas:', unicas.length, '| não existem:', sem.length);
sem.forEach((f) => console.log('   falta', f));
const emprestadas = unicas.filter((f) => f.includes('_placeholder-ref/'));
console.log('imagens EMPRESTADAS do concorrente (rascunho, trocar antes de publicar):', emprestadas.length);
const tagsRef = [...s.matchAll(/<img[^>]*_placeholder-ref[^>]*>/g)].filter((m) => !m[0].includes('data-placeholder="ref"'));
if (tagsRef.length) console.log('  SEM MARCA data-placeholder="ref":', tagsRef.length);
const sobrou = s.match(/\{\{[^}]+\}\}/g);
if (sobrou) console.log('marcações {{ }} que sobraram:', [...new Set(sobrou)].join(', '));
const trocar = [...s.matchAll(/TROCAR[\w-]*/g)].map((m) => m[0]);
console.log('marcações TROCAR:', [...new Set(trocar)].join(', ') || 'nenhuma');
// palavras que denunciam cópia da página do Split ou sobra da versão em espanhol
const proibidas = ['split', 'ar-condicionado', 'ar condicionado', 'evaporadora', 'kirvano', 'arquivopratico', 'diagnósticos visuales', 'computadora', ' usted', 'garantía', 'whatsapp e no seu e-mail'];
const texto = s.replace(/<!--[\s\S]*?-->/g, '').replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');
const achou = proibidas.filter((w) => texto.toLowerCase().includes(w));
console.log('palavras do Split / da versão ES no texto visível:', achou.length ? achou.join(', ') : 'nenhuma');
console.log('back redirect:', s.includes("+ 'promo'") ? 'LIGADO' : 'desligado (config.backRedirect)', '| seletor do checkout:', s.includes('a[href*="pay.wiapy.com"]') ? 'pay.wiapy.com ok' : 'FALTA pay.wiapy.com');
