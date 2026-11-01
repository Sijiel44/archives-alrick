import type { QuartzComponent } from "./types"
// @ts-ignore Quartz compile les scripts inline
import script from "./scripts/atelier5d6-bestiary-workshop.inline"

const names=[["physique","Physique"],["agilite","Agilité"],["esprit","Esprit"],["presence","Présence"]] as const
const resistances=[["physique","Physique"],["magie","Magie"],["mental","Mental"]] as const
const masters=[["lames","Combat"],["esquive","Esquive"],["magie","Magie"],["runes","Runes"],["survie","Survie"],["volonte","Volonté"],["negociation","Diplomatie"]] as const
export const BestiaryWorkshop:QuartzComponent=(props)=>{
  if(props.fileData.slug!=="jouer/atelier-bestiary-5d6")return null
  return <section class="bestiary-lab" id="bestiary-workshop" aria-label="Atelier du Bestiaire 5d6">
    <p class="bestiary-message" role="status" data-status aria-live="polite">Atelier prêt. Les fiches restent dans ce navigateur.</p>
    <section class="m05-view" data-m05-view aria-label="Fiche vivante 5d6">
      <div class="bestiary-tools m05-controls">
        <label>Présentation de la fiche<select data-m05-format aria-label="Format de la fiche">
          <option value="essentielle">Essentielle et détails</option>
          <option value="combat">Fiche de combat MJ</option>
          <option value="encyclopedique">Fiche encyclopédique</option>
          <option value="pedagogique">Fiche pédagogique</option>
        </select></label>
        <button type="button" data-action="example-m05">Essayer le Colosse N15</button>
        <button type="button" data-action="print-m05">Imprimer la fiche</button>
      </div>
      <div data-m05-content aria-live="off" />
      <details class="m05-guide" data-m05-guide>
        <summary>Guide rapide : lire et créer une fiche</summary>
        <p>Une espèce décrit un peuple vivant, un individu une existence unique, un profil 5d6 une adaptation de jeu. Aucun profil ne devient canonique sans validation éditoriale.</p>
        <p>Choisissez le niveau (1 à 25) et l'archétype, puis personnalisez les caractéristiques et maîtrises. Les bonus croissent moins vite que les scores bruts. La défense fixe le seuil à atteindre ; la protection réduit ensuite les dégâts.</p>
        <p>La difficulté d'une rencontre dépend aussi du nombre d'adversaires, du terrain, des objectifs et des capacités : les probabilités sont des projections, non un playtest. Exportez le JSON avant de changer de navigateur.</p>
        <p><a href="./guide-fiches-vivantes-5d6">Lire le guide 5d6 complet</a></p>
      </details>
    </section>
    <div class="bestiary-tools">
      <label>Mes fiches<select data-active aria-label="Fiche à ouvrir"/></label>
      <button type="button" data-action="new">Nouvelle fiche</button>
      <button type="button" data-action="duplicate">Dupliquer</button>
      <button type="button" data-action="delete">Supprimer…</button>
      <button type="button" data-action="export">Exporter JSON</button>
      <label>Importer JSON<input data-import type="file" accept=".json,application/json"/></label>
      <button type="button" data-action="export-atelier">Exporter vers l'Atelier 5d6</button>
    </div>
    <nav class="bestiary-tools" aria-label="Niveau de détail">
      <button type="button" data-mode="rapide" aria-pressed="true">Rapide</button>
      <button type="button" data-mode="guide" aria-pressed="false">Guidé</button>
      <button type="button" data-mode="expert" aria-pressed="false">Expert</button>
    </nav>
    <fieldset><legend>1. Identité et construction</legend>
      <div class="bestiary-fields">
        <label>Nom<input data-text="name" type="text" maxLength={100}/></label>
        <label>Catégorie<select data-choice="kind"><option value="creature">Créature</option><option value="pnj">PNJ</option></select></label>
        <label>Niveau (1–25)<input type="number" min="1" max="25" step="1" data-level/></label>
        <label>Archétype<select data-archetype>
          <option value="faune">Faune</option><option value="predateur">Prédateur</option>
          <option value="gardien">Gardien</option><option value="mystique">Mystique</option>
          <option value="colosse">Colosse</option>
        </select></label>
        <label>Rôle<select data-choice="role"><option value="offensif">Offensif</option>
          <option value="defensif">Défensif</option><option value="soutien">Soutien</option></select></label>
        <label>Profession<input data-text="profession" maxLength={150}/></label>
      </div>
      <div class="bestiary-tools"><button type="button" data-action="regenerate">Recalculer le profil de départ…</button>
        <button type="button" data-action="reset">Annuler mes modifications numériques…</button></div>
      <p class="bestiary-warning">La régénération replace les statistiques et ressources à leurs valeurs initiales ; l'identité et les notes sont conservées.</p>
    </fieldset>
    <fieldset data-advanced><legend>2. Description et autorisation MJ</legend>
      <div class="bestiary-fields">
        <label>Origine (facultative)<input data-text="origin" maxLength={150}/></label>
        <label>Statut<select data-choice="status"><option value="brouillon">Brouillon</option>
          <option value="jeu_valide">Créature de jeu validée</option>
          <option value="documentaire_approuve">Documentaire approuvée par le MJ</option></select></label>
      </div>
      <label>Description<textarea data-text="description" rows={3}/></label>
      <label>Notes de MJ<textarea data-text="notes" rows={3}/></label>
    </fieldset>
    <fieldset data-advanced><legend>Liaison documentaire facultative (B-001)</legend>
      <p>Un code stable existant n'est pas une autorisation de publication. Ne placez aucune note secrète du MJ dans GitHub.</p>
      <div class="bestiary-fields">
        <label>Code documentaire existant<input data-m05-link="id" maxLength={90} placeholder="ex. DRG-01" /></label>
        <label>Type de dossier<select data-m05-link="type"><option value="individu">Individu</option><option value="espece">Espèce</option><option value="autre">Autre dossier</option></select></label>
        <label>Provenance à vérifier<input data-m05-link="source" maxLength={220} placeholder="source ou version" /></label>
      </div>
      <p class="bestiary-warning">Liaison déclarative non vérifiée, sans lien public automatique ni modification du statut canonique.</p>
    </fieldset>
    <fieldset data-advanced><legend>3. Caractéristiques et maîtrises</legend>
      <p>Les nombres bruts ne sont pas plafonnés à 12. Le bonus réel croît logarithmiquement.</p>
      <div class="bestiary-fields">
      {names.map(([key,title])=><label key={key}>{title}
        <input data-stat={key} type="number" min="1" max="9999" step="1"/>
        <output data-stat-effective={key}/></label>)}
      </div>
      <div class="bestiary-fields">
      {masters.map(([key,title])=><label key={key}>Maîtrise — {title}
        <input data-mastery={key} type="number" min="0" max="9999" step="1"/>
        <output data-mastery-effective={key}/></label>)}
      </div>
    </fieldset>
    <fieldset data-advanced><legend>4. Ressources et protection</legend>
      <div class="bestiary-fields">
        <label>PV maximum<input data-number="pvMax" type="number" min="1" max="999999"/></label>
        <label>Mana maximum<input data-number="manaMax" type="number" min="0" max="999999"/></label>
        <label>Dégâts de base (1–12)<input data-number="baseDamage" type="number" min="1" max="12"/></label>
        <label>Pénétration (0–8)<input data-number="penetration" type="number" min="0" max="8"/></label>
        {resistances.map(([key,title])=><div key={key} class="bestiary-defense">
          <strong>{title}</strong>
          <label>Bonus défense (0–8)<input data-def="resistanceBonus" data-kind={key} type="number" min="0" max="8"/></label>
          <label>Protection additionnelle (0–60)<input data-def="protection" data-kind={key} type="number" min="0" max="60"/></label>
          <label>Équipement (grade 0–5)<input data-def="equipmentGrades" data-kind={key} type="number" min="0" max="5"/></label>
        </div>)}
      </div>
    </fieldset>
    <fieldset data-advanced><legend>5. Capacités spéciales (narratives)</legend>
      <p>Les capacités ajoutées ici ne déclenchent aucun bonus automatique. L'approbation MJ est documentaire.</p>
      <div class="bestiary-fields">
        <label>Nom<input data-ability-name maxLength={100}/></label>
        <label>Limites<input data-ability-limit maxLength={500}/></label>
      </div>
      <label>Description<textarea data-ability-desc rows={2}/></label>
      <label><input data-ability-approved type="checkbox"/> Approuvée par le MJ</label>
      <button type="button" data-action="add-ability">Ajouter</button>
      <div data-abilities/>
    </fieldset>
    <fieldset><legend>6. Mathématiques et dangerosité</legend>
      <p data-formula/>
      <details open><summary>Voir la décomposition et les probabilités exactes</summary>
        <div class="bestiary-results" data-math/>
      </details>
      <div class="bestiary-fields">
        <label>Niveau adverse<input data-opponent-level type="number" min="1" max="25" value="5"/></label>
        <label>Profil adverse<select data-opponent-profile><option value="polyvalent">Polyvalent</option>
          <option value="offensif">Offensif</option><option value="defensif">Défensif</option></select></label>
        <label>Grade d'équipement<select data-opponent-equipment>
          {[0,1,2,3,4,5].map(n=><option value={n} key={n}>{n}</option>)}
        </select></label>
        <label>Nombre de personnages<input data-opponent-count type="number" min="1" max="8" value="4"/></label>
        <label>Circonstance (-2 à +2)<input data-situation type="number" min="-2" max="2" value="0"/></label>
      </div>
      <p data-danger/>
      <p class="bestiary-warning">L'indicateur est une projection mécanique, jamais une prédiction de victoire. Fuite, diplomatie, terrain, magie, objectifs et décisions du MJ ne sont pas modélisés.</p>
    </fieldset>
  </section>
}
BestiaryWorkshop.afterDOMLoaded=script
BestiaryWorkshop.css=String.raw`
.bestiary-lab{background:#0c202b;color:#f3eadb;padding:1.1rem;margin:1.5rem 0;border:1px solid #705c3f;border-radius:14px}
.bestiary-lab *{box-sizing:border-box}
.bestiary-lab fieldset{min-width:0;border:1px solid #516574;border-radius:8px;margin:1rem 0;padding:.85rem}
.bestiary-lab legend{font-weight:bold;color:#e5bd7d;padding:0 .4rem}
.bestiary-lab label{display:flex;flex-direction:column;gap:.25rem;min-width:0}
.bestiary-lab input:not([type=checkbox]),.bestiary-lab select,.bestiary-lab textarea{font:inherit;color:#f3eadb;background:#182d3d;border:1px solid #647c8b;border-radius:6px;padding:.45rem;max-width:100%}
.bestiary-lab .bestiary-fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(185px,1fr));gap:.75rem}
.bestiary-lab .bestiary-tools{display:flex;flex-wrap:wrap;align-items:end;gap:.5rem;margin:.5rem 0}
.bestiary-lab button{cursor:pointer;background:#203d4c;border:1px solid #ba945e;color:#f4eddf;border-radius:7px;font:inherit;padding:.52rem .7rem}
.bestiary-lab button[aria-pressed=true]{background:#715431}
.bestiary-lab .bestiary-defense{display:grid;gap:.5rem;border:1px solid #4f6472;padding:.5rem;border-radius:8px}
.bestiary-lab .bestiary-warning{font-size:.88rem;color:#e3c9a0}
.bestiary-lab output{font-size:.82rem;color:#c6e0e3}
.bestiary-lab [hidden]{display:none!important}
.bestiary-lab .bestiary-results{display:grid;gap:.4rem}
.bestiary-lab [data-abilities]>div{margin:.5rem 0;padding:.5rem;border:1px solid #465d6b;border-radius:7px}
@media(max-width:550px){.bestiary-lab{padding:.6rem}.bestiary-lab .bestiary-fields{grid-template-columns:1fr}}
.bestiary-lab .m05-view{--m05-line:#526c78;--m05-surface:#152e39;--m05-ink:#f5eddf;--m05-accent:#e9c48d;background:var(--m05-surface);border:1px solid var(--m05-line);padding:1rem;border-radius:12px;margin:1rem 0}
.bestiary-lab .m05-heading{display:flex;gap:1rem;align-items:center}
.bestiary-lab .m05-portrait{width:108px;min-width:108px;height:128px;border:1px dashed var(--m05-line);border-radius:9px;display:grid;place-items:center;overflow:hidden;background:#0e2530;color:#c6d7db;text-align:center;font-size:.75rem}
.bestiary-lab .m05-portrait img{width:100%;height:100%;object-fit:cover}
.bestiary-lab .m05-identity h3{margin:.15rem 0;font-size:1.45rem;color:var(--m05-ink)}
.bestiary-lab .m05-identity p{margin:.1rem 0}
.bestiary-lab .m05-eyebrow{color:var(--m05-accent);font-size:.88rem}
.bestiary-lab .m05-status,.bestiary-lab .m05-caution{font-size:.84rem;color:#decaa9}
.bestiary-lab .m05-teaser{margin:.75rem 0}
.bestiary-lab .m05-essential{display:grid;gap:1rem;margin-top:1rem;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr)}
.bestiary-lab .m05-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.55rem}
.bestiary-lab .m05-stat{display:flex;flex-direction:column;gap:.15rem;padding:.65rem;border:1px solid var(--m05-line);border-radius:9px;text-align:center}
.bestiary-lab .m05-stat-raw{font-size:1.55rem;font-variant-numeric:tabular-nums}
.bestiary-lab .m05-stat-title{color:var(--m05-accent)}
.bestiary-lab .m05-stat-bonus{font-size:.88rem}
.bestiary-lab .m05-quick{display:grid;align-content:start;gap:.25rem}
.bestiary-lab .m05-line{display:flex;justify-content:space-between;flex-wrap:wrap;gap:.3rem;border-bottom:1px solid var(--m05-line);padding:.35rem 0}
.bestiary-lab .m05-line strong{font-variant-numeric:tabular-nums;text-align:right}
.bestiary-lab .m05-panels{margin-top:1rem;display:grid;gap:.4rem}
.bestiary-lab .m05-panel{border:1px solid var(--m05-line);border-radius:8px}
.bestiary-lab .m05-panel summary{cursor:pointer;font-weight:600;padding:.6rem .7rem;color:var(--m05-accent)}
.bestiary-lab .m05-panel summary:focus-visible,.bestiary-lab button:focus-visible,.bestiary-lab select:focus-visible{outline:3px solid #f7d18a;outline-offset:2px}
.bestiary-lab .m05-panel-body{padding:.2rem .85rem .7rem}
.bestiary-lab .m05-def-block,.bestiary-lab .m05-ability{border-top:1px dashed var(--m05-line);margin-top:.7rem;padding-top:.5rem}
.bestiary-lab .m05-guide{margin:.8rem 0;border-top:1px solid var(--m05-line);padding-top:.6rem}
.bestiary-lab .m05-guide summary{cursor:pointer}
@media(max-width:670px){.bestiary-lab .m05-heading{align-items:start}.bestiary-lab .m05-portrait{width:78px;min-width:78px;height:95px}.bestiary-lab .m05-essential{grid-template-columns:1fr}.bestiary-lab .m05-stat{padding:.35rem}}
@media print{
  @page{margin:14mm}
  .bestiary-lab{background:white!important;color:black!important;border:0!important;padding:0!important}
  .bestiary-lab > :not([data-m05-view]){display:none!important}
  .bestiary-lab .m05-view{--m05-line:#999;--m05-surface:white;--m05-ink:black;--m05-accent:#222;color:black!important;border:0;padding:0}
  .bestiary-lab .m05-controls,.bestiary-lab .m05-guide{display:none!important}
  .bestiary-lab .m05-panel{break-inside:avoid}
  .bestiary-lab .m05-panel summary{display:none}
  .bestiary-lab [data-m05-format="combat"] .m05-panel:not([data-m05-panel="combat"]):not([data-m05-panel="defenses"]):not([data-m05-panel="abilities"]){display:none!important}
  .bestiary-lab [data-m05-format="encyclopedique"] .m05-panel:not([data-m05-panel="lore"]):not([data-m05-panel="sources"]){display:none!important}
  .bestiary-lab [data-m05-format="pedagogique"] .m05-panel:not([data-m05-panel="math"]):not([data-m05-panel="stats"]):not([data-m05-panel="defenses"]){display:none!important}
}


/* Impression M05 : fiche seule, sans navigation du site ni texte pastel sur fond blanc. */
@media print {
  body:has(#bestiary-workshop) .left.sidebar,
  body:has(#bestiary-workshop) .right.sidebar,
  body:has(#bestiary-workshop) .archive-topbar,
  body:has(#bestiary-workshop) .archive-intro,
  body:has(#bestiary-workshop) .archive-footer,
  body:has(#bestiary-workshop) .skip-link,
  body:has(#bestiary-workshop) .center > article,
  body:has(#bestiary-workshop) .center > hr,
  body:has(#bestiary-workshop) .center > .page-footer {
    display:none!important;
  }
  body:has(#bestiary-workshop),
  body:has(#bestiary-workshop) #quartz-body,
  body:has(#bestiary-workshop) .center,
  body:has(#bestiary-workshop) .page-header,
  body:has(#bestiary-workshop) .popover-hint {
    display:block!important;
    background:#fff!important;
    color:#111!important;
    margin:0!important;
    padding:0!important;
    width:100%!important;
    max-width:none!important;
    min-height:0!important;
    box-shadow:none!important;
  }
  body:has(#bestiary-workshop) .bestiary-lab .m05-view,
  body:has(#bestiary-workshop) .bestiary-lab .m05-view * {
    color:#111!important;
    text-shadow:none!important;
  }
  body:has(#bestiary-workshop) .bestiary-lab .m05-portrait {
    background:white!important;
    border-color:#888!important;
  }
  body:has(#bestiary-workshop) .bestiary-lab .m05-panel {
    break-inside:auto!important;
  }
  body:has(#bestiary-workshop) .bestiary-lab .m05-line {
    break-inside:avoid-page;
  }
}
`
