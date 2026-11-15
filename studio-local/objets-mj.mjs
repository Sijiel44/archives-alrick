import { checkJSON, CREATIONS_KEY, PJ_SOURCE_KEY, currentHitPoints, validPJSource } from './store.mjs';
import { evaluatePJ } from './pj-m02.mjs';
import { EXCHANGE_KEY, makeExchange, readExchange, receivedSheet } from './echanges-pj.mjs';

export const ITEM_CATEGORIES = Object.freeze({ monnaie: 'Monnaie', arme: 'Arme', armure: 'Armure', artefact: 'Artefact',
  consommable: 'Consommable', ingredient: 'Ingrédient', outil: 'Outil', munition: 'Munition', livre: 'Livre',
  bijou: 'Bijou', provision: 'Provision', materiau: 'Matériau', quete: 'Objet de quête', autre: 'Autre' });
export const TABLE_OBJECT_KEY = 'entreRivesTableObjectV1';
const categories = { Outil: 'outil', Arme: 'arme', Armure: 'armure', Potion: 'consommable', Artefact: 'artefact',
  Document: 'livre', Matériau: 'materiau', Autre: 'autre' };
const id = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9:_-]{0,127}$/u.test(value);
const timestamp = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value) &&
  Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;

export function objectGrantFields(creation) {
  if (!creation || creation.kind !== 'object') throw new Error('Choisissez un modèle d’objet de cette campagne.');
  return { name: String(creation.name ?? '').slice(0, 90), category: categories[creation.details?.category] ?? 'autre',
    quantity: 1, description: String(creation.description ?? '').slice(0, 600), value: '', equipped: false };
}

export function checkObjectGrantFields(fields) {
  checkJSON(fields);
  if (!fields || typeof fields !== 'object' || Array.isArray(fields) ||
      Object.keys(fields).sort().join(',') !== 'category,description,equipped,name,quantity,value' ||
      typeof fields.name !== 'string' || !fields.name.trim() || fields.name.length > 90 ||
      typeof fields.category !== 'string' || !Object.hasOwn(ITEM_CATEGORIES, fields.category) ||
      !Number.isInteger(fields.quantity) || fields.quantity < 1 || fields.quantity > 999 ||
      typeof fields.description !== 'string' || fields.description.length > 600 ||
      typeof fields.value !== 'string' || fields.value.length > 100 || typeof fields.equipped !== 'boolean') {
    throw new Error('Renseignez un nom de 90 caractères au plus, une catégorie et une quantité entière entre 1 et 999. Description : 600 caractères ; valeur : 100.');
  }
  return fields;
}

export async function prepareObjectGrant(campaign, { creationId, characterId, itemId, fields, at }) {
  checkObjectGrantFields(fields);
  if (!id(itemId) || !timestamp(at)) throw new Error('L’identifiant ou la date de cette attribution est invalide.');
  const creation = campaign?.[CREATIONS_KEY]?.find(entry => entry.id === creationId && entry.kind === 'object');
  if (!creation) throw new Error('Choisissez un modèle d’objet de cette campagne.');
  const character = campaign.characters?.find(entry => entry.id === characterId);
  const original = character?.[PJ_SOURCE_KEY];
  if (!original || !validPJSource(original) || !evaluatePJ(original).valid) throw new Error('Choisissez un PJ M02 valide de cette campagne.');
  checkJSON(original);
  if (original.inventory !== undefined && !Array.isArray(original.inventory)) throw new Error('Cet inventaire utilise un format inconnu. Sa fiche est conservée.');
  const inventory = original.inventory ?? [];
  if (inventory.length >= 150) throw new Error('L’inventaire contient déjà 150 entrées. Aucune copie n’a été ajoutée.');
  if (inventory.some(item => item?.id === itemId)) throw new Error('Cet identifiant d’objet figure déjà dans l’inventaire.');
  const pv = currentHitPoints(campaign, character);
  if (!Number.isInteger(pv) || pv < 0 || pv > original.pvMax) throw new Error('Les PV effectifs du PJ sont incohérents.');

  // Vérifie le suivi existant et prépare une base pour les fiches historiques qui n’en ont pas.
  // Le marqueur de base reste celui de la dernière version convenue, avant l’attribution locale.
  const packet = await makeExchange(original, 'mj');
  const accepted = receivedSheet(await readExchange(JSON.stringify(packet)), original);
  const marker = original[EXCHANGE_KEY] ?? { ...accepted[EXCHANGE_KEY], created: at };
  const item = { id: itemId, templateId: '', ...structuredClone(fields), name: fields.name.trim(),
    [TABLE_OBJECT_KEY]: { version: 1, creationId: creation.id, campaignId: campaign.id, at } };
  // Ne reprend du passage partageable que le marqueur : aucune normalisation des champs futurs,
  // des capacités, des statistiques ou des entrées opaques du profil local n’est nécessaire ici.
  const source = { ...structuredClone(original), name: character.name, pv,
    inventory: [...structuredClone(inventory), item], [EXCHANGE_KEY]: structuredClone(marker) };
  if (!validPJSource(source) || !evaluatePJ(source).valid) throw new Error('La copie proposée ne passe pas la vérification M02.');
  return { id: character.id, source, at };
}
