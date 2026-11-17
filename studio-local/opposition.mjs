import { toDefense } from './moteur/atelier5d6-bestiary-workshop.js';
import { effectiveProtectionM03, resistanceScoreM03, resolveCombatM03 } from './moteur/atelier5d6-combat-m03.js';

const resistanceFor = mode => mode === 'melee' || mode === 'tir' ? 'physique' : mode;
const resistanceLabels = { physique: 'physique', magie: 'magique', mental: 'mentale' };
// Un export JSON d'aperçu n'est jamais une preuve de validation MJ.
const localIndexPreviews = new WeakSet();
function freezeSnapshot(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const entry of Object.values(value)) freezeSnapshot(entry);
    Object.freeze(value);
  }
  return value;
}

export function describeDefense(mode, card) {
  const defender = toDefense(card);
  const kind = resistanceFor(mode);
  return { label: resistanceLabels[kind], threshold: resistanceScoreM03(defender, kind), protection: effectiveProtectionM03(defender, kind) };
}

export function resolveOpposition(roll, card) {
  const { dice, rawStat, masteryRank, situation, level, threshold, impactMode, baseDamage, penetration } = roll;
  return resolveCombatM03({
    natural: dice.reduce((sum, die) => sum + die, 0), rawStat, masteryRank, situation, level,
    difficulty: threshold, kind: resistanceFor(impactMode), mode: impactMode,
    defender: toDefense(card), feasible: true, baseDamage, penetration,
  });
}

export function describeOppositionResult(result) {
  if (result.criticalFailure) return { title: 'Échec critique', state: 'failure', advice: 'Retenez la complication dans le journal de la scène.' };
  if (result.effectProposed) return { title: 'Influence mentale réussie', state: 'success', advice: 'Le MJ décide de l’effet narratif.' };
  if (result.glancing) return { title: 'Contact sans blessure', state: 'mixed', advice: 'Décrivez le contact dans la scène.' };
  if (result.success) {
    return { title: result.damage ? 'Résistance franchie' : 'Impact absorbé', state: 'success', advice: 'Consignez la conséquence dans le journal de la scène.' };
  }
  const advice = result.reaction === 'riposte_possible' ? 'Une riposte peut être annoncée comme action distincte.' : 'Le MJ peut décider d’une réaction défensive.';
  return { title: 'Résistance tenue', state: 'failure', advice };
}


/**
 * STUDIO-CREATE-004 — aperçu MJ, jamais une tentative engagée.
 *
 * Les dés physiques et le bouton de lancer fournissent les mêmes cinq d6.
 * Le contrôleur Studio conserve la session INDEX et demande séparément
 * l'autorisation du MJ, la dépense, l'application et la sauvegarde.
 * Aucun champ \`approved\` ni \`effects\` reçu avec une fiche ne traverse
 * cette passerelle : seul INDEX peut les homologuer avant M03.
 */
export function previewIndexedOpposition(roll, card, indexSession, selections = {}) {
  if (!indexSession || typeof indexSession.resolve !== 'function') {
    throw new TypeError('Session INDEX du MJ requise pour la prévisualisation');
  }
  if (!roll || !Array.isArray(roll.dice) || roll.dice.length !== 5 ||
      !roll.dice.every(die => Number.isSafeInteger(die) && die >= 1 && die <= 6)) {
    throw new RangeError('Le jet de table exige exactement cinq dés à six faces');
  }
  if (!['melee', 'tir', 'magie', 'mental'].includes(roll.impactMode)) {
    throw new RangeError('Mode d’opposition inconnu');
  }
  if (roll.feasible !== undefined && typeof roll.feasible !== 'boolean') {
    throw new TypeError('Faisabilité MJ doit être un booléen');
  }
  const { dice, rawStat, masteryRank, situation, level, threshold,
    impactMode, baseDamage, penetration } = roll;
  const { attackerId, defenderId = null, attackRefs = [], defenseRefs = [],
    intensityRef = null, intensityTier, heroicChoice = null } = selections;
  const action = {
    natural: dice.reduce((sum, die) => sum + die, 0),
    rawStat, masteryRank, situation, level,
    difficulty: threshold, kind: resistanceFor(impactMode), mode: impactMode,
    defender: toDefense(card), feasible: roll.feasible !== false,
    baseDamage, penetration,
  };
  const preview = indexSession.resolve({
    action, attackerId, defenderId, attackRefs, defenseRefs,
    intensityRef, intensityTier, heroicChoice,
  });
  // Le journal historique recalcule seulement resolveCombatM03 et ne peut pas
  // reconstituer une autorisation INDEX, une intensité ou un choix héroïque.
  // Cette information aide l'interface à BLOQUER les commits incompatibles ;
  // elle ne constitue jamais une permission de dépense ou de sauvegarde.
  const journalGate = roll.feasible === false ? 'mj-blocked'
    : preview.blocked.length ? 'approval-required'
    : preview.used.length || preview.result.intensityMultiplier !== 1 ||
      preview.result.specialAbsorption !== 0 || preview.result.heroicBenefit !== null
      ? 'versioned-journal-required' : 'legacy-compatible';
  const issued = Object.freeze({ status: 'preview', journalGate,
    result: Object.freeze({ ...preview.result }),
    used: Object.freeze(preview.used.map(ref => Object.freeze({ ...ref }))),
    blocked: Object.freeze(preview.blocked.map(ref => Object.freeze({ ...ref }))),
    proof: preview.proof,
    actionSnapshot: freezeSnapshot(structuredClone(action)),
    diceSnapshot: Object.freeze([...dice]),
    holders: Object.freeze({ attackerId, defenderId }) });
  localIndexPreviews.add(issued);
  return issued;
}

/**
 * Garde explicitement la voie historique contre les effets INDEX non rejouables.
 * N'enregistre rien : le stockage doit TOUJOURS vérifier la révision, la
 * signature, la cible et recalculer M03 de son côté.
 */
export function requireLocalLegacyJournalPreview(preview) {
  if (!preview || typeof preview !== 'object' || !localIndexPreviews.has(preview)) {
    throw new Error('Aperçu INDEX local exigé ; un JSON importé ne suffit pas');
  }
  if (preview.journalGate !== 'legacy-compatible') {
    throw new Error('Cette action ne peut pas utiliser le journal M03 historique');
  }
  return preview.result;
}

/** Accès strict au justificatif d'un aperçu enrichi, sans valeur de commit. */
export function requireLocalIndexedJournalPreview(preview) {
  if (!preview || typeof preview !== 'object' || !localIndexPreviews.has(preview)) {
    throw new Error('Aperçu INDEX local exigé ; un JSON importé ne suffit pas');
  }
  if (preview.journalGate !== 'versioned-journal-required' || preview.blocked.length) {
    throw new Error('Une référence INDEX non homologuée ou une action bloquée interdit la tentative');
  }
  return preview;
}
