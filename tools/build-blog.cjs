/* ═══════════════════════════════════════════════════════════════════════════
   MELINGO BLOG-GENERATOR
   Eén centrale databron + één template voor blog.html en alle /blog/*.html.
   - Artikelinhoud leeft in blog/content/<slug>.html (alleen de prose).
   - Metadata leeft in POSTS hieronder.
   - Styling leeft in /blog.css.
   Nieuw artikel toevoegen: contentbestand + POSTS-entry, dan:
     node tools/build-blog.cjs
═══════════════════════════════════════════════════════════════════════════ */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const BASE = 'https://melingo.vercel.app';

/* ── CONTENTMODEL ── */
const POSTS = [
  {
    slug: 'hoe-organiseer-je-een-muziekbingo',
    title: 'Hoe organiseer je een muziekbingo?',
    excerpt: 'Een stap-voor-stap gids voor een geslaagde muziekbingo — van voorbereiding tot eindprijzen.',
    lead: 'Muziekbingo is een van de leukste spelletjes voor groepen — laagdrempelig, herkenbaar en altijd goed voor gelach. Maar hoe zet je het van A tot Z op? In deze gids lopen we alle stappen door.',
    category: 'Tips & gidsen', catKey: 'gidsen',
    date: '2025-01-15', dateNl: '15 januari 2025',
    featured: true, ph: 'guide',
    coverImage: 'blog-hoe-organiseer-je-een-muziekbingo.jpg',
    coverAlt: 'Voorbereidingen voor een muziekbingo: bingokaarten, playlist en hostscherm',
    summary: [
      'Je hebt weinig nodig: een playlist of thema, een afspeelapparaat en bingokaarten.',
      'Kies herkenbare nummers; voor een eigen playlist zijn 30–40 nummers genoeg voor een avond.',
      'Geef iedere speler een unieke kaart — printen op A4 of digitaal delen kan allebei.',
      'Leg de vier simpele spelregels vooraf uit en controleer een bingo via het hostscherm.',
      'Speel meerdere rondes van 15–25 nummers met pauzes ertussen.'
    ],
    ctas: [
      { afterH2: 2, type: 'cards' },
      { afterH2: 3, type: 'host' }
    ],
    related: ['muziekbingo-met-spotify', 'muziekbingo-kaarten-printen', 'muziekbingo-ideeen-voor-feestje']
  },
  {
    slug: 'muziekbingo-ideeen-voor-feestje',
    title: 'Muziekbingo ideeën voor een feestje',
    excerpt: 'Creatieve tips en ideeën om je feest onvergetelijk te maken met muziekbingo als middelpunt.',
    lead: 'Op zoek naar een leuke activiteit voor je feestje? Muziekbingo is een van de makkelijkst te organiseren groepsspelletjes — en altijd goed voor sfeer.',
    category: 'Feestideeën', catKey: 'feest',
    date: '2025-02-03', dateNl: '3 februari 2025',
    ph: 'party',
    coverImage: 'blog-muziekbingo-ideeen-voor-feestje.jpg',
    coverAlt: 'Feesttafel met muziekbingokaarten en drankjes',
    summary: [
      'Maak het persoonlijk: gebruik een playlist met favorieten van de jarige.',
      'Koppel de bingo aan een thema zoals 80s, Foute Muziek of Guilty Pleasures.',
      'Muziekbingo werkt ook prima als opwarmer of afsluiter naast quiz of karaoke.',
      'Een kleine prijs voor de winnaar maakt het extra spannend.'
    ],
    ctas: [{ afterH2: 1, type: 'spotify' }],
    related: ['foute-muziekbingo-ideeen', 'hoe-organiseer-je-een-muziekbingo', 'kerst-muziekbingo-organiseren']
  },
  {
    slug: 'muziekbingo-voor-bedrijfsborrel',
    title: 'Muziekbingo op de bedrijfsborrel',
    excerpt: 'Waarom muziekbingo de perfecte activiteit is voor je volgende bedrijfsborrel of teamuitje.',
    lead: 'Muziekbingo is een van de beste activiteiten voor een bedrijfsborrel. Het is laagdrempelig, inclusief en zorgt voor spontane gesprekken tussen collega\'s die anders misschien niet zo snel met elkaar praten.',
    category: 'Zakelijk', catKey: 'zakelijk',
    date: '2025-02-18', dateNl: '18 februari 2025',
    ph: 'business',
    coverImage: 'blog-muziekbingo-voor-bedrijfsborrel.jpg',
    coverAlt: 'Collega\'s spelen muziekbingo tijdens een bedrijfsborrel',
    summary: [
      'Muziekbingo vraagt geen muziekkennis — iedereen herkent wel iets.',
      'Kies een breed tijdvak (zoals 80s of 90s) zodat alle leeftijden meedoen.',
      'Deel kaarten digitaal via de bedrijfs-app of WhatsApp-groep.',
      'Gebruik een laptop met groot scherm of beamer voor het hostscherm.'
    ],
    ctas: [{ afterH2: 2, type: 'app' }],
    related: ['hoe-organiseer-je-een-muziekbingo', 'muziekbingo-met-spotify', 'muziekbingo-kaarten-printen']
  },
  {
    slug: 'muziekbingo-met-spotify',
    title: 'Muziekbingo spelen met Spotify',
    excerpt: 'Alles over de Spotify-koppeling, wat het oplevert en hoe je het instelt in minuten.',
    lead: 'De Spotify-koppeling in Melingo maakt muziekbingo spelen eenvoudiger dan ooit. Koppel je account, kies een playlist en het host-scherm doet de rest.',
    category: 'Spotify', catKey: 'spotify',
    date: '2025-03-05', dateNl: '5 maart 2025',
    ph: 'spotify',
    coverImage: 'blog-muziekbingo-met-spotify.jpg',
    coverAlt: 'Spotify-playlist naast een Melingo-bingokaart',
    summary: [
      'Kies een playlist uit je eigen Spotify-bibliotheek; Melingo verdeelt de nummers over de kaarten.',
      'Vanuit het hostscherm bedien je Spotify direct: afspelen, pauzeren en doorgaan.',
      'Afgespeelde nummers worden automatisch gemarkeerd.',
      'Voor automatisch afspelen heb je Spotify Premium nodig; zonder Premium kun je kaarten of een thema gebruiken.'
    ],
    ctas: [{ afterH2: 0, type: 'spotify' }],
    related: ['hoe-organiseer-je-een-muziekbingo', 'muziekbingo-ideeen-voor-feestje', 'muziekbingo-voor-bedrijfsborrel']
  },
  {
    slug: 'muziekbingo-kaarten-printen',
    title: 'Muziekbingo kaarten printen: zo doe je het',
    excerpt: 'Praktische tips voor het printen van je muziekbingo kaarten — formaat, papier en verdelen.',
    lead: 'Je hebt je bingokaarten gegenereerd via Melingo — nu wil je ze printen. Hier vind je alle praktische tips voor het beste resultaat.',
    category: 'Tips & gidsen', catKey: 'gidsen',
    date: '2025-03-20', dateNl: '20 maart 2025',
    ph: 'guide',
    coverImage: 'blog-muziekbingo-kaarten-printen.jpg',
    coverAlt: 'Geprinte muziekbingokaarten op een tafel',
    summary: [
      'Download de PDF direct na het afrekenen; iedere speler heeft een eigen unieke kaart.',
      'Print op A4 in portret — kleur is feestelijker, zwart-wit (eco) is zuiniger.',
      'Digitaal delen kan ook: stuur elke kaart als losse pagina via WhatsApp.',
      'Kaarten zijn automatisch genummerd voor de bingocontrole via het hostscherm.'
    ],
    ctas: [{ afterH2: 0, type: 'cards' }],
    related: ['hoe-organiseer-je-een-muziekbingo', 'muziekbingo-met-spotify', 'muziekbingo-ideeen-voor-feestje']
  },
  {
    slug: 'foute-muziekbingo-ideeen',
    title: 'Foute muziekbingo ideeën',
    excerpt: 'Tips voor een hilarische foute muziekbingo-avond vol guilty pleasures en meezingen.',
    lead: 'Een foute muziekbingo-avond is gegarandeerd een succesnummer. We geven je de beste tips voor een avond vol herkenning, schaamteloze meezingen en hilarische momenten.',
    category: 'Feestideeën', catKey: 'feest',
    date: '2025-04-10', dateNl: '10 april 2025',
    ph: 'party',
    coverImage: 'blog-foute-muziekbingo-ideeen.jpg',
    coverAlt: 'Kleurrijk feest met foute muziek en bingokaarten',
    summary: [
      '"Foute" muziek is juist het beste bingomateriaal: iedereen kent het, niemand geeft het toe.',
      'Het kant-en-klare Foute Muziek-thema is direct inzetbaar, zonder voorbereiding.',
      'Eigen playlist? Vraag iedereen vooraf zijn of haar meest foute favoriet in te sturen.',
      'Spelregel die altijd werkt: wie een nummer herkent, mag hardop meezingen.'
    ],
    ctas: [{ afterH2: 1, type: 'themaFout' }],
    related: ['muziekbingo-ideeen-voor-feestje', 'kerst-muziekbingo-organiseren', 'hoe-organiseer-je-een-muziekbingo']
  },
  {
    slug: 'kerst-muziekbingo-organiseren',
    title: 'Kerst muziekbingo organiseren',
    excerpt: 'Breng de kerstsfeer naar je feest met een kerst muziekbingo. Inclusief tips voor de perfecte avond.',
    lead: 'Een kerst muziekbingo is de perfecte activiteit voor de feestdagen. Of het nu een kerstborrel, familiefeest of vriendenavond is — iedereen doet mee en de sfeer is meteen goed.',
    category: 'Seizoenen', catKey: 'seizoenen',
    date: '2025-11-01', dateNl: '1 november 2025',
    ph: 'season',
    coverImage: 'blog-kerst-muziekbingo-organiseren.jpg',
    coverAlt: 'Kersttafel met muziekbingokaarten en kerstversiering',
    summary: [
      'Kerstliedjes zijn bij uitstek herkenbaar — perfect bingomateriaal voor jong en oud.',
      'Het Kerstmuziek-thema mixt klassiekers met modernere winterhits.',
      'Kerstborrel: 2–3 korte rondes naast de hapjes; familiefeest: meerdere rondes met nieuwe kaarten.',
      'Maak het af met kersttruien, themaprijsjes of een gecombineerde pubquiz.'
    ],
    ctas: [{ afterH2: 1, type: 'themaKerst' }],
    related: ['foute-muziekbingo-ideeen', 'muziekbingo-ideeen-voor-feestje', 'hoe-organiseer-je-een-muziekbingo']
  }
];

