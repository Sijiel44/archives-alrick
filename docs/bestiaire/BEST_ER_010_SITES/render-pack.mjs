import fs from 'node:fs';
import path from 'node:path';

// Relecture documentaire locale : ce générateur ne publie et n’importe rien.
if (!process.argv[2]) throw new Error('Usage : node render-pack.mjs <dossier-du-lot>');
const root = path.resolve(process.argv[2]);
const lot = JSON.parse(fs.readFileSync(path.join(root, 'lot-v0.1.json'), 'utf8'));
if (!Array.isArray(lot.entries) || lot.entries.length !== 10) throw new Error('Dix fiches sont attendues.');
const entries = lot.entries;
const seen = new Set();
for (const e of entries) {
  if (!/^BEST-ER-010-\d{3}$/.test(e.id) || seen.has(e.id)) throw new Error('Identifiant invalide ou répété.');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(e.slug)) throw new Error('Slug invalide.');
  if (e.publish !== false || e.canon_statut !== 'proposition_non_jouee' || e.etat_editorial !== 'en_chantier' || e.candidateRegistryId !== null) throw new Error(`Statuts incompatibles : ${e.id}`);
  seen.add(e.id);
}
const labels = {
  id:'Identifiant de travail', candidateRegistryId:'Code permanent candidat', registryStatus:'Attribution au registre',slug:'Adresse de travail',name:'Nom',category:'Catégorie',family:'Classement descriptif proposé',size:'Gabarit',portee:'Portée',
  description:'Description',habitat:'Habitat',ecology:'Écologie',diet:'Alimentation',lifeCycle:'Cycle de vie',role:'Rôle écologique',seasonality:'Saisonnalité',behavior:'Comportement et rencontre',ordinary:'Vie ordinaire',warningSigns:'Signes et avertissements',firstContact:'Premier contact',escalation:'Escalade',retreat:'Retraite',coexistence:'Coexistence',
  abilitiesDescriptive:'Capacités descriptives',effect:'Effet proposé',conditions:'Conditions',limits:'Limites',counterplay:'Contre-mesures',strengths:'Forces et possibilités de jeu',evolution:'Évolutions possibles',naturalStages:'Développement ordinaire',possibleAdaptations:'Adaptations individuelles proposées',gameRoles:'Rôles de rencontre',weaknesses:'Fragilités',variants:'Variantes proposées',resources:'Ressources et usages proposés',renewable:'Collecte renouvelable',harmful:'Prélèvements nuisibles',proposedUses:'Usages à étudier',alchemy:'Piste alchimique proposée',material:'Matière récupérable',proposedUse:'Usage expérimental',validation:'État des recettes et bonus',
  quests:'Quatre amorces de jeu — propositions non jouées',title:'Amorce',situation:'Situation proposée',choice:'Choix possibles',openOutcome:'Issue ouverte',relatedReferencesToReview:'Rapprochements et contrôle des identités',reference:'Référence à comparer',distinction:'Distinction proposée',residualRisk:'Réserve restante',
  provenance:'Provenance',editorialStatus:'Statut éditorial de préparation',canon_statut:'Statut de canon',etat_editorial:'État éditorial',canonValidated:'Canon validé',publish:'Publication autorisée dans cette version',prototype:'Prototype de règles',visibility:'Visibilité de travail',playedFact:'Fait joué',mjSecrets:'Secrets MJ',mechanics:'Profil et règles 5d6',status:'État',profile:'Profil chiffré',illustration:'Illustration',path:'Fichier local',alt:'Texte alternatif',brief:'Brief artistique',gameRole:'Fonction de rencontre proposée',public_cible:'Public visé',usage_en_jeu:'Usages de jeu',version:'Version',date:'Date documentaire',sourceReferences:'Références documentaires'
};
const label = k => labels[k] || k;
const text = v => v === null ? 'Non attribué / absent (null)' : v === false ? 'Non (false)' : v === true ? 'Oui (true)' : String(v);
const esc = v => text(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const md = v => text(v).replaceAll('\\','\\\\').replaceAll('|','\\|').replace(/\r?\n/g,'\n\n');
const norm = v => String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const imagePath = e => {
  const source=e.illustration?.path;
  if (source === null || source === undefined || source === '') return null;
  if (typeof source !== 'string') throw new Error('Chemin illustration invalide.');
  const relative=source.replaceAll('\\','/');
  if (relative.startsWith('/') || relative.includes(':') || relative.split('/').includes('..')) throw new Error('Illustration hors du lot.');
  if (!fs.existsSync(path.join(root,relative))) throw new Error(`Illustration absente : ${relative}`);
  return relative;
};
function markdownValue(v) {
  if (v === null || typeof v !== 'object') return md(v);
  if (Array.isArray(v)) {
    if (!v.length) return 'Aucun élément.';
    return v.map((item,i) => item === null || typeof item !== 'object' ? `- ${md(item)}` : `**${i+1}. ${md(item.name || item.title || item.reference || 'Élément')}**\n\n${markdownValue(item)}`).join('\n\n');
  }
  return Object.entries(v).map(([k,part])=>`**${label(k)} :** ${markdownValue(part)}`).join('\n\n');
}
function htmlValue(v) {
  if (v === null || typeof v !== 'object') return `<p>${esc(v)}</p>`;
  if (Array.isArray(v)) {
    if (!v.length) return '<p>Aucun élément.</p>';
    if (v.every(item=>item === null || typeof item !== 'object')) return `<ul>${v.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`;
    return `<div class="items">${v.map((item,i)=>`<div class="item"><h4>${esc(item?.name || item?.title || item?.reference || `Élément ${i+1}`)}</h4>${htmlValue(item)}</div>`).join('')}</div>`;
  }
  return `<dl>${Object.entries(v).map(([k,part])=>`<div><dt>${esc(label(k))}</dt><dd>${htmlValue(part)}</dd></div>`).join('')}</dl>`;
}
const order=['description','habitat','ecology','behavior','abilitiesDescriptive','strengths','weaknesses','variants','evolution','resources','quests','relatedReferencesToReview','provenance','mechanics','illustration'];
const identity=['id','name','slug','category','family','size','portee','candidateRegistryId','registryStatus'];
const statuses=['editorialStatus','canon_statut','etat_editorial','canonValidated','publish','prototype','visibility','playedFact','mjSecrets'];
const known=new Set([...order,...identity,...statuses]);
function sections(e) {
  const select=keys=>Object.fromEntries(keys.filter(k=>k in e).map(k=>[k,e[k]]));
  const out=[['Identité documentaire',select(identity)]];
  for (const k of order) if (k in e) out.push([label(k),e[k]]);
  out.push(['Statuts et limites de publication',select(statuses)]);
  const extras=Object.entries(e).filter(([k])=>!known.has(k));
  if (extras.length) out.push(['Champs complémentaires de la source',Object.fromEntries(extras)]);
  return out;
}
fs.mkdirSync(path.join(root,'fiches'),{recursive:true});
for (const e of entries) {
  const image=imagePath(e);
  const fm=['---',`id_travail: ${JSON.stringify(e.id)}`,`title: ${JSON.stringify(e.name)}`,'portee: univers_partage','canon_statut: proposition_non_jouee','etat_editorial: en_chantier','publish: false','---',''].join('\n');
  const intro=`# ${e.name}\n\n> Proposition originale non jouée · Brouillon non publié · Identifiant de travail uniquement. Aucun code permanent ni profil 5d6 attribué.\n\n`;
  const art=image?`![${md(e.illustration.alt)}](<../${image}>)\n\n`:'> Illustration encore à produire.\n\n';
  const body=sections(e).map(([title,v])=>`## ${title}\n\n${markdownValue(v)}\n`).join('\n');
  fs.writeFileSync(path.join(root,'fiches',`${e.id}-${e.slug}.md`),fm+intro+art+body,'utf8');
}
const cards=entries.map(e=>{
  const image=imagePath(e);
  return `<article class="card" data-id="${esc(e.id)}" data-search="${esc(norm(JSON.stringify(e)))}"><a class="card-link" href="#${esc(e.id)}" data-open="${esc(e.id)}">${image?`<img src="${esc(image)}" alt="${esc(e.illustration.alt)}" loading="lazy" width="960" height="640">`:'<div class="no-art">Illustration à produire</div>'}<div class="card-body"><span class="status">Proposition non publiée</span><h2>${esc(e.name)}</h2><p class="family">${esc(e.family)}</p><p class="excerpt">${esc(e.description)}</p><span class="read">Lire la fiche complète</span></div></a></article>`;
}).join('\n');
const readers=entries.map(e=>{
  const image=imagePath(e);
  return `<details class="reader" id="${esc(e.id)}" data-id="${esc(e.id)}" data-search="${esc(norm(JSON.stringify(e)))}"><summary><span>${esc(e.name)}</span><span class="status">Brouillon · non publié</span></summary><div class="reader-body">${image?`<img class="hero" src="${esc(image)}" alt="${esc(e.illustration.alt)}" loading="lazy" width="960" height="640">`:''}<p class="notice">Création originale proposée, sans fait de campagne attesté. Capacités narratives sans chiffres de règles homologués. Variantes et amorces également proposées.</p>${sections(e).map(([title,v])=>`<section><h3>${esc(title)}</h3>${htmlValue(v)}</section>`).join('')}<p><a href="#catalogue">Revenir au catalogue</a></p></div></details>`;
}).join('\n');
const html=`<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="color-scheme" content="dark"><title>Les profondeurs et les souterrains — relecture BEST-ER-010</title><style>
:root{color-scheme:dark;--bg:#101b18;--panel:#182923;--ink:#f1f3e9;--muted:#b7c8b9;--copper:#d6a278;--line:#3a5345}*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:1rem}body{margin:0;background:var(--bg);color:var(--ink);font:1rem/1.65 system-ui,-apple-system,"Segoe UI",sans-serif}a{color:var(--copper);text-underline-offset:.2em}a:focus-visible,input:focus-visible,summary:focus-visible{outline:3px solid #f4c394;outline-offset:5px}header,main,footer{max-width:1370px;margin:auto;padding:2rem clamp(1rem,4vw,3.5rem)}header{padding-top:3.5rem;padding-bottom:1rem}.eyebrow{color:var(--copper);font-size:.9rem;letter-spacing:.1em;text-transform:uppercase}h1,h2,h3,h4{font-family:Georgia,serif;line-height:1.2;font-weight:500;overflow-wrap:anywhere}h1{font-size:clamp(2.2rem,5vw,4.7rem);max-width:900px;margin:.5rem 0 1.5rem}h2{font-size:1.6rem;margin:.75rem 0}h3{font-size:1.6rem;color:var(--copper);margin:2rem 0 1rem}h4{font-size:1.2rem;margin:.3rem 0 .8rem}.lede{max-width:900px;color:var(--muted);font-size:1.1rem}.banner{border-left:3px solid var(--copper);padding:1rem 1.2rem;background:var(--panel);max-width:980px}.banner strong{display:block}.banner p{margin:.3rem 0;color:var(--muted)}.tools{display:flex;align-items:end;gap:1.5rem;flex-wrap:wrap;padding:1.4rem 0 1.8rem}.search{flex:1 1 360px;max-width:760px}.search label{display:block;margin-bottom:.5rem;font-weight:600}input{width:100%;font:inherit;color:var(--ink);background:#0d1713;border:1px solid #72917c;border-radius:.3rem;padding:.8rem 1rem}#count{margin:0 0 .7rem;color:var(--muted)}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1.3rem}.card{border:1px solid var(--line);background:var(--panel);border-radius:.5rem;overflow:hidden;min-width:0}.card-link{display:block;height:100%;text-decoration:none;color:inherit}.card-link:hover{background:#1c3028}.card img,.no-art{display:block;width:100%;height:auto;aspect-ratio:3/2;object-fit:cover;background:#24303c}.no-art{display:grid;place-items:center;color:var(--muted)}.card-body{padding:1.4rem}.excerpt{font-size:.98rem;color:var(--muted);display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}.status{display:inline-block;font-size:.88rem;color:var(--copper);border-bottom:1px solid #9b7659;padding-bottom:.1rem}.family{font-size:.9rem;color:var(--muted);margin:.4rem 0}.read{display:inline-block;margin-top:.7rem;color:var(--copper);font-weight:600}.readers{margin-top:4rem}.readers>h2{font-size:2rem}.reader{border:1px solid var(--line);border-radius:.4rem;background:var(--panel);margin:0 0 1rem;scroll-margin-top:1rem}.reader[open]{border-color:#829b77}summary{cursor:pointer;padding:1.1rem 1.4rem;overflow-wrap:anywhere}summary>span:first-child{font-family:Georgia,serif;font-size:1.4rem}summary>.status{margin-left:1rem}.reader-body{padding:0 clamp(1rem,3vw,2.5rem) 1.8rem;max-width:1100px;margin:auto}.hero{display:block;width:100%;max-height:650px;object-fit:contain;height:auto;margin:1rem auto 1.6rem;border-radius:.3rem}.notice{color:var(--muted);padding:1rem;border:1px solid var(--line);font-size:.95rem}section{border-top:1px solid var(--line);margin-top:1.6rem}dl{margin:0}dl>div{margin:1rem 0}dt{font-weight:650;color:#dbe2ec}dd{margin:.3rem 0 0}dd>p{margin:.3rem 0}dd>dl{padding-left:1rem;border-left:2px solid var(--line)}p,li,dd{overflow-wrap:anywhere}.items{display:grid;gap:1rem}.item{padding:1rem;background:#111c27;border:1px solid var(--line);border-radius:.3rem}.item dl{font-size:.98rem}footer{color:var(--muted);border-top:1px solid var(--line);font-size:.95rem}.empty{padding:2rem;border:1px solid var(--line);color:var(--muted)}[hidden]{display:none!important}@media(max-width:1050px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:620px){header{padding-top:2rem}.grid{grid-template-columns:1fr}.card-body{padding:1.1rem}.tools{gap:.3rem}.search{flex-basis:100%}summary>.status{display:block;margin:.45rem 0 0}summary{padding:1rem}.reader-body{padding-left:1rem;padding-right:1rem}h3{font-size:1.4rem}.item{padding:.8rem}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
</style></head><body><header><p class="eyebrow">Les Chroniques d’Entre-Rives · Atelier du Bestiaire</p><h1>Les profondeurs et les souterrains</h1><p class="lede">Dix silhouettes merveilleuses pour explorer, observer, choisir et jouer dans les galeries et les salles profondes. BEST-ER-010 · version ${esc(lot.version || '0.1.0')}.</p><div class="banner"><strong>Relecture locale · dix propositions non publiées</strong><p>Ce dossier prépare la validation éditoriale. Il ne modifie pas le catalogue du Studio, ne constitue pas un import Sites et n’attribue aucun code permanent.</p></div></header><main><div id="catalogue" class="tools"><div class="search"><label for="search">Chercher une créature, un milieu ou une capacité</label><input id="search" type="search" placeholder="Ex. : humus, ombre, filaments…" autocomplete="off"></div><p id="count" role="status" aria-live="polite">10 fiches proposées</p></div><div class="grid">${cards}</div><p class="empty" id="empty" hidden>Aucune fiche ne correspond. Essayez un autre mot ou effacez la recherche.</p><div class="readers"><h2>Les fiches complètes</h2><p class="lede">Ouvrez une notice pour son écologie, ses réactions, les limites de ses capacités et ses quatre amorces de jeu. Tous les champs documentaires restent visibles pour la relecture.</p>${readers}</div></main><footer>BEST-ER-010 · Univers partagé · Créations originales proposées · Aucun fait joué, profil 5d6 homologué ni secret MJ. Fichier local autonome, sans connexion ni service externe.</footer><script>
const norm=value=>value.normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase();
const search=document.getElementById('search');
search.addEventListener('input',()=>{const query=norm(search.value).trim();const exactId=[...document.querySelectorAll('.card')].find(el=>norm(el.dataset.id)===query);const words=query.split(/\\s+/).filter(Boolean);let count=0;document.querySelectorAll('.card,.reader').forEach(element=>{const visible=exactId?norm(element.dataset.id)===query:words.every(word=>element.dataset.search.includes(word));element.hidden=!visible;if(visible&&element.classList.contains('card'))count++;});document.getElementById('count').textContent=count+' fiche'+(count!==1?'s':'')+' proposée'+(count!==1?'s':'');document.getElementById('empty').hidden=count!==0;});
function openHash(){const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(target&&target.classList.contains('reader')){target.hidden=false;target.open=true;}}
document.querySelectorAll('[data-open]').forEach(link=>link.addEventListener('click',()=>{const target=document.getElementById(link.dataset.open);target.hidden=false;target.open=true;}));window.addEventListener('hashchange',openHash);openHash();
</script></body></html>\n`;
fs.writeFileSync(path.join(root,'APERCU.html'),html,'utf8');
const readme=`# Les profondeurs et les souterrains\n\nBEST-ER-010 · version ${lot.version || '0.1.0'} · dix créations originales proposées pour les Chroniques d’Entre-Rives.\n\n**État : relecture locale, non publié.** Les dix identifiants sont des identifiants de travail. Aucun code permanent, canon validé ou profil 5d6 n’est attribué. Les amorces sont non jouées et ne relatent aucun événement d’Orin.\n\nOuvrir [APERCU.html](APERCU.html) directement dans un navigateur pour rechercher et lire les dix fiches avec leurs illustrations. Le dossier ne dépend d’aucun réseau ni service externe ; conserver ses sous-dossiers ensemble.\n\n| Identifiant de travail | Fiche | Statut |\n| --- | --- | --- |\n${entries.map(e=>`| ${e.id} | [${e.name}](fiches/${e.id}-${e.slug}.md) | Proposition · non publiée |`).join('\n')}\n\n## Sources et reproduction\n\n[lot-v0.1.json](lot-v0.1.json) est la source structurée. Le générateur fourni \`render-pack.mjs\` produit cet aperçu, les dix fiches Markdown et le présent index :\n\n\`node render-pack.mjs <dossier-du-lot>\`\n\nLes illustrations restent des propositions originales. Consulter briefs, textes alternatifs, provenance et empreintes dans le manifeste du lot. Générer cet aperçu ne modifie ni les illustrations, ni les registres, ni le catalogue public.\n\n## Avant une intégration\n\n1. Valider le statut des fiches et l’attribution éventuelle de codes permanents ; préserver réserves et rapprochements.\n2. Recontrôler les doublons contre le catalogue Sites courant et adapter les champs au véritable contrat du Studio. Ce paquet n’est pas un import de production.\n3. Valider les illustrations et leurs usages ; vérifier liens, médias, filtres, bureau et mobile dans la source courante du projet Sites existant.\n4. Publier seulement les fiches explicitement approuvées après recette, sur le projet existant. GitHub et une pull request ne publient rien dans Sites.\n\nArchives d’Orin, sauvegardes de campagne et secrets MJ restent hors de ce lot.\n`;
fs.writeFileSync(path.join(root,'README.md'),readme,'utf8');
console.log(JSON.stringify({entries:entries.length,markdownFiles:entries.length,preview:path.join(root,'APERCU.html'),readme:path.join(root,'README.md')}));
