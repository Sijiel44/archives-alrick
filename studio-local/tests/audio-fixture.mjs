// Son fabriqué pour les recettes : aucun fichier ni service musical externe.
export function wave(seconds = 30) {
  const rate = 8000, samples = Math.round(rate * seconds), bytes = samples * 2;
  const buffer = Buffer.alloc(44 + bytes);
  buffer.write('RIFF', 0); buffer.writeUInt32LE(36 + bytes, 4); buffer.write('WAVEfmt ', 8);
  buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20); buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(rate, 24); buffer.writeUInt32LE(rate * 2, 28);
  buffer.writeUInt16LE(2, 32); buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36); buffer.writeUInt32LE(bytes, 40);
  for (let i = 0; i < samples; i++) buffer.writeInt16LE(Math.round(Math.sin(i * 2 * Math.PI * 220 / rate) * 600), 44 + i * 2);
  return buffer;
}

// Les réponses partielles rendent le son réellement cherchable par le moteur média.
export function waveResponse(route, body = wave()) {
  const range = /^bytes=(\d+)-(\d*)$/.exec(route.request().headers().range || '');
  const start = range ? Number(range[1]) : 0;
  const end = range?.[2] ? Math.min(Number(range[2]), body.length - 1) : body.length - 1;
  return { status: range ? 206 : 200, body: body.subarray(start, end + 1), headers: {
    'Content-Type': 'audio/wav', 'Accept-Ranges': 'bytes', 'Content-Length': String(end - start + 1),
    ...(range ? { 'Content-Range': `bytes ${start}-${end}/${body.length}` } : {}),
  } };
}