const FILTERS = [
  { key: 'alle', label: 'Alle artikelen' },
  { key: 'gidsen', label: 'Tips & gidsen' },
  { key: 'feest', label: 'Feestideeën' },
  { key: 'spotify', label: 'Spotify' },
  { key: 'zakelijk', label: 'Zakelijk' },
  { key: 'seizoenen', label: 'Seizoenen' }
];

const CTA_TYPES = {
  app:       { title: 'Maak er direct een muziekbingo van', text: 'Kies je playlist of thema, bepaal het aantal spelers en laat Melingo de kaarten en het hostscherm regelen.', btn: 'Maak mijn muziekbingo', href: '/app' },
  cards:     { title: 'Geen zin om alle kaarten zelf te verdelen?', text: 'Melingo maakt automatisch unieke kaarten voor iedere speler en levert ze als printbare PDF.', btn: 'Maak mijn bingokaarten', href: '/app?mode=cards' },
  host:      { title: 'Houd tijdens het spel overzicht', text: 'Het Melingo-hostscherm toont gespeelde nummers en controleert een bingo via het kaartnummer.', btn: 'Bekijk hoe het hostscherm werkt', href: '/#zo-werkt-het' },
  spotify:   { title: 'Speel met je eigen Spotify-playlist', text: 'Koppel je account, kies een playlist en Melingo verdeelt de nummers automatisch over unieke kaarten.', btn: 'Start met mijn playlist', href: '/app?mode=spotify' },
  themaFout: { title: 'Direct beginnen met foute muziek?', text: 'Het kant-en-klare Foute Muziek-thema staat klaar met 40 nummers, hostscherm en bingocontrole.', btn: 'Start het Foute Muziek-thema', href: '/app?mode=theme&theme=foute-muziek' },
  themaKerst:{ title: 'Direct beginnen met kerstmuziek?', text: 'Het kant-en-klare Kerstmuziek-thema staat klaar met 40 nummers, hostscherm en bingocontrole.', btn: 'Start het Kerstmuziek-thema', href: '/app?mode=theme&theme=kerstmuziek' }
};

