/**
 * STUDIO-CREATE-004C — enveloppe préparatoire de tentative INDEX.
 *
 * Aucune opération IndexedDB, aucun débit, aucune mutation de PV ici.
 * Le vrai commit doit être atomique dans store.mjs, après arbitrage ARCHIVES.
 * Un justificatif archivé permet d'auditer un fait passé, jamais d'activer
 * une capacité à partir d'un simple fichier JSON.
 */
import { indexReferenceM03, replayIndexM03Proof } from './moteur/atelier5d6-index-effects.js';
import { requireLocalIndexedJournalPreview } from './opposition.mjs';

const validId = value => typeof value === 'string' &&
  /^[A-Za-z0-9][A-Za-z0-9:_-]{0,127}$/.test(value);
const integer = (value, min, max) => Number.isSafeInteger(value) && value >= min && value <= max;
const validTimestamp = value => typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) &&
  Number.isFinite(new Date(value).getTime()) &&
  new Date(value).toISOString() === value;
const freezeTree = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const nested of Object.values(value)) freezeTree(nested);
    Object.freeze(value);
  }
  return value;
};
const key = ref => `${ref.type}:${ref.id}@${ref.revision}`;
function checkedCost(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) ||
      Object.keys(raw).sort().join(',') !== 'amount,availableBefore,kind,sourceId,version') {
    throw new Error('Coût de tentative non attesté');
  }
  const { kind, sourceId, amount, availableBefore, version } = raw;
  if (kind === 'none' && sourceId === null && amount === 0 &&
      availableBefore === null && version === null) return { ...raw };
  if (!['mana', 'charge'].includes(kind) || !validId(sourceId) ||
      !integer(amount, 1, 1000000) || !integer(availableBefore, amount, 1000000) ||
      !integer(version, 1, 1000000)) throw new Error('Coût absent, insuffisant ou non homologué');
  return { ...raw };
}

function recordedResult(result) {
  const fields = ['natural','total','threshold','success','criticalFailure',
    'grossDamage','damage','intensityMultiplier','specialAbsorption',
    'heroicBenefit','effectProposed'];
  return Object.fromEntries(fields.map(field => [field, result[field]]));
}

/**
 * Construit une proposition de transaction à partir d'un aperçu MJ vivant.
 * Ce retour N'EST PAS une commande de sauvegarde acceptée par openStudioStore.
 */
export function prepareIndexedAttempt(preview, details) {
  const issued = requireLocalIndexedJournalPreview(preview);
  if (!details || !validId(details.operationId) || !validId(details.campaignId) ||
      !validId(details.sceneId) || !integer(details.expectedRevision, 1, 1000000) ||
      details.confirmedByGM !== true || details.costApprovedByGM !== true ||
      !validTimestamp(details.confirmedAt) ||
      typeof details.applyDamage !== 'boolean') {
    throw new Error('Confirmation MJ ou contexte de tentative incomplet');
  }
  const cost = checkedCost(details.cost);
  const recalculated = replayIndexM03Proof(issued.actionSnapshot, issued.proof);
  if (JSON.stringify(recordedResult(recalculated)) !== JSON.stringify(recordedResult(issued.result))) {
    throw new Error('La résolution M03 ne correspond pas au justificatif INDEX');
  }
  if (details.applyDamage && issued.result.damage <= 0) {
    throw new Error('Aucun dégât PV à appliquer sur cette tentative');
  }
  const prepared = {
    schema: 'entre-rives.indexed-attempt.v1', status: 'prepared-not-committed',
    campaignId: details.campaignId, sceneId: details.sceneId,
    operationId: details.operationId, expectedRevision: details.expectedRevision,
    confirmedAt: details.confirmedAt, confirmedByGM: true,
    actorId: issued.holders.attackerId, defenderId: issued.holders.defenderId,
    dice: [...issued.diceSnapshot], action: structuredClone(issued.actionSnapshot),
    references: structuredClone(issued.used), proof: structuredClone(issued.proof),
    result: recordedResult(issued.result),
    cost: { ...cost, approvedByGM: true }, applyDamage: details.applyDamage,
  };
  return freezeTree(prepared);
}

/**
 * Contrôle la cohérence mécanique d'un historique après sérialisation.
 * Il ne confirme PAS que le MJ l'a vraiment autorisé, ni un solde externe.
 */
export function verifyArchivedIndexedAttempt(record) {
  if (!record || record.schema !== 'entre-rives.indexed-attempt.v1' ||
      record.status !== 'prepared-not-committed' ||
      !validId(record.campaignId) || !validId(record.sceneId) ||
      !validId(record.operationId) || !validId(record.actorId) ||
      !(record.defenderId === null || validId(record.defenderId)) ||
      !integer(record.expectedRevision, 1, 1000000) ||
      record.confirmedByGM !== true || !validTimestamp(record.confirmedAt) ||
      typeof record.applyDamage !== 'boolean' ||
      !Array.isArray(record.dice) || record.dice.length !== 5 ||
      !record.dice.every(die => integer(die, 1, 6)) ||
      !Array.isArray(record.references) || record.references.length > 101 ||
      !record.result || !record.action) throw new Error('Historique de tentative incomplet');
  const refs = new Set(record.references.map(raw => key(indexReferenceM03(raw))));
  if (refs.size !== record.references.length) {
    throw new Error('Références répétées dans le justificatif historique');
  }
  for (const effect of record.proof?.effects ?? []) {
    if (!refs.has(effect.abilityId)) throw new Error('Source de capacité absente du justificatif');
  }
  if (record.proof?.intensity && !refs.has(record.proof.intensity.definitionId)) {
    throw new Error('Source d’intensité absente du justificatif');
  }
  if (record.dice.reduce((a,b)=>a+b,0) !== record.action.natural) {
    throw new Error('Les cinq dés ne correspondent pas au jet historique');
  }
  checkedCost({kind:record.cost?.kind,sourceId:record.cost?.sourceId,
    amount:record.cost?.amount,availableBefore:record.cost?.availableBefore,
    version:record.cost?.version});
  if (record.cost?.approvedByGM !== true) {
    throw new Error('Approbation du coût ou date absente');
  }
  const replay = replayIndexM03Proof(record.action, record.proof);
  if (JSON.stringify(recordedResult(replay)) !== JSON.stringify(record.result) ||
      (record.applyDamage && replay.damage <= 0)) {
    throw new Error('Le résultat historique ne correspond pas à M03');
  }
  return { mathematicallyConsistent: true, replay };
}
