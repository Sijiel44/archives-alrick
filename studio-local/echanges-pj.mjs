import { checkJSON, sha256, validPJSource } from './store.mjs';
import { evaluatePJ, MAX_PJ_FILE_BYTES, M02_SCHEMA } from './pj-m02.mjs';
import { validPortrait } from './portraits.mjs';

export const EXCHANGE_FORMAT = 'chroniques-entre-rives.echange-pj';
export const EXCHANGE_KEY = 'entreRivesExchangeV1';
const digest = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const take = (value, keys) => Object.fromEntries(keys.filter(key => Object.hasOwn(value, key)).map(key => [key, value[key]]));
const scalars = (value, keys) => Object.fromEntries(Object.entries(take(value, keys))
  .filter(([, field]) => ['string', 'number', 'boolean'].includes(typeof field)));
const itemFields = ['id', 'templateId', 'name', 'category', 'quantity', 'description', 'value', 'equipped'];
const canonical = value => JSON.stringify(order(value));
function order(value) {
  if (Array.isArray(value)) return value.map(order);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, order(value[key])]));
  return value;
}

// Même sélection explicite pour le M02 historique et pour les échanges versionnés.
export function sharedSheet(sheet) {
  const copy = take(sheet, ['id', 'name', 'kind', 'ruleset', 'level', 'pv', 'pvMax', 'mana', 'manaMax', 'xp', 'stats', 'masteries']);
  for (const key of ['resistanceBonus', 'protection', 'equipmentGrades']) copy[key] = take(sheet[key], ['physique', 'magie', 'mental']);
  copy.stats = take(sheet.stats, ['physique', 'agilite', 'esprit', 'presence']);
  if (validPortrait(sheet.portrait) && sheet.portrait) copy.portrait = sheet.portrait;
  copy.development = {
    startingStats: take(sheet.development.startingStats, ['physique', 'agilite', 'esprit', 'presence']),
    abilities: sheet.development.abilities.map(ability => scalars(ability, ['id', 'name', 'description', 'domain', 'kind',
      'levelRequired', 'masteryDomain', 'masteryRequired', 'effect', 'limitations', 'resources', 'provenance', 'approvedByGM', 'status', 'rank', 'parentId'])),
    awards: [], approvedMilestones: Array.isArray(sheet.development.approvedMilestones)
      ? sheet.development.approvedMilestones.filter(level => Number.isInteger(level) && level >= 21 && level <= 25) : [],
    history: [],
  };
  copy.inventory = Array.isArray(sheet.inventory) ? sheet.inventory.filter(item => typeof item?.name === 'string').map(item =>
    scalars(item, itemFields)) : [];
  return copy;
}

export function playerExchange(sheet) {
  return { schema: M02_SCHEMA, created: new Date().toISOString(), sheets: [sharedSheet(sheet)] };
}

export async function makeExchange(source, origin) {
  if (!['joueur', 'mj'].includes(origin) || !validPJSource(source) || !evaluatePJ(source).valid) throw new Error('Cette fiche ne passe pas la vérification M02.');
  const sheet = sharedSheet(source);
  const revision = await sha256(canonical(sheet));
  const previous = source[EXCHANGE_KEY];
  if (previous !== undefined && (previous?.version !== 1 || !digest(previous.revision))) throw new Error('La version du suivi d’échange est inconnue. Conserve ta sauvegarde personnelle.');
  const payload = { created: new Date().toISOString(), origin, base: previous?.revision ?? revision, revision, sheet };
  const packet = { format: EXCHANGE_FORMAT, version: 1, checksum: await sha256(canonical(payload)), payload };
  if (new TextEncoder().encode(JSON.stringify(packet)).length > MAX_PJ_FILE_BYTES) throw new Error('Le fichier d’échange dépasse 2 Mio.');
  return packet;
}