/* ── HELPERS ── */
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slugify = s => s.toLowerCase()
  .replace(/[àáâä]/g, 'a').replace(/[èéêë]/g, 'e').replace(/[ìíîï]/g, 'i')
  .replace(/[òóôö]/g, 'o').replace(/[ùúûü]/g, 'u').replace(/[^a-z0-9\s-]/g, '')
  .trim().replace(/\s+/g, '-');
const readingTime = html => {
  const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.ceil(words / 180));
};

const SPRITE = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">
  <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></symbol>
  <symbol id="i-chev-d" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></symbol>
  <symbol id="i-check" viewBox="0 0 24 24"><path d="m20 6-11 11-5-5"/></symbol>
  <symbol id="i-note" viewBox="0 0 24 24"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></symbol>
  <symbol id="i-host" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M10 8.5v4l3.5-2-3.5-2Z"/></symbol>
  <symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></symbol>
  <symbol id="i-cal" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></symbol>
  <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></symbol>
  <symbol id="i-list" viewBox="0 0 24 24"><path d="M9 6h12M9 12h12M9 18h12"/><circle cx="4" cy="6" r="1.2"/><circle cx="4" cy="12" r="1.2"/><circle cx="4" cy="18" r="1.2"/></symbol>
  <symbol id="i-bulb" viewBox="0 0 24 24"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.8.7 1.3 1.5 1.5 2.5h5c.2-1 .7-1.8 1.5-2.5A6 6 0 0 0 12 3Z"/></symbol>
  <symbol id="i-warn" viewBox="0 0 24 24"><path d="M12 3 2.5 20h19L12 3Z"/><path d="M12 10v4M12 17.5v.5"/></symbol>
