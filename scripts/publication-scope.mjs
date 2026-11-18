import path from 'node:path';
import { readFile, readdir } from 'node:fs/promises';
import YAML from 'yaml';

export async function walk(directory) {
  return (await Promise.all((await readdir(directory, { withFileTypes: true })).map(entry =>
    entry.isDirectory() ? walk(path.join(directory, entry.name)) : path.join(directory, entry.name)))).flat();
}
export function readDocument(text) {
  const front = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (!front) throw new Error('Métadonnées absentes');
  return { fm: YAML.parse(front[1]), body: text.slice(front[0].length), text };
}
export async function contentDocuments(root = 'content') {
  return Promise.all((await walk(root)).filter(file => file.endsWith('.md')).map(async file => ({
    path: path.relative(root, file).split(path.sep).join('/'), ...readDocument(await readFile(file, 'utf8')),
  })));
}
export function isCampaignDocument(document, legacy) {
  return document.fm.publish === true &&
    (document.fm.portee === 'jdr_alrick' || (!document.fm.portee && legacy.has(document.path)));
}
export function isPublicUniverse(document) {
  return document.fm.publish === true && document.fm.spoilers !== true && document.fm.unlisted !== true &&
    document.fm.visibilite !== 'privee' && document.fm.portee === 'univers_partage';
}
