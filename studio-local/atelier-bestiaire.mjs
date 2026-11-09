import { createBestiaryCard, validateBestiaryCard } from './moteur/atelier5d6-bestiary-workshop.js';
import { deriveM05Sheet } from './moteur/atelier5d6-m05-sheet-view.js';
import { BESTIARY_SCHEMA, checkJSON, validBestiaryProfile } from './store.mjs';

export const MAX_PROFILE_BYTES = 512 * 1024;

export const BESTIARY_LABELS = Object.freeze({
  faune: 'Faune', predateur: 'Prédateur', gardien: 'Gardien', mystique: 'Mystique', colosse: 'Colosse',
  creature: 'Créature', pnj: 'PNJ', offensif: 'Offensif', defensif: 'Défensif', soutien: 'Soutien',
  physique: 'Physique', magie: 'Magie', mental: 'Mental',
});

function checked(profile) {
  if (!validBestiaryProfile(profile)) throw new Error('Vérifiez le profil de Bestiaire et son identifiant source.');
  return profile;
}

export function createProfile({ name, description, level, archetype, kind, role }) {
  const native = createBestiaryCard(level, archetype, kind, role);
  const card = { ...native, name, description };
  return checked({ origin: 'created', card, original: null });
}

export function importProfile(text) {
  if (typeof text !== 'string' || new TextEncoder().encode(text).length > MAX_PROFILE_BYTES) {
    throw new Error('Ce profil dépasse 512 Kio.');
  }
  let original;
  try { original = JSON.parse(text); }
  catch { throw new Error('Le fichier ne contient pas un document JSON valide.'); }
  checkJSON(original);
  if (original?.schema !== BESTIARY_SCHEMA || original.ruleset !== 'm03') {
    throw new Error(`Choisissez une fiche ${BESTIARY_SCHEMA} exportée depuis l’Atelier du Bestiaire.`);
  }
  if (typeof original.id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9:_-]{0,89}$/.test(original.id)) {
    throw new Error('L’identifiant du profil source est absent ou invalide.');
  }
  return checked({ origin: 'imported', card: validateBestiaryCard(original), original });
}

export function profileView(profile) {
  // Les métadonnées de publication importées sont conservées dans l’archive privée.
  return deriveM05Sheet({ ...profile.card, artwork: null, documentaryLink: null });
}
