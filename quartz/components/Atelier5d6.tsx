import type { QuartzComponent } from "./types"
// @ts-ignore Quartz compile les ressources .inline.ts pour la navigation SPA
import script from "./scripts/atelier5d6.inline"
import {ORIGIN_STEPS,AFFINITY_DOMAINS} from "./scripts/atelier5d6-origins"

const masteries = [
  ["lames","Lames et dagues"],["haches","Haches et masses"],["arcs","Arcs et tirs"],
  ["runes","Runes"],["soins","Soins"],["negociation","Négociation"],
  ["survie","Survie et pistage"],["artisanat","Artisanat"],["magie","Magies connues"],
] as const

const itemCategories = [
  ["monnaie","🪙 Monnaie"],["arme","⚔️ Armes"],["armure","🛡️ Armures"],
  ["artefact","✨ Artefacts"],["consommable","🧪 Consommables"],["ingredient","🌿 Ingrédients"],
  ["outil","🔧 Outils"],["munition","🏹 Munitions"],["livre","📜 Livres et cartes"],
  ["bijou","💍 Bijoux"],["provision","🥖 Provisions"],["materiau","🪵 Matériaux"],
  ["quete","🗝️ Objets de mission"],["autre","🎒 Autres"]
] as const
const certifications = [
 ["premiers-secours","Premiers secours et extraction"],["orientation","Orientation / rapports"],
 ["protection-civile","Sécurité civile"],["reconnaissance-avancee","Reconnaissance avancée"],
 ["risques-magiques","Risques magiques"],["intervention-specialisee","Intervention spécialisée"]
] as const
const resistanceKinds = [
  ["physique","Physique / esquive"],["magie","Magie / runes"],["mental","Mental / volonté"]
] as const
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
      <button type="button" data-reset>Réinitialiser cette fiche…</button>
      <button type="button" data-export>Exporter les fiches JSON</button>
      <button type="button" data-export-campaign>Exporter toute la campagne</button>
      <label>Importer sauvegarde complète
        <input type="file" accept=".json,application/json" data-import-campaign aria-label="Restaurer une campagne 5d6 depuis un JSON"/>
      </label>
      <label>Importer JSON
        <input type="file" accept=".json,application/json" data-import aria-label="Importer un fichier de personnages JSON"/>
      </label>
    </div>
    <p class="atelier-hub-status" data-hub-status>Personnage actif · niveau · ressources · affinités</p>
    <details class="atelier-hub-section">
      <summary>🧭 Créer un aventurier — les quatre premières périodes de vie</summary>
      <div class="atelier-hub-inner">
        <p>Réponds aux quatre questions : <strong>24 points de caractéristiques</strong> et <strong>8 points de maîtrise</strong> sont répartis automatiquement. L'aventure commence au <strong>niveau 5</strong>, avec 36 PV de référence. Aucune fiche existante n'est remplacée.</p>
        <label>Nom du nouvel aventurier<input data-origin-name type="text" maxLength={90} placeholder="Nom du personnage"/></label>
        {ORIGIN_STEPS.map(step=><fieldset class="atelier-stats" key={step.id}>
          <legend>{step.title}</legend>
          <label>{step.question}<select data-origin-choice={step.id}>
            <option value="">Choisir un parcours</option>
            {step.options.map(opt=><option value={opt.id} key={opt.id}>{opt.label} — {opt.description}</option>)}
          </select></label>
        </fieldset>)}
        <p data-origin-preview class="atelier-hint" role="status">Choisis les quatre périodes de vie pour préparer ta fiche de niveau 5.</p>
        <div class="atelier-toolbar">
          <button type="button" data-origin-build>Créer cet aventurier niveau 5</button>
          <button type="button" data-origin-clear>Effacer les réponses</button>
        </div>
        <p class="atelier-hint">Alternative : « Nouvelle fiche » conserve la création libre. Aucune Autorité, Cercle ou capacité divine ne vient automatiquement du parcours.</p>
      </div>
    </details>
    <details class="atelier-hub-section" data-hub="fiche" open>
      <summary>📜 Fiche et jets 5d6 — personnage actif</summary>
      <div class="atelier-hub-inner">
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
        <label class="atelier-wide">Description physique ou présentation du personnage
          <textarea data-field="description" rows={2} maxLength={1200} placeholder="Apparence, vêtements, particularités, origine..."></textarea>
        </label>
        <div class="atelier-portrait">
          <img data-portrait-preview alt="Portrait associé au personnage actif" hidden />
          <label>Portrait (image JPG, PNG ou WebP)
            <input type="file" accept="image/jpeg,image/png,image/webp" data-portrait aria-label="Importer un portrait pour cette fiche"/>
          </label>
          <button type="button" data-clear-portrait>Retirer le portrait</button>
        </div>
        <div class="atelier-fields">
          <label>Niveau (1 à 25)<input type="number" data-field="level" min={1} max={25} step={1} value={1}/></label>
          <label>Voie(s) / vocation libre<input data-field="vocation" type="text" maxLength={160} placeholder="Éclaireur et artisan, mage et diplomate…"/></label>
        </div>
        <div class="atelier-fields">
          <label>Expérience cumulative (XP, MJ)
            <input type="number" data-field="xp" min={0} max={999999} step={1} value={0}/>
          </label>
          <p data-xp-info class="atelier-hint">Expérience : 0 XP · niveau suivant : 5 XP.</p>
        </div>
        <label class="atelier-wide">Talents acquis (capacités, conditions et limites)
          <textarea data-field="talents" rows={2} maxLength={1600} placeholder="Ex. : Pisteur — repérer une ancienne piste même sous la pluie"></textarea>
        </label>
        <fieldset class="atelier-stats">
          <legend>Caractéristiques <span data-points>12 / 12 points</span></legend>
          {attributes.map(([key, label, help]) => <label class="atelier-stat" key={key}>
            <span><strong>{label}</strong><small>{help}</small></span>
            <input type="number" data-stat={key} value={3} min={1} max={12} step={1} aria-label={label}/>
          </label>)}
          <small class="atelier-hint">Au niveau 1 : 12 points (1 à 5 par caractéristique). Puis +6 points par niveau, chaque caractéristique étant plafonnée à 12. Les crédits excédentaires restent en réserve, sans bonus de jet automatique. Les niveaux 21–25 exigent cinq validations divines exceptionnelles.</small>
        </fieldset>
        <fieldset class="atelier-stats">
          <legend>Maîtrises spécialisées — <span data-mastery-points>0 / 0 points</span></legend>
          {masteries.map(([key,label])=><label class="atelier-stat" key={key}>
            <span><strong>{label}</strong><small>Maîtrise de 0 à 12</small></span>
            <input type="number" min={0} max={12} step={1} value={0} data-mastery={key} aria-label={label}/>
          </label>)}
          <small class="atelier-hint">Deux points de maîtrise par niveau après le premier. Ils décrivent l'entraînement, sans bonus de jet automatique avant équilibrage. Les spécialités +0/+1/+2 actuelles restent jouables.</small>
        </fieldset>
        <div class="atelier-toolbar">
          <button type="button" data-convert-credits>Convertir 6 crédits excédentaires en 1 point de talent</button>
          <label>Points de talent utilisés<input type="number" data-talent-spent min={0} max={24} step={1} value={0}/></label>
        </div>
        <p data-talent-points class="atelier-hint">Talents : 0 / 0 utilisés.</p>
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
        <div class="atelier-fields">
          <label>Bénédictions / avantages conditionnels<textarea data-field="boons" rows={2} maxLength={1400} placeholder="Ex. : écouter les rêves d'un allié à la pleine lune"/></label>
          <label>Malédictions / contraintes<textarea data-field="curses" rows={2} maxLength={1400} placeholder="Ex. : la lumière des Portes révèle toujours votre passage"/></label>
        </div>
        <label class="atelier-wide">Objets et effets narratifs (pas d'équipement +1)
          <textarea data-field="items" rows={2} maxLength={1400} placeholder="Ex. : une lampe qui révèle la dernière trace d'une Faille"></textarea>
        </label>
        <p class="atelier-hint" data-source-meta>Fiche libre sans référence encyclopédique. Les valeurs de jeu restent des propositions.</p>
        <p data-ascension-status class="atelier-hint">Niveaux 21–25 : validation exceptionnelle requise.</p>
        <p class="atelier-hint">Défenses du personnage : <span data-resistance-summary>Calcul des résistances physiques, magiques et mentales…</span></p>
        <div data-mj-tools hidden>
          <fieldset class="atelier-stats">
            <legend>MJ : résistances et protections de cette fiche</legend>
            <p class="atelier-hint">La résistance et la protection naturelles augmentent avec le niveau, même sans équipement. Les grades 0–5 apportent des protections supplémentaires, sans remplacer les réglages MJ.</p>
            <div class="atelier-fields">
              {resistanceKinds.map(([key,label])=><div key={key}>
                <label>Bonus de résistance — {label}<input data-defense-resistance={key} type="number" min={0} max={8} step={1} value={0}/></label>
                <label>Protection supplémentaire MJ — {label}<input data-defense-protection={key} type="number" min={0} max={60} step={1} value={0}/></label>
                <label>Grade d'équipement (0–5) — {label}
                  <input data-defense-gear={key} type="number" min={0} max={5} step={1} value={0}/>
                </label>
              </div>)}
            </div>
          </fieldset>
          <label class="atelier-wide">Notes réservées au MJ (sur cet appareil uniquement)
            <textarea data-field="gmNotes" rows={2} maxLength={2500} placeholder="Motivations, secrets, rencontres possibles..."></textarea>
          </label>
          <label class="atelier-check"><input data-ascension type="checkbox"/> MJ : activer les épreuves d'ascension divine</label>
          <label>Dernier niveau divin individuellement approuvé
            <select data-divine-limit>
              <option value="20">Aucun niveau divin</option>
              <option value="21">21 — Première épreuve</option>
              <option value="22">22 — Deuxième épreuve</option>
              <option value="23">23 — Troisième épreuve</option>
              <option value="24">24 — Quatrième épreuve</option>
              <option value="25">25 — Cinquième épreuve</option>
            </select>
          </label>
          <p class="atelier-hint" data-divine-history>Aucune épreuve divine consignée.</p>
          <label class="atelier-wide">Témoignage MJ de l'épreuve exceptionnelle (obligatoire)
            <textarea data-field="ascensionWitness" rows={2} maxLength={300} placeholder="Mentor, rituel, pacte, coût réel et conséquence du monde..."></textarea>
          </label>
          <fieldset class="atelier-stats">
            <legend>Bestiaire évolutif MJ — niveaux 1 à 25</legend>
            <p class="atelier-hint">Créer une fiche de créature à partir d'un archétype générique. Sa vie, ses résistances innées, ses spécialisations et son éventuelle protection progressent automatiquement. Il ne s'agit ni d'une nouvelle espèce canonique, ni d'un pouvoir divin accordé par défaut.</p>
            <div class="atelier-fields">
              <label>Archétype
                <select data-bestiary-archetype>
                  <option value="faune">Faune — peu offensive</option>
                  <option value="predateur">Prédateur — rapide</option>
                  <option value="gardien">Gardien — blindé</option>
                  <option value="mystique">Mystique — mana et défense magique</option>
                  <option value="colosse">Colosse — endurance très élevée</option>
                </select>
              </label>
              <label>Niveau de la créature (1–25)
                <input type="number" data-bestiary-level min={1} max={25} step={1} value={1}/>
              </label>
            </div>
            <button type="button" data-bestiary-create>MJ : générer une créature évolutive</button>
          </fieldset>
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
          <div class="atelier-reference">
            <h4>Références des Archives (sans téléchargement)</h4>
            <p class="atelier-hint">Recherche dans l'index <strong>public, hors spoilers</strong>. Lire une fiche ou créer une adaptation 5d6 avec des caractéristiques de départ fictives ; aucune statistique n'est déduite de la biographie.</p>
            <label>Rechercher un personnage ou une créature
              <input type="search" data-reference-query placeholder="Nom, titre ou sujet…" maxLength={120}/>
            </label>
            <div class="atelier-ref-results" data-reference-results role="status" aria-live="polite">Recherche prête.</div>
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
          <label>Type d'action
            <select data-roll-domain>
              <option value="autre">Autre</option>
              <option value="magie">Sort / rituel</option>
              <option value="melee">Combat rapproché</option>
              <option value="tir">Tir / longue distance</option>
              <option value="nego">Négociation</option>
            </select>
          </label>
          <label>Situation
            <select data-roll-situation><option value="0">0 — Neutre</option><option value="2">+2 — Avantage</option><option value="-2">−2 — Désavantage</option></select>
          </label>
        </div>
        <fieldset class="atelier-stats">
          <legend>Affinité activée pour une action magique</legend>
          <label class="atelier-check"><input data-roll-affinity-enabled type="checkbox"/> L'action exploite cette affinité reconnue (accord MJ nécessaire)</label>
          <label>Domaine<select data-roll-affinity><option value="">Sans affinité</option></select></label>
          <p data-roll-affinity-preview class="atelier-hint">Effet conditionnel : +2 dégâts par rang validé pour un effet magique compatible ; jamais un bonus universel pour toucher. Aucun mana retiré automatiquement.</p>
        </fieldset>
        <fieldset class="atelier-stats">
          <legend>Opposition et résistances (module facultatif)</legend>
          <label class="atelier-check"><input type="checkbox" data-opposition-enabled/> Activer une cible qui peut résister, esquiver ou parer</label>
          <div class="atelier-fields">
            <label>Adversaire / cible
              <select data-opposition-target><option value="">Cible libre — seuil fixé par le MJ</option></select>
            </label>
            <label>Résistance mise à l'épreuve
              <select data-opposition-kind>
                <option value="physique">Physique / esquive</option>
                <option value="magie">Magie / runes</option>
                <option value="mental">Mental / volonté</option>
              </select>
            </label>
            <label>Action tentée
              <select data-opposition-mode>
                <option value="melee">Mêlée — dégâts physiques</option>
                <option value="tir">Tir — dégâts physiques</option>
                <option value="magie">Magie — dégâts si le sort le permet</option>
                <option value="mental">Influence mentale / négociation — sans dégâts PV</option>
              </select>
            </label>
            <label>Seuil minimal supplémentaire du MJ (0 = aucun)
              <input data-opposition-min type="number" min={0} max={45} step={1} value={0}/>
            </label>
            <label>Base des dégâts en cas de réussite
              <select data-opposition-base>
                <option value="1">1 — très faible</option>
                <option value="3" selected>3 — arme légère / petit effet</option>
                <option value="6">6 — arme ou sort puissant</option>
                <option value="12">12 — attaque majeure sous conditions</option>
              </select>
            </label>
          </div>
          <p data-opposition-preview class="atelier-hint">Un jet héroïque naturel 27–30 peut toucher une défense supérieure sans la percer, mais n\u0027inflige normalement aucun PV ni effet. Un 30 naturel peut parfois causer 1 PV si l\u0027impact dépasse toutes les protections.</p>
          <p data-opposition-result class="atelier-hint" role="status">Mode opposition désactivé : jet classique inchangé.</p>
          <button type="button" data-opposition-apply hidden>MJ : confirmer l'application des dégâts à la cible</button>
          <button type="button" data-opposition-counter hidden>MJ : préparer une riposte avec un nouveau jet</button>
          <small class="atelier-hint">Contact n\u0027est pas blessure : une élite peut être touchée sans être affectée. La riposte demande toujours un nouveau jet. Une cible à 0 PV est hors de combat, pas automatiquement morte.</small>
        </fieldset>
        <div class="atelier-dice-row" aria-label="Cinq dés à six faces">
          {[1,2,3,4,5].map((n)=><span class="atelier-die" data-die={n} key={n} aria-label={`Dé ${n}`}>–</span>)}
        </div>
        <button type="button" class="atelier-roll" data-roll>Lancer les 5 dés</button>
        <div class="atelier-result" data-result role="status" aria-live="polite">Choisis la difficulté puis lance les cinq dés.</div>
        <p class="atelier-hint" data-streaks>Échecs suivis : aucun.</p>
        <div class="atelier-incident" data-incident role="status" aria-live="polite" hidden></div>
        <h4>Journal des jets</h4>
        <ol class="atelier-log" data-log><li>Aucun jet enregistré.</li></ol>
        <button type="button" data-clear-log>Effacer le journal</button>
      </div>
    </div>
      </div>
    </details>
    <details class="atelier-hub-section" data-hub="affinites">
      <summary>✨ Affinités et pouvoirs — même fiche</summary>
      <section class="atelier-panel">
        <p class="atelier-hint">Les affinités ont des effets conditionnels et ne remplacent pas les Autorités du canon. Un rang n'accorde aucun pouvoir fondamental ni succès automatique.</p>
        <h3>Affinités reconnues</h3>
        <ul data-affinity-list class="atelier-inventory-list"><li>Aucune affinité validée.</li></ul>
        <div class="atelier-fields">
          <label>Domaine<select data-affinity-domain>{AFFINITY_DOMAINS.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
          <label>Intensité (1–5)<input data-affinity-rank type="number" min={1} max={5} step={1} value={1}/></label>
        </div>
        <label>Origine et limites de l'affinité<input data-affinity-witness type="text" maxLength={300} placeholder="Formation, nature, bénédiction, limites…"/></label>
        <button type="button" data-affinity-grant>MJ : attribuer ou modifier cette affinité</button>
        <p class="atelier-hint">Repères : affinité 1 aux niveaux 1–8, 2 aux niveaux 9–12, 3 aux niveaux 13–16, 4 aux niveaux 17–20 et 5 aux niveaux 21–25.</p>
        <h3>Capacités individuelles approuvées</h3>
        <ul data-power-list class="atelier-inventory-list"><li>Aucune capacité spéciale enregistrée.</li></ul>
        <div class="atelier-fields">
          <label>Nom<input data-power-name type="text" maxLength={90} placeholder="Nom du prodige"/></label>
          <label>Grade<select data-power-grade>
            <option value="heroique">Héroïque (niveau 5+)</option>
            <option value="transcendant">Transcendant (niveau 17+)</option>
            <option value="divin">Divin (niveau 21+ et épreuve MJ)</option>
          </select></label>
          <label>Domaine<select data-power-domain>{AFFINITY_DOMAINS.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
          <label>Coût de mana<input data-power-cost type="number" min={0} max={999} step={1} value={0}/></label>
        </div>
        <label class="atelier-wide">Effet autorisé<textarea data-power-effect rows={2} maxLength={600} placeholder="Portée, forme, puissance, limites du phénomène…"/></label>
        <label class="atelier-wide">Conditions et limitations obligatoires<textarea data-power-condition rows={2} maxLength={600} placeholder="Consentement, durée, contrepartie, validations…"/></label>
        <button type="button" data-power-grant>MJ : approuver une capacité</button>
        <p class="atelier-hint">La validation décrit un usage de jeu autorisé par le MJ local, pas un fait rétroactif de la campagne d'Orin. Les Cercles et Autorités requièrent leurs sources.</p>
      </section>
    </details>
    <details class="atelier-hub-section" data-hub="inventaire">
      <summary>🎒 Inventaire, objets et échanges</summary>
    <section class="atelier-panel" aria-label="Inventaire du personnage">
      <h3>Inventaire de la fiche active</h3>
      <p class="atelier-hint">Les objets sont individuels. Un modèle MJ peut être attribué à plusieurs personnages sans partager leurs exemplaires.</p>
      <div class="atelier-fields">
        <label>Nom de l'objet<input data-item-name type="text" maxLength={90} placeholder="Bourse de pièces"/></label>
        <label>Catégorie<select data-item-category>{itemCategories.map(([id,label])=><option value={id} key={id}>{label}</option>)}</select></label>
        <label>Quantité<input data-item-quantity type="number" min={1} max={999} step={1} value={1}/></label>
        <label>Valeur / unité libre<input data-item-value type="text" maxLength={100} placeholder="Ex. : 4 couronnes (proposition)"/></label>
      </div>
      <label class="atelier-wide">Description / propriétés / limites<textarea data-item-description rows={2} maxLength={600} placeholder="Origine, effet narratif, restrictions..."></textarea></label>
      <div class="atelier-toolbar">
        <button type="button" data-item-create>Ajouter à la fiche</button>
        <button type="button" data-item-make-template>MJ : enregistrer un modèle</button>
      </div>
      <ul data-inventory-list class="atelier-inventory-list"><li>Aucun objet enregistré.</li></ul>
      <div class="atelier-fields">
        <label>Catalogue de modèles MJ<select data-template-select><option value="">Aucun modèle</option></select></label>
        <label>Personnage destinataire<select data-item-recipient><option value="">Personnage actif</option></select></label>
      </div>
      <div class="atelier-toolbar">
        <button type="button" data-template-grant>MJ : attribuer une copie</button>
        <button type="button" data-inventory-transfer>Transférer le premier objet sélectionné</button>
      </div>
      <p class="atelier-hint">Pour un transfert, sélectionner « Transférer » dans la liste d'inventaire puis le personnage destinataire. Pas de synchronisation entre joueurs distants.</p>
    </section>
    </details>
    <details class="atelier-hub-section" data-hub="compagnies">
      <summary>🧭 Compagnies, missions et récompenses</summary>
    <section class="atelier-panel" aria-label="Compagnies d'aventuriers et contrats">
      <h3>Compagnies — missions, qualifications et récompenses</h3>
      <p class="atelier-hint">Les niveaux de groupe (1–12) ne sont pas des grades officiels et ne remplacent aucune certification ni autorisation des autorités locales.</p>
      <div class="atelier-fields">
        <label>Nouvelle compagnie<input data-group-name type="text" maxLength={90} placeholder="Les arpenteurs de l'Aube"/></label>
        <label>Compagnie active<select data-group-select><option value="">Aucune compagnie</option></select></label>
      </div>
      <div class="atelier-toolbar">
        <button type="button" data-group-create>Créer une compagnie</button>
        <button type="button" data-group-promote>MJ : valider la progression collective</button>
      </div>
      <p data-group-status class="atelier-hint">Aucune compagnie créée.</p>
      <h4>Membres de la compagnie</h4>
      <div data-group-members class="atelier-check-grid">Sélectionner une compagnie.</div>
      <h4>Certifications reconnues par la table</h4>
      <div class="atelier-check-grid">
        {certifications.map(([id,label])=><label class="atelier-check" key={id}><input type="checkbox" data-certification={id}/>{label}</label>)}
      </div>
      <h4>Tableau des contrats</h4>
      <div class="atelier-fields">
        <label>Mission<select data-mission-select><option value="">Chargement des missions...</option></select></label>
        <label>Résultat<select data-mission-result>
          <option value="terminee">Objectif accompli</option>
          <option value="repli">Repli / sauvetage responsable</option>
          <option value="echouee">Échec ou mission interrompue</option>
        </select></label>
      </div>
      <p data-mission-preview class="atelier-hint">Choisir une mission.</p>
      <label class="atelier-wide">Bilan / faits / conséquences<textarea data-mission-summary rows={2} maxLength={1200}/></label>
      <label class="atelier-wide">Récompense réellement remise<input data-mission-award type="text" maxLength={280} placeholder="À confirmer par le MJ"/></label>
      <div class="atelier-toolbar"><button type="button" data-mission-record>MJ : consigner la mission</button></div>
      <h4>Journal des missions et récompenses</h4>
      <ol data-mission-log class="atelier-log"><li>Aucune mission enregistrée.</li></ol>
      <p class="atelier-hint">Pour progresser, deux missions réussies d'au moins le rang actuel, de deux domaines différents, avec débriefing. Le MJ conserve la décision finale.</p>
    </section>
    </details>
    <section class="atelier-panel" data-ai-only hidden>
      <h3>Contexte pour MJ assisté par IA</h3>
      <p>Génère un texte contenant les règles de base et la fiche active. Le bouton <strong>Copier</strong> transmet uniquement à ton presse-papiers ; rien n'est envoyé automatiquement à une IA.</p>
      <label class="atelier-check"><input type="checkbox" data-ai-roster/> Inclure les autres personnages locaux dans le contexte (sans notes réservées au MJ)</label>
      <label class="atelier-wide">Contexte à copier<textarea readOnly data-ai-prompt rows={12} aria-label="Contexte pour MJ IA"></textarea></label>
      <div class="atelier-toolbar"><button type="button" data-ai-refresh>Actualiser</button><button type="button" data-ai-copy>Copier le contexte</button></div>
      <p class="atelier-hint">Le MJ IA doit encore lire les références appropriées, respecter les limites de connaissance des PNJ et ne jamais décider à la place du joueur.</p>
    </section>
    <p class="atelier-privacy">⚿ <strong>Confidentialité :</strong> les données restent dans le stockage de ce navigateur, accessible aux personnes qui l'utilisent. Aucune sauvegarde dans le dépôt ni synchronisation. Exporte ton JSON avant d'effacer ton navigateur. Import JSON jusqu'à 5 Mio, portraits inclus ; le stockage local du navigateur peut être plus limité.</p>
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
.atelier-portrait{display:flex;align-items:center;gap:.75rem;flex-wrap:wrap;margin:.7rem 0}
.atelier-portrait img{width:104px;max-height:104px;object-fit:contain;border:1px solid #9f8460;border-radius:8px}
.atelier-portrait label{flex:1 1 180px}
.atelier-portrait button{align-self:center}
.atelier-check-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:.4rem}
.atelier-inventory-list{padding-left:1.3rem}
.atelier-inventory-list li{padding:.35rem 0;border-bottom:1px solid rgba(187,213,225,.13)}
.atelier-inventory-list button{margin-left:.45rem;font-size:.8rem}
.atelier .atelier-check input[type=checkbox]{width:auto}

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
.atelier-ref-results{border:1px solid #526570;border-radius:8px;padding:.5rem;max-height:240px;overflow:auto;margin-top:.55rem}
.atelier-ref-results>div{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem;justify-content:space-between;border-bottom:1px solid rgba(187,213,225,.18);padding:.5rem .1rem}
.atelier-ref-results>div:last-child{border-bottom:none}
.atelier-ref-results a{font-size:.85rem}
.atelier-ref-results button{font-size:.8rem}
.atelier-incident{background:#282c3f;border:1px solid #dcb877;padding:.7rem;margin:.6rem 0;border-radius:8px}
.atelier-hub-status{font-size:.87rem;padding:.65rem .75rem;border-left:3px solid #d4b378;background:rgba(220,184,119,.07);border-radius:5px}
.atelier-hub-section{border:1px solid rgba(187,213,225,.3);border-radius:11px;margin:.8rem 0;background:rgba(255,255,255,.025);overflow:hidden}
.atelier-hub-section>summary{font-size:1.03rem;font-weight:700;cursor:pointer;padding:1rem;color:#e7d9ba;list-style-position:inside}
.atelier-hub-section[open]>summary{border-bottom:1px solid rgba(187,213,225,.18);background:rgba(220,184,119,.05)}
.atelier-hub-inner{padding:.7rem}
.atelier-hub-section>.atelier-panel{margin:.7rem}
.atelier [hidden]{display:none!important}
@media(max-width:850px){.atelier-grid{grid-template-columns:1fr}}
@media(max-width:480px){.atelier-fields{grid-template-columns:1fr}.atelier{padding:.7rem}.atelier-die{width:42px;height:42px}}
`