</svg>`;

const LOGO_SVG = `<svg width="22" height="22" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="48" fill="#1a1a2e"/><circle cx="50" cy="50" r="38" fill="#16162a"/><circle cx="50" cy="50" r="28" fill="#1a1a2e"/><circle cx="50" cy="50" r="20" fill="#F2406A"/><circle cx="50" cy="50" r="11" fill="#9B6DFF"/><circle cx="50" cy="50" r="4" fill="#0D0D18"/></svg>`;

const NAV = `<nav class="nav" id="mainNav">
  <div class="wrap nav-inner">
    <a href="/" class="nav-logo" aria-label="Melingo homepage">${LOGO_SVG} Melingo <span class="nav-slogan">where melody meets bingo</span></a>
    <button class="nav-burger" id="navBurger" aria-label="Menu openen" aria-expanded="false" aria-controls="navLinks"><span></span><span></span><span></span></button>
    <ul class="nav-links" id="navLinks" role="list">
      <li><a href="/#zo-werkt-het">Zo werkt het</a></li>
      <li><a href="/#speelopties">Speelopties</a></li>
      <li><a href="/blog">Blog</a></li>
      <li><a href="/faq">FAQ</a></li>
      <li class="nav-cta"><a href="/app" class="btn btn-primary">Maak je muziekbingo</a></li>
    </ul>
  </div>
</nav>`;

const FOOTER = `<footer>
  <div class="wrap">
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="footer-logo">${LOGO_SVG.replace('width="22" height="22"', 'width="20" height="20"')} Melingo</div>
        <div class="footer-slogan">where melody meets bingo</div>
        <p style="font-size:.78rem;max-width:34ch">Maak van je eigen muziek of een kant-en-klaar thema binnen enkele minuten een professionele muziekbingo.</p>
      </div>
      <div class="footer-col">
        <h3>Product</h3>
        <ul>
          <li><a href="/#zo-werkt-het">Hoe werkt het</a></li>
          <li><a href="/#speelopties">Speelopties</a></li>
          <li><a href="/#pakketten">Prijzen</a></li>
          <li><a href="/kant-en-klare-muziekbingo">Thema's</a></li>
          <li><a href="/app">Start de app</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h3>Meer</h3>
        <ul>
          <li><a href="/faq">FAQ</a></li>
          <li><a href="/blog">Blog</a></li>
          <li><a href="/muziekbingo-maken">Muziekbingo maken</a></li>
          <li><a href="/spotify-muziekbingo">Muziekbingo met Spotify</a></li>
          <li><a href="mailto:hallo@melingo.nl">Contact</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="footer-copy">&copy; 2026 Melingo</div>
      <div class="footer-copy">Veilige betaling via Stripe · eenmalige betaling, geen abonnement</div>
    </div>
  </div>
