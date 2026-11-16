import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseServiceMediaURL } from '../service-media.mjs';

test('Les liens de services deviennent des destinations canoniques sans paramètres de suivi', () => {
  for (const url of ['https://youtu.be/M7lc1UVf-VE?si=SECRET', 'https://www.youtube.com/watch?v=M7lc1UVf-VE&autoplay=1&origin=https://evil.test', 'https://m.youtube.com/shorts/M7lc1UVf-VE']) {
    const service = parseServiceMediaURL(url);
    assert.equal(service.provider, 'youtube'); assert.equal(service.url, 'https://www.youtube.com/watch?v=M7lc1UVf-VE');
    const embed = new URL(service.embedUrl);
    assert.equal(embed.origin, 'https://www.youtube-nocookie.com'); assert.equal(embed.searchParams.get('autoplay'), '0');
    assert.equal(embed.searchParams.get('controls'), '1'); assert.equal(embed.searchParams.get('origin'), null);
  }
  const playlist = parseServiceMediaURL('https://www.youtube.com/playlist?list=PL1234567890abcdef');
  assert.match(playlist.embedUrl, /embed\/videoseries\?list=PL1234567890abcdef/);
  const spotify = parseServiceMediaURL('https://open.spotify.com/intl-fr/playlist/37i9dQZF1DX4WYpdgoIcn6?si=SECRET');
  assert.deepEqual(spotify, { provider: 'spotify', label: 'Spotify', url: 'https://open.spotify.com/playlist/37i9dQZF1DX4WYpdgoIcn6' });
  const suno = parseServiceMediaURL('https://suno.com/embed/FE3A82F0-325B-4601-9923-E8B75F55D7AB?utm_source=SECRET');
  assert.deepEqual(suno, { provider: 'suno', label: 'Suno', url: 'https://suno.com/song/fe3a82f0-325b-4601-9923-e8b75f55d7ab' });
  assert.equal(parseServiceMediaURL('https://audio.example.test/song.mp3?signature=allowed'), null);
  assert.equal(parseServiceMediaURL('https://www.youtube.com.evil.test/watch?v=M7lc1UVf-VE'), null);
});

test('Une source de service malformée ou une URL dangereuse ne produit jamais une iframe', () => {
  for (const url of ['javascript:alert(1)', 'http://youtu.be/M7lc1UVf-VE', 'https://user:secret@youtube.com/watch?v=M7lc1UVf-VE', 'https://youtube.com:8443/watch?v=M7lc1UVf-VE', 'https://youtube.com/watch?v=bad', 'https://youtube.com/watch?v=M7lc1UVf-VE&list=<script>', 'https://youtube.com/channel/whatever', 'https://open.spotify.com/playlist/short', 'https://suno.com/song/../../anything', 'https://suno.com/s/short', 'https://youtu.be/M7lc1UVf-VE/extra', 'https://youtube.com/watch?v=M7lc1UVf-VE\\bad']) {
    assert.throws(() => parseServiceMediaURL(url), undefined, url);
  }
});
