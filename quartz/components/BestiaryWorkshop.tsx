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
`