</footer>`;

const NAV_JS = `var burger=document.getElementById('navBurger'),links=document.getElementById('navLinks');
  if(burger&&links){
    burger.addEventListener('click',function(){
      var open=links.classList.toggle('open');
      burger.classList.toggle('open',open);
      burger.setAttribute('aria-expanded',open?'true':'false');
      document.body.style.overflow=open?'hidden':'';
    });
    links.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click',function(){
        links.classList.remove('open');burger.classList.remove('open');
        burger.setAttribute('aria-expanded','false');document.body.style.overflow='';
      });
    });
  }`;

/* Echte Melingo-bingokaart (replica van de app-PDF) — statisch gegenereerd */
const RC_SONGS = [
  ['Heb Je Even Voor Mij', 'Frans Bauer'], ['Laat De Zon In Je Hart', 'Rene Schuurmans'], ['Links Rechts', 'Snollebollekes'], ['Alle Kleuren', 'K3'], ['Naar Voren, Naar Achter', 'De Alpenzusjes'],
  ['Cotton Eye Joe', 'Rednex'], ['Wonderful Days Reloaded', 'Charly Lownoise'], ['Have You Ever Been Mellow', 'Party Animals'], ['Vrouwkes', 'Snollebollekes'], ['No Limit', '2 Unlimited'],
  ['Met Romana op de scooter', 'Zanger Rinus'], ['Oya Lélé', 'K3'], ['Dragostea din tei', 'O-Zone'], ['Sex Met Die Kale', 'Lawineboys'],
  ['Axel F', 'Crazy Frog'], ['Engelbewaarder', 'Marco Schuitmaker'], ['Boten Anna', 'Gebroeders Ko'], ['Country Roads', 'Hermes House Band'], ['Mambo No. 5', 'Lou Bega'],
  ['Ik Neem Je Mee', 'Gers Pardoel'], ['Viben', 'K-Liber'], ['Schudden', 'Def Rhymz'], ['The Grease Megamix', 'John Travolta'], ['Als De Morgen Is Gekomen', 'Jan Smit'],
  ['Y.M.C.A.', 'Village People'], ['Barbie Girl', 'Aqua'], ['We Like To Party!', 'Vengaboys'], ['Viva Hollandia', 'Wolter Kroes'],
  ['Rasputin', 'Boney M.'], ['Wasmasjien', 'Trafassi'], ['Kabouterdans – Remix', 'Kabouter Plop'], ['Leef', 'André Hazes Jr.']
];
function rcCells(seed) {
  const list = RC_SONGS.slice();
  const picked = [];
  let s = seed * 9301 + 49297;
  while (picked.length < 24 && list.length) {
    s = (s * 233280 + 49297) % 2147483647;
    picked.push(list.splice(s % list.length, 1)[0]);
  }
  let html = '', si = 0;
  for (let i = 0; i < 25; i++) {
    if (i === 12) { html += '<div class="rc-cell rc-free"><span class="rc-vinyl"></span></div>'; continue; }
    const sng = picked[si++];
    const tint = ['', ' a', ' b'][(i * 7 + seed) % 3];
    html += `<div class="rc-cell${tint}"><span class="rc-t">${sng[0]}</span><span class="rc-a">${sng[1]}</span></div>`;
  }
  return html;
}
function realCard(label, seed, variant) {
  return `<div class="rc${variant ? ' ' + variant : ''}">
    <div class="rc-hd"><div><div class="rc-logo">Melingo</div><div class="rc-tagline">Where melody meets bingo</div></div><div class="rc-badge">${label}</div></div>
    <div class="rc-bingo"><span>B</span><span>I</span><span>N</span><span>G</span><span>O</span></div>
    <div class="rc-grid">${rcCells(seed)}</div>
    <div class="rc-ft">melingo.app — Where melody meets bingo</div>
  </div>`;
}
function miniCard(label, seed) {
  const variants = ['', 'rc-purple', 'rc-blue'];
  return `<div class="ph-mini">${realCard(label, seed, variants[seed % 3])}</div>`;
}

/* placeholder-cover per categorie */
function phCover(post, big) {
  const variants = {
    guide:    `${miniCard('KAART 1', 1)}<div class="ph-tracks"><div class="ph-track"><span class="ph-art"></span><span class="ph-line"></span></div><div class="ph-track"><span class="ph-art b"></span><span class="ph-line s"></span></div><div class="ph-track"><span class="ph-art"></span><span class="ph-line"></span></div></div>`,
    party:    `<div class="ph-tracks"><div class="ph-track"><span class="eq"><i></i><i></i><i></i><i></i></span><span class="ph-line"></span></div><div class="ph-track"><span class="ph-art w"></span><span class="ph-line s"></span></div></div>${miniCard('KAART 7', 3)}`,
    spotify:  `<div class="ph-tracks"><div class="ph-track"><span class="ph-art g"></span><span class="ph-line"></span></div><div class="ph-track"><span class="ph-art g"></span><span class="ph-line s"></span></div><div class="ph-track"><span class="ph-art g"></span><span class="ph-line"></span></div></div>${miniCard('KAART 2', 5)}`,
    business: `${miniCard('KAART 4', 2)}<div class="ph-tracks"><div class="ph-track"><span class="ph-art b"></span><span class="ph-line"></span></div><div class="ph-track"><span class="ph-art b"></span><span class="ph-line s"></span></div></div>`,
    season:   `<div class="ph-tracks"><div class="ph-track"><span class="ph-art w"></span><span class="ph-line"></span></div><div class="ph-track"><span class="ph-art w"></span><span class="ph-line s"></span></div></div>${miniCard('KAART 12', 4)}`
  };
  return `<div class="ph ph-${post.ph}" data-placeholder="${post.coverImage}" role="img" aria-label="${esc(post.coverAlt)}"><div class="ph-inner" aria-hidden="true">${variants[post.ph]}</div></div>`;
}

function head(title, desc, canonical, extra) {
  return `<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}"/>
<link rel="canonical" href="${canonical}"/>
<meta property="og:type" content="${extra && extra.article ? 'article' : 'website'}"/>
<meta property="og:title" content="${esc(title)}"/>
<meta property="og:description" content="${esc(desc)}"/>
<meta property="og:url" content="${canonical}"/>
<meta property="og:site_name" content="Melingo"/>
<meta name="twitter:card" content="summary"/>
<meta name="twitter:title" content="${esc(title)}"/>
<meta name="twitter:description" content="${esc(desc)}"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/blog.css"/>`;
}

function blogCard(post, wide) {
  return `<a href="/blog/${post.slug}" class="bcard${wide ? ' wide' : ''}" data-cat="${post.catKey}" data-search="${esc((post.title + ' ' + post.excerpt + ' ' + post.category).toLowerCase())}">
        ${phCover(post)}
        <div class="bcard-body">
          <span class="bcard-cat">${esc(post.category)}</span>
          <span class="bcard-t">${esc(post.title)}</span>
          <span class="bcard-x">${esc(post.excerpt)}</span>
          <span class="bcard-meta"><time datetime="${post.date}">${post.dateNl}</time><span>·</span><span>${post.minutes} min leestijd</span></span>
          <span class="arrow-link">Lees het artikel <svg class="ic" aria-hidden="true"><use href="#i-arrow"/></svg></span>
        </div>
      </a>`;
}

function inlineCta(type) {
  const c = CTA_TYPES[type];
  return `<div class="acta">
  <div><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p></div>
  <a href="${c.href}" class="btn btn-primary">${esc(c.btn)} <svg class="ic" aria-hidden="true"><use href="#i-arrow"/></svg></a>
</div>`;
}

/* ── BOUW ── */
const byDate = POSTS.slice().sort((a, b) => a.date.localeCompare(b.date));
for (const p of POSTS) {
  p.body = fs.readFileSync(path.join(ROOT, 'blog', 'content', p.slug + '.html'), 'utf8').trim();
  p.minutes = readingTime(p.body);
}