export async function readExchange(text) {
  if (new TextEncoder().encode(text).length > MAX_PJ_FILE_BYTES) throw new Error('Le fichier dépasse 2 Mio.');
  const packet = JSON.parse(text);
  checkJSON(packet);
  if (packet?.format !== EXCHANGE_FORMAT || packet.version !== 1) throw new Error('Cette version de fichier d’échange est inconnue.');
  const p = packet.payload;
  if (Object.keys(packet).sort().join(',') !== 'checksum,format,payload,version' || !p ||
      Object.keys(p).sort().join(',') !== 'base,created,origin,revision,sheet' || !['joueur', 'mj'].includes(p.origin) ||
      typeof p.created !== 'string' || !Number.isFinite(Date.parse(p.created)) || !digest(p.base) || !digest(p.revision) ||
      !validPJSource(p.sheet) || !evaluatePJ(p.sheet).valid || canonical(p.sheet) !== canonical(sharedSheet(p.sheet)) ||
      p.revision !== await sha256(canonical(p.sheet)) || packet.checksum !== await sha256(canonical(p))) {
    throw new Error('Le fichier d’échange est incomplet, altéré ou contient des champs non partageables.');
  }
  return p;
}

export function receivedSheet(exchange, local) {
  const incoming = exchange.sheet;
  if (local && local.id !== incoming.id) throw new Error('Ces fiches n’ont pas la même identité.');
  const copy = { ...local, ...incoming };
  if (!incoming.portrait) delete copy.portrait;
  if (local) {
    copy.development = { ...local.development, ...incoming.development,
      awards: local.development.awards ?? [], history: local.development.history ?? [] };
    const previous = Array.isArray(local.inventory) ? local.inventory : [];
    copy.inventory = incoming.inventory.map(item => {
      const matches = previous.filter(old => item.id ? old?.id === item.id : old?.name === item.name);
      const privateFields = matches.length === 1 ? take(matches[0], Object.keys(matches[0]).filter(key => !itemFields.includes(key))) : {};
      return { ...privateFields, ...item };
    });
    // Les entrées opaques ne sont jamais détruites par une copie partageable.
    copy.inventory.push(...previous.filter(item => typeof item?.name !== 'string'));
  }
  copy[EXCHANGE_KEY] = { version: 1, revision: exchange.revision, origin: exchange.origin, created: exchange.created };
  return copy;
}

export async function compareExchange(local, exchange) {
  if (local.id !== exchange.sheet.id) throw new Error('Ces fiches n’ont pas la même identité.');
  const current = sharedSheet(local), incoming = exchange.sheet;
  const revision = await sha256(canonical(current));
  const groups = [
    ['Nom', value => value.name], ['Niveau et XP', value => `${value.level} · ${value.xp} XP`],
    ['PV', value => `${value.pv} / ${value.pvMax}`], ['Mana', value => `${value.mana} / ${value.manaMax}`],
    ['Caractéristiques', value => value.stats], ['Maîtrises', value => value.masteries],
    ['Défenses', value => take(value, ['resistanceBonus', 'protection', 'equipmentGrades'])],
    ['Portrait', value => value.portrait ?? ''], ['Inventaire', value => value.inventory],
    ['Capacités et progression', value => value.development],
  ];
  return { identical: revision === exchange.revision, divergent: revision !== exchange.base && revision !== exchange.revision,
    changes: groups.flatMap(([label, value]) => canonical(value(current)) === canonical(value(incoming)) ? [] :
      [{ label, before: value(current), after: value(incoming) }]) };
}

