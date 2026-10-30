import type { QuartzComponent } from "./types"
// @ts-ignore Quartz compile les ressources .inline.ts pour la navigation SPA
import script from "./scripts/atelier5d6.inline"

const attributes = [
  ["physique", "Physique", "Force, endurance, mêlée"],
  ["agilite", "Agilité", "Précision, esquive, discrétion"],
  ["esprit", "Esprit", "Observation, savoirs, magie"],
  ["presence", "Présence", "Négociation, volonté, autorité"],
] as const

export const Atelier5d6: QuartzComponent = (props) => {
  if (props.fileData.slug !== "jouer/atelier-5d6") return null
  return <section class="atelier" id="atelier-5d6" aria-label="Atelier interactif 5d6">
    <p class="atelier-intro">Une feuille, cinq dés et une seule formule. <strong>Prototype de test</strong> — sauvegarde locale, sans compte ni serveur.</p>
    <div class="atelier-tabs" role="tablist" aria-label="Choisir le rôle">
      <button type="button" data-mode="pj" role="tab" aria-selected="true">Joueur</button>
      <button type="button" data-mode="mj" role="tab" aria-selected="false">Maître du jeu</button>
      <button type="button" data-mode="ia" role="tab" aria-selected="false">MJ assisté par IA</button>
    </div>
    <p class="atelier-notice" data-status role="status" aria-live="polite">Les changements sont enregistrés dans ce navigateur.</p>
    <div class="atelier-toolbar">
      <label>Personnage actif
        <select data-active aria-label="Sélectionner un personnage">
          <option value="">Personnage de départ</option>
        </select>
      </label>
      <button type="button" data-new>Nouvelle fiche</button>
      <button type="button" data-export>Exporter JSON</button>
      <label>Importer JSON
        <input type="file" accept=".json,application/json" data-import aria-label="Importer un fichier de personnages JSON"/>
      </label>
    </div>
    <div class="atelier-grid">
      <div class="atelier-panel">
        <h3>Fiche de personnage</h3>
        <div class="atelier-fields">
          <label>Nom<input data-field="name" type="text" maxLength={90} placeholder="Nom du personnage" value="Mon personnage"/></label>
          <label>Profil
            <select data-field="kind"><option value="pj">PJ</option><option value="pnj">PNJ</option><option value="creature">Créature</option></select>
          </label>
          <label>Métier ou rôle<input data-field="profession" type="text" maxLength={90} placeholder="Voyageur, artisan, mage…" value="Voyageur"/></label>
          <label>Spécialité
            <select data-field="skill"><option value="0">Non formé (+0)</option><option value="1">Formé (+1)</option><option value="2">Expert (+2)</option></select>
          </label>
        </div>
        <fieldset class="atelier-stats">
          <legend>Caractéristiques <span data-points>12 / 12 points</span></legend>
          {attributes.map(([key, label, help]) => <label class="atelier-stat" key={key}>
            <span><strong>{label}</strong><small>{help}</small></span>
            <input type="number" data-stat={key} value={3} min={1} max={12} step={1} aria-label={label}/>
          </label>)}
          <small class="atelier-hint">Un PJ débutant répartit exactement 12 points, avec 1 à 5 par caractéristique. Le MJ peut définir un adversaire plus puissant.</small>
        </fieldset>
        <div class="atelier-fields atelier-resources">
          <label>PV actuels<input type="number" data-field="pv" min={0} max={999} step={1} value={12}/></label>
          <label>PV maximum<input type="number" data-field="pvMax" min={1} max={999} step={1} value={12}/></label>
          <label>Mana actuel<input type="number" data-field="mana" min={0} max={999} step={1} value={0}/></label>
          <label>Mana maximum<input type="number" data-field="manaMax" min={0} max={999} step={1} value={0}/></label>
          <label>Emprise (0–12)<input type="number" data-field="emprise" min={0} max={12} step={1} value={0}/></label>
        </div>
        <label class="atelier-wide">Attaches, équipement ou traits
          <textarea data-field="notes" rows={3} maxLength={2500} placeholder="Un souvenir, une compétence, un objet..."></textarea>
        </label>
        <div data-mj-tools hidden>
          <label class="atelier-wide">Notes réservées au MJ (sur cet appareil uniquement)
            <textarea data-field="gmNotes" rows={2} maxLength={2500} placeholder="Motivations, secrets, rencontres possibles..."></textarea>
          </label>
          <div class="atelier-toolbar">
            <label>Profil de démonstration
              <select data-template>
                <option value="acolyte">Acolyte / adversaire mineur</option>
                <option value="lieur">Lieur / adversaire confirmé</option>
                <option value="creature">Créature errante</option>
              </select>
            </label>
            <button type="button" data-add-template>Créer ce profil</button>
            <button type="button" data-delete>Supprimer la fiche active</button>
          </div>
          <p class="atelier-hint">Profils fictifs et <strong>non canoniques</strong>. Leurs chiffres servent uniquement à tester le système 5d6.</p>
        </div>
      </div>
      <div class="atelier-panel atelier-dice">
        <h3>Effectuer un jet</h3>
        <p class="atelier-hint"><strong>5d6 + caractéristique + compétence + situation</strong>. Les critiques se lisent sur les cinq dés naturels.</p>
        <div class="atelier-fields">
          <label>Caractéristique
            <select data-roll-stat>
              {attributes.map(([key,label])=><option value={key} key={key}>{label}</option>)}
            </select>
          </label>
          <label>Compétence pour ce jet
            <select data-roll-skill><option value="0">+0 — Non formé</option><option value="1">+1 — Formé</option><option value="2">+2 — Expert</option></select>
          </label>
          <label>Difficulté
            <select data-roll-target>
              <option value="15">15 — Très facile</option>
              <option value="18">18 — Facile</option>
              <option value="21" selected>21 — Normale</option>
              <option value="24">24 — Difficile</option>
              <option value="27">27 — Héroïque</option>
              <option value="30">30 — Exceptionnelle</option>
            </select>
          </label>
          <label>Situation
            <select data-roll-situation><option value="0">0 — Neutre</option><option value="2">+2 — Avantage</option><option value="-2">−2 — Désavantage</option></select>
          </label>
        </div>
        <div class="atelier-dice-row" aria-label="Cinq dés à six faces">
          {[1,2,3,4,5].map((n)=><span class="atelier-die" data-die={n} key={n} aria-label={`Dé ${n}`}>–</span>)}
        </div>
        <button type="button" class="atelier-roll" data-roll>Lancer les 5 dés</button>
        <div class="atelier-result" data-result role="status" aria-live="polite">Choisis la difficulté puis lance les cinq dés.</div>
        <h4>Journal des jets</h4>
        <ol class="atelier-log" data-log><li>Aucun jet enregistré.</li></ol>
        <button type="button" data-clear-log>Effacer le journal</button>
      </div>
    </div>
    <section class="atelier-panel" data-ai-only hidden>
      <h3>Contexte pour MJ assisté par IA</h3>
      <p>Génère un texte contenant les règles de base et la fiche active. Le bouton <strong>Copier</strong> transmet uniquement à ton presse-papiers ; rien n'est envoyé automatiquement à une IA.</p>
      <label class="atelier-check"><input type="checkbox" data-ai-roster/> Inclure les autres personnages locaux dans le contexte (sans notes réservées au MJ)</label>
      <label class="atelier-wide">Contexte à copier<textarea readOnly data-ai-prompt rows={12} aria-label="Contexte pour MJ IA"></textarea></label>
      <div class="atelier-toolbar"><button type="button" data-ai-refresh>Actualiser</button><button type="button" data-ai-copy>Copier le contexte</button></div>
      <p class="atelier-hint">Le MJ IA doit encore lire les références appropriées, respecter les limites de connaissance des PNJ et ne jamais décider à la place du joueur.</p>
    </section>
    <p class="atelier-privacy">⚿ <strong>Confidentialité :</strong> les données restent dans le stockage de ce navigateur, accessible aux personnes qui l'utilisent. Aucune sauvegarde dans le dépôt ni synchronisation. Exporte ton JSON avant d'effacer ton navigateur. Import limité à des fichiers JSON de 250 Kio au maximum.</p>
  </section>
}
Atelier5d6.afterDOMLoaded = script
Atelier5d6.css = `
.atelier{background:rgba(9,21,30,.7);border:1px solid rgba(220,184,119,.28);border-radius:14px;padding:1rem;margin:1.5rem 0 2rem;color:var(--darkgray);font:inherit}
.atelier *{box-sizing:border-box}
.atelier-intro{margin:.2rem 0 .9rem}
.atelier-tabs{display:flex;flex-wrap:wrap;gap:.5rem;margin:.5rem 0 1rem}
.atelier button{background:#203745;color:#f3eadb;border:1px solid #9f8460;border-radius:8px;padding:.55rem .7rem;font:inherit;cursor:pointer}
.atelier button:hover,.atelier button:focus-visible{background:#314b5c;outline:2px solid #dcb877;outline-offset:1px}
.atelier-tabs button[aria-selected=true],.atelier .atelier-roll{background:#665333;border-color:#dcb877;color:#fff2d8;font-weight:700}
.atelier .atelier-roll{width:100%;font-size:1.05rem;margin:.7rem 0}
.atelier-notice{font-size:.88rem;min-height:1.4rem;color:#c9d5d8}
.atelier-toolbar{display:flex;flex-wrap:wrap;align-items:end;gap:.7rem;padding:.65rem 0}
.atelier label{display:flex;flex-direction:column;gap:.25rem;font-size:.9rem}
.atelier input,.atelier select,.atelier textarea{width:100%;background:#142a37;color:#f3eadb;border:1px solid #667988;border-radius:6px;padding:.4rem;font:inherit}
.atelier input:focus-visible,.atelier textarea:focus-visible,.atelier select:focus-visible{outline:2px solid #dcb877}
.atelier input[type=file]{max-width:270px}
.atelier .atelier-toolbar label{min-width:170px;flex:1 1 180px}
.atelier-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:1rem}
.atelier-panel{background:rgba(255,255,255,.035);border:1px solid rgba(187,213,225,.2);border-radius:10px;padding:1rem;min-width:0;margin:.6rem 0}
.atelier-panel h3{margin:.1rem 0 .75rem}
.atelier-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.7rem;margin:.65rem 0}
.atelier-stats{border:1px solid #485c67;border-radius:8px;padding:.7rem;margin:.8rem 0}
.atelier-stats legend{padding:0 .2rem;font-weight:700}
.atelier-stat{display:flex!important;flex-direction:row!important;justify-content:space-between;align-items:center;gap:.6rem;padding:.3rem 0}
.atelier-stat span{display:flex;flex-direction:column;min-width:0}
.atelier-stat small,.atelier-hint{font-size:.78rem;color:#b3c0c8}
.atelier-stat input{width:65px;flex-shrink:0;text-align:center}
.atelier-wide{display:flex;flex-direction:column;margin:.55rem 0}
.atelier textarea{resize:vertical}
.atelier-dice-row{display:flex;gap:.5rem;justify-content:center;margin:1rem 0;flex-wrap:wrap}
.atelier-die{width:49px;height:49px;display:grid;place-items:center;background:#ebdfc7;color:#182935;border:2px solid #c5a774;border-radius:9px;font-size:1.5rem;font-weight:700;font-variant-numeric:tabular-nums}
.atelier-result{background:#142e3b;border-radius:8px;border:1px solid #68808e;padding:.75rem;min-height:4rem;white-space:pre-line}
.atelier-result[data-outcome=success]{border-color:#82b79c}
.atelier-result[data-outcome=failure]{border-color:#be8383}
.atelier-log{padding-left:1.25rem;font-size:.81rem;max-height:240px;overflow:auto}
.atelier-log li{margin:.3rem 0}
.atelier-privacy{font-size:.82rem;color:#c4cfd6;border-top:1px solid rgba(220,184,119,.25);padding-top:.8rem}
.atelier-check{flex-direction:row!important;align-items:center;gap:.5rem!important}
.atelier-check input{width:auto}
.atelier [hidden]{display:none!important}
@media(max-width:850px){.atelier-grid{grid-template-columns:1fr}}
@media(max-width:480px){.atelier-fields{grid-template-columns:1fr}.atelier{padding:.7rem}.atelier-die{width:42px;height:42px}}
`