/* ═══ OVERZICHTSPAGINA ═══ */
const featured = POSTS.find(p => p.featured);
const rest = POSTS.filter(p => !p.featured);
const gridA = rest.filter(p => ['muziekbingo-met-spotify', 'muziekbingo-kaarten-printen', 'muziekbingo-voor-bedrijfsborrel'].includes(p.slug));
const themed = rest.filter(p => ['muziekbingo-ideeen-voor-feestje', 'foute-muziekbingo-ideeen', 'kerst-muziekbingo-organiseren'].includes(p.slug));

const overview = `<!DOCTYPE html>
<html lang="nl">
<head>
${head('Muziekbingo tips, ideeën en gidsen | Melingo Blog',
  'Ontdek praktische muziekbingo-tips, feestideeën, Spotify-gidsen en draaiboeken voor verjaardagen, teamuitjes, bruiloften en evenementen.',
  BASE + '/blog')}
</head>
<body>
${SPRITE}
${NAV}
<main>

<!-- BLOGHERO -->
<section class="bhero">
  <div class="wrap bhero-inner">
    <div>
      <span class="label">Inspiratie, tips &amp; draaiboeken</span>
      <h1>Alles voor een geslaagde <span class="grad-text">muziekbingo.</span></h1>
      <p class="bhero-sub">Praktische gidsen, feestideeën, muziekthema's en slimme tips om van iedere avond een spel te maken.</p>
      <div class="bsearch" role="search">
        <svg class="ic" aria-hidden="true"><use href="#i-search"/></svg>
        <input type="search" id="blogSearch" placeholder="Zoek in tips en inspiratie" aria-label="Zoek in tips en inspiratie"/>
      </div>
    </div>
    <div class="bhero-vis" aria-hidden="true">
      <div class="bhero-stack">
        <div class="bv-chip tl"><span class="eq"><i></i><i></i><i></i><i></i></span><span class="bv-chip-t">Dancing Queen<span>ABBA · nu te horen</span></span></div>
        <div class="bv-card">${realCard('Kaart 7', 7, '')}</div>
        <div class="bv-chip br"><svg class="ic"><use href="#i-host"/></svg><span class="bv-chip-t">Hostscherm actief<span>12 van 40 gespeeld</span></span></div>
      </div>
    </div>
  </div>
</section>

<div class="wrap">

  <!-- UITGELICHT -->
  <a href="/blog/${featured.slug}" class="feat" data-cat="${featured.catKey}" data-search="${esc((featured.title + ' ' + featured.excerpt + ' ' + featured.category).toLowerCase())}">
    ${phCover(featured, true)}
    <div class="feat-body">
      <span class="feat-label">Uitgelicht</span>
      <span class="feat-cat">${esc(featured.category)}</span>
      <h2>${esc(featured.title)}</h2>
      <p>${esc(featured.excerpt)}</p>
      <span class="feat-meta"><time datetime="${featured.date}">${featured.dateNl}</time> · ${featured.minutes} min leestijd</span>
      <span class="arrow-link">Lees het artikel <svg class="ic" aria-hidden="true"><use href="#i-arrow"/></svg></span>
    </div>
  </a>

  <!-- FILTERS -->
  <div class="bfilters" role="group" aria-label="Filter artikelen op categorie">
    ${FILTERS.map((f, i) => `<button class="bfilter${i === 0 ? ' active' : ''}" data-filter="${f.key}" aria-pressed="${i === 0 ? 'true' : 'false'}">${f.label}</button>`).join('\n    ')}
  </div>
  <p class="bempty" id="blogEmpty">Geen artikelen gevonden. Probeer een andere zoekterm of categorie.</p>

  <!-- RASTER -->
  <div class="bgrid" id="gridA">
    ${blogCard(gridA[0], true)}
    ${blogCard(gridA[1])}
    ${blogCard(gridA[2])}
  </div>

  <!-- PRODUCT-CTA -->
  <div class="bcta" id="midCta">
    <div>
      <span class="label">Van inspiratie naar spel</span>
      <h2>Je idee gevonden? Maak er direct een muziekbingo van.</h2>
      <p>Kies je playlist, bepaal het aantal spelers en laat Melingo de unieke kaarten en het hostscherm regelen.</p>
      <div class="bcta-acts">
        <a href="/app" class="btn btn-primary">Maak mijn muziekbingo <svg class="ic" aria-hidden="true"><use href="#i-arrow"/></svg></a>
        <a href="/#zo-werkt-het" class="btn btn-ghost">Bekijk hoe Melingo werkt</a>
      </div>
    </div>
    <div class="bcta-vis" aria-hidden="true">
      ${miniCard('KAART 1', 6)}
      <div class="ph-tracks"><div class="ph-track"><span class="eq"><i></i><i></i><i></i><i></i></span><span class="ph-line"></span></div><div class="ph-track"><span class="ph-art"></span><span class="ph-line s"></span></div><div class="ph-track"><span class="ph-art b"></span><span class="ph-line"></span></div></div>
    </div>
  </div>

  <!-- THEMATISCH BLOK -->
  <div class="btheme" id="themeBlock">
    <div class="btheme-hd">
      <h2>Populair voor feestjes</h2>
      <span class="label">Feestideeën &amp; seizoenen</span>
    </div>
    <div class="bgrid">
      ${themed.map(p => blogCard(p)).join('\n      ')}
    </div>
  </div>

</div>

<!-- EIND-CTA -->
<section class="einde">
  <div class="einde-grid" aria-hidden="true"></div>
  <div class="wrap">
    <p class="label">Klaar om te spelen?</p>
    <h2>Maak van jouw muziek het spel van de avond.</h2>
    <p>Gebruik je eigen Spotify-playlist, kies een kant-en-klaar thema of maak alleen unieke bingokaarten.</p>
    <div class="einde-acts">
      <a href="/app" class="btn btn-primary btn-lg">Maak mijn muziekbingo <svg class="ic" aria-hidden="true"><use href="#i-arrow"/></svg></a>
      <a href="/#speelopties" class="arrow-link">Bekijk de speelopties <svg class="ic" aria-hidden="true"><use href="#i-arrow"/></svg></a>
    </div>
  </div>
</section>

</main>
${FOOTER}
<script>
(function(){
  'use strict';
  ${NAV_JS}

  /* — Filteren + zoeken — */
  var cards=[].slice.call(document.querySelectorAll('[data-cat]'));
  var filters=[].slice.call(document.querySelectorAll('.bfilter'));
  var search=document.getElementById('blogSearch');
  var empty=document.getElementById('blogEmpty');
  var sections=[document.getElementById('gridA'),document.getElementById('themeBlock'),document.getElementById('midCta')];
  var activeCat='alle';
  function apply(){
    var q=(search&&search.value||'').toLowerCase().trim();
    var visible=0;
    cards.forEach(function(c){
      var okCat=activeCat==='alle'||c.dataset.cat===activeCat;
      var okQ=!q||(c.dataset.search||'').indexOf(q)!==-1;
      var show=okCat&&okQ;
      c.style.display=show?'':'none';
      if(show)visible++;
    });
    /* verberg lege secties; mid-CTA alleen tonen in standaardweergave */
    var def=(activeCat==='alle'&&!q);
    var ga=document.getElementById('gridA');
    var tb=document.getElementById('themeBlock');
    if(ga)ga.style.display=ga.querySelector('[data-cat]:not([style*="none"])')?'':'none';
    if(tb)tb.style.display=tb.querySelector('[data-cat]:not([style*="none"])')?'':'none';
    var mc=document.getElementById('midCta');
    if(mc)mc.style.display=def?'':'none';
    if(empty)empty.style.display=visible?'none':'block';
  }
  filters.forEach(function(f){
    f.addEventListener('click',function(){
      filters.forEach(function(x){x.classList.remove('active');x.setAttribute('aria-pressed','false');});
      f.classList.add('active');f.setAttribute('aria-pressed','true');
      activeCat=f.dataset.filter;apply();
    });
  });
  if(search)search.addEventListener('input',apply);
})();
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(ROOT, 'blog.html'), overview);
console.log('blog.html OK (' + POSTS.length + ' artikelen)');

/* ═══ ARTIKELPAGINA'S ═══ */
for (const p of POSTS) {
  /* h2-ids + TOC */
  const toc = [];
  let secIdx = -1;
  let body = p.body.replace(/<h2>([\s\S]*?)<\/h2>/g, (m, t) => {
    const id = slugify(t.replace(/<[^>]+>/g, ''));
    toc.push({ id, t: t.replace(/<[^>]+>/g, '') });
    return `<h2 id="${id}">${t}</h2>`;
  });

  /* inline CTA's invoegen na de gekozen sectie */
  if (p.ctas && p.ctas.length) {
    const parts = body.split(/(?=<h2 )/);
    p.ctas.forEach(c => {
      const idx = c.afterH2 + (parts[0].startsWith('<h2') ? 0 : 1);
      if (parts[idx] !== undefined) parts[idx] = parts[idx] + '\n' + inlineCta(c.type) + '\n';
    });
    body = parts.join('');
  }

  const idx = byDate.findIndex(x => x.slug === p.slug);
  const prev = byDate[idx - 1] || null;
  const next = byDate[idx + 1] || null;
  const related = p.related.map(s => POSTS.find(x => x.slug === s)).filter(Boolean).slice(0, 3);
  const url = BASE + '/blog/' + p.slug;

  const articleLd = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Article',
    headline: p.title, description: p.excerpt,
    datePublished: p.date, inLanguage: 'nl',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url }, url,
    author: { '@type': 'Organization', name: 'Melingo', url: BASE },
    publisher: { '@type': 'Organization', name: 'Melingo', url: BASE }
  });
  const crumbLd = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE + '/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: BASE + '/blog' },
      { '@type': 'ListItem', position: 3, name: p.title, item: url }
    ]
  });

  const html = `<!DOCTYPE html>