export function renderExchangePreview(container, exchange, comparison) {
  const element = (tag, text, className) => { const el = document.createElement(tag); el.textContent = text; if (className) el.className = className; return el; };
  const origin = exchange.origin === 'mj' ? 'MJ' : 'joueur';
  const provenance = element('details', '', 'exchange-provenance');
  provenance.append(element('summary', 'Provenance et version'),
    element('p', `Envoi déclaré ${origin} · ${new Intl.DateTimeFormat('fr', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(exchange.created))}`, 'field-help'),
    element('p', `Identité ${exchange.sheet.id} · version ${exchange.revision.slice(0, 12)}`, 'exchange-identity'),
    element('p', 'L’expéditeur est déclaré dans le fichier. Confirme sa provenance auprès de ta table.', 'field-help'));
  container.replaceChildren(provenance);
  if (!comparison) {
    container.append(element('p', 'Aucune copie locale de même identité à comparer. L’import créera une nouvelle fiche.', 'notice'));
    const sheet = exchange.sheet;
    container.append(element('p', `${sheet.name} · niveau ${sheet.level} · PV ${sheet.pv} / ${sheet.pvMax} · mana ${sheet.mana} / ${sheet.manaMax} · ${sheet.inventory.length} objet(s) · ${sheet.development.abilities.length} capacité(s)`, 'field-help'));
    return;
  }
  container.append(element('p', comparison.identical ? 'Cette version est déjà présente.' : comparison.divergent
    ? 'Versions divergentes : la fiche locale a changé ou la base reçue diffère. Compare les données avant de choisir.'
    : 'La fiche reçue part de cette version locale.', comparison.divergent ? 'notice error' : 'notice'));
  const list = element('div', '', 'exchange-comparison');
  for (const { label, before, after } of comparison.changes) {
    const row = element('section', '', 'exchange-change');
    row.append(element('h4', label));
    for (const [title, value] of [['Ma copie actuelle', before], ['Fichier reçu', after]]) {
      const side = element('div', '', 'exchange-value');
      side.append(element('strong', title));
      if (label === 'Portrait') {
        if (value) {
          const img = element('img', '', 'exchange-portrait');
          img.alt = `Portrait · ${title}`;
          img.referrerPolicy = 'no-referrer';
          img.src = value;
          img.addEventListener('error', () => { img.replaceWith(element('p', 'Portrait indisponible.')); }, { once: true });
          side.append(img);
        } else side.append(element('p', 'Sans portrait'));
      }
      else if (typeof value === 'object') {
        const details = element('details', '');
        const labels = { physique: 'Physique', agilite: 'Agilité', esprit: 'Esprit', presence: 'Présence', magie: 'Magie', mental: 'Mental' };
        const pretty = key => Object.hasOwn(labels, key) ? labels[key] : key.replaceAll('_', ' ');
        const ranks = values => Object.entries(values).map(([key, rank]) => `${pretty(key)} ${rank}`).join(' · ') || 'Aucune';
        if (label === 'Inventaire') {
          details.append(element('summary', `${value.length} objet${value.length > 1 ? 's' : ''}`));
          const items = element('ul', '', 'exchange-items');
          for (const item of value) items.append(element('li', `${item.name} × ${item.quantity ?? 1}${item.equipped ? ' · porté' : ''}${item.description ? ` — ${item.description}` : ''}${item.value ? ` · Valeur : ${item.value}` : ''}`));
          details.append(items);
        } else if (label === 'Capacités et progression') {
          details.append(element('summary', `${value.abilities.length} capacité(s) · parcours`), element('p', `Caractéristiques de départ · ${ranks(value.startingStats)}`));
          for (const ability of value.abilities) {
            const abilityDetails = element('details', '');
            abilityDetails.append(element('summary', `${ability.name} · rang ${ability.rank} · niveau ${ability.levelRequired}`));
            for (const key of ['description', 'effect', 'limitations', 'provenance']) if (ability[key]) abilityDetails.append(element('p', ability[key]));
            abilityDetails.append(element('p', ability.approvedByGM ? 'Validation MJ indiquée' : 'À discuter avec le MJ'));
            details.append(abilityDetails);
          }
          if (value.approvedMilestones.length) details.append(element('p', `Paliers indiqués · ${value.approvedMilestones.join(', ')}`));
        } else if (label === 'Défenses') {
          details.append(element('summary', 'Résistance et protection'));
          for (const [key, name] of [['resistanceBonus', 'Bonus de résistance'], ['protection', 'Protection'], ['equipmentGrades', 'Grade d’équipement']]) details.append(element('p', `${name} · ${ranks(value[key])}`));
        } else {
          side.append(element('p', ranks(value)));
          row.append(side);
          continue;
        }
        side.append(details);
      } else side.append(element('p', String(value)));
      row.append(side);
    }
    list.append(row);
  }
  container.append(list);
}
