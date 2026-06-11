const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const slugs = fs.readdirSync(path.join(ROOT, 'blog', 'content')).map(f => f.replace('.html', ''));
let ok = true;
for (const s of slugs) {
  const content = fs.readFileSync(path.join(ROOT, 'blog', 'content', s + '.html'), 'utf8');
  const page = fs.readFileSync(path.join(ROOT, 'blog', s + '.html'), 'utf8');
  // elke alinea uit de bron moet (ongewijzigd) in de pagina staan
  const paras = content.match(/<p>[\s\S]*?<\/p>/g) || [];
  const missing = paras.filter(p => !page.includes(p));
  const em = page.match(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu);
  const lds = [...page.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  let ldOk = lds.length === 2;
  for (const m of lds) { try { JSON.parse(m[1]); } catch (e) { ldOk = false; } }
  const h1 = (page.match(/<h1[\s>]/g) || []).length;
  if (missing.length || em || !ldOk || h1 !== 1) { ok = false; }
  console.log(s, '| paras missing:', missing.length, '| emoji:', em ? em.length : 0, '| jsonld:', ldOk ? 'OK' : 'FOUT', '| h1:', h1);
}
const ov = fs.readFileSync(path.join(ROOT, 'blog.html'), 'utf8');
const em2 = ov.match(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu);
console.log('blog.html | emoji:', em2 ? em2.length : 0, '| h1:', (ov.match(/<h1[\s>]/g) || []).length, '| links naar artikelen:', (ov.match(/href="\/blog\//g) || []).length);
console.log(ok ? 'ALLES OK' : 'PROBLEMEN GEVONDEN');