<html lang="nl">
<head>
${head(p.title + ' | Melingo Blog', p.excerpt, url, { article: true })}
<script type="application/ld+json">${articleLd}</script>
<script type="application/ld+json">${crumbLd}</script>
</head>
<body>
${SPRITE}
${NAV}
<main>
<div class="wrap">

  <nav class="crumbs" aria-label="Kruimelpad">
    <a href="/">Home</a><span aria-hidden="true">/</span>
    <a href="/blog">Blog</a><span aria-hidden="true">/</span>
    <span aria-current="page">${esc(p.title)}</span>
  </nav>

  <header class="ahead">
    <span class="label">${esc(p.category)}</span>
    <h1>${esc(p.title)}</h1>
    <p class="alead">${esc(p.lead)}</p>
    <div class="ameta">
      <svg class="ic" aria-hidden="true"><use href="#i-cal"/></svg>
      <time datetime="${p.date}">${p.dateNl}</time>
      <span aria-hidden="true">·</span>
      <svg class="ic" aria-hidden="true"><use href="#i-clock"/></svg>
      <span>${p.minutes} minuten leestijd</span>
    </div>
  </header>

  <!-- PLACEHOLDER: vervang door ${p.coverImage} — ${p.coverAlt} -->
  <div class="ahero">${phCover(p, true)}</div>

  <div class="asum">
    <h2><svg class="ic" aria-hidden="true"><use href="#i-check"/></svg> Kort samengevat</h2>
    <ul>
      ${p.summary.map(s => '<li>' + esc(s) + '</li>').join('\n      ')}
    </ul>
  </div>

  <div class="alayout">
    <article class="prose">
${body}
    </article>

    <aside class="aside">
      <nav class="toc" id="toc" aria-label="Inhoudsopgave">
        <button class="toc-toggle" id="tocToggle" aria-expanded="false" aria-controls="tocList">In dit artikel <svg class="ic" aria-hidden="true"><use href="#i-chev-d"/></svg></button>
        <h2>In dit artikel</h2>
        <ol id="tocList">
          ${toc.map(t => `<li><a href="#${t.id}">${esc(t.t)}</a></li>`).join('\n          ')}
        </ol>
      </nav>
      <div class="aside-cta">
        <h3>Maak je eigen muziekbingo</h3>
        <p>Unieke kaarten, hostscherm en automatische bingocontrole — klaar in enkele minuten.</p>
        <a href="/app" class="btn btn-primary">Start nu <svg class="ic" aria-hidden="true"><use href="#i-arrow"/></svg></a>
      </div>
    </aside>
  </div>

  <section class="related" aria-label="Gerelateerde artikelen">
    <div class="sec-hd">
      <p class="label">Lees ook</p>
      <h2>Meer inspiratie</h2>
    </div>
    <div class="bgrid">
      ${related.map(r => blogCard(r)).join('\n      ')}
    </div>
  </section>

  <nav class="anav" aria-label="Artikelnavigatie">
    ${prev ? `<a href="/blog/${prev.slug}"><span class="anav-l">Vorig artikel</span><span class="anav-t">${esc(prev.title)}</span></a>` : '<span></span>'}
    ${next ? `<a href="/blog/${next.slug}" class="next"><span class="anav-l">Volgend artikel</span><span class="anav-t">${esc(next.title)}</span></a>` : '<span></span>'}
  </nav>

</div>

<section class="einde">
  <div class="einde-grid" aria-hidden="true"></div>
  <div class="wrap">
    <p class="label">Van plan naar spel</p>
    <h2>Klaar om je eigen muziekbingo te maken?</h2>
    <p>Gebruik je eigen playlist, kies een compleet thema of maak alleen unieke printbare kaarten.</p>
    <div class="einde-acts">
      <a href="/app" class="btn btn-primary btn-lg">Maak mijn muziekbingo <svg class="ic" aria-hidden="true"><use href="#i-arrow"/></svg></a>
      <a href="/#speelopties" class="arrow-link">Bekijk de speelopties <svg class="ic" aria-hidden="true"><use href="#i-arrow"/></svg></a>
    </div>
  </div>
</section>

</main>
${FOOTER}
<script>
(function(){
  'use strict';
  ${NAV_JS}

  /* — Inhoudsopgave: actieve sectie + mobiel inklapbaar — */
  var tocLinks=[].slice.call(document.querySelectorAll('#tocList a'));
  var heads=tocLinks.map(function(a){return document.getElementById(a.getAttribute('href').slice(1));}).filter(Boolean);
  if('IntersectionObserver' in window&&heads.length){
    var obs=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting){
          tocLinks.forEach(function(a){a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id);});
        }
      });
    },{rootMargin:'-20% 0px -70% 0px'});
    heads.forEach(function(h){obs.observe(h);});
  }
  var tt=document.getElementById('tocToggle'),toc=document.getElementById('toc');
  if(tt&&toc){
    tt.addEventListener('click',function(){
      var open=toc.classList.toggle('open');
      tt.setAttribute('aria-expanded',open?'true':'false');
    });
  }
})();
</script>
</body>
</html>
`;
  fs.writeFileSync(path.join(ROOT, 'blog', p.slug + '.html'), html);
  console.log('blog/' + p.slug + '.html OK (' + p.minutes + ' min, ' + toc.length + ' koppen)');
}
console.log('Klaar.');
