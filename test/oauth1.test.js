import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  oauth1Header,
  percentEncode,
  signatureBaseString
} from '../lib/oauth1.js';

// Canonical worked example from the OAuth Core 1.0a spec, Appendix A.5.
const EXAMPLE = {
  url: new URL(
    'http://photos.example.net/photos?file=vacation.jpg&size=original'
  ),
  credentials: {
    consumer_key: 'dpf43f3p2l4k3l03',
    consumer_secret: 'kd94hf93k423kf44',
    token: 'nnch734d00sl2jdk',
    token_secret: 'pfkkdhi9sl3r4s00'
  },
  nonce: 'kllo9940pd9333jh',
  timestamp: 1191242096,
  base: 'GET&http%3A%2F%2Fphotos.example.net%2Fphotos&file%3Dvacation.jpg%26oauth_consumer_key%3Ddpf43f3p2l4k3l03%26oauth_nonce%3Dkllo9940pd9333jh%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D1191242096%26oauth_token%3Dnnch734d00sl2jdk%26oauth_version%3D1.0%26size%3Doriginal',
  signature: 'tR3+Ty81lMeYAr/Fid0kMTYa/WM='
};

const nonceOf = (header) => header.match(/oauth_nonce="([^"]+)"/)[1];
const signatureOf = (header) =>
  decodeURIComponent(header.match(/oauth_signature="([^"]+)"/)[1]);

test('percentEncode encodes RFC 3986 chars that encodeURIComponent misses', () => {
  assert.equal(percentEncode("!'()*"), '%21%27%28%29%2A');
  assert.equal(percentEncode('a b'), 'a%20b');
  assert.equal(percentEncode('vacation.jpg'), 'vacation.jpg');
});

test('signatureBaseString matches the spec example', () => {
  const params = [
    ['oauth_consumer_key', 'dpf43f3p2l4k3l03'],
    ['oauth_nonce', 'kllo9940pd9333jh'],
    ['oauth_signature_method', 'HMAC-SHA1'],
    ['oauth_timestamp', '1191242096'],
    ['oauth_token', 'nnch734d00sl2jdk'],
    ['oauth_version', '1.0'],
    ['file', 'vacation.jpg'],
    ['size', 'original']
  ];
  assert.equal(signatureBaseString('GET', EXAMPLE.url, params), EXAMPLE.base);
});

test('signatureBaseString orders duplicate keys by their value', () => {
  const url = new URL('https://api.tumblr.com/v2/tagged');
  const base = signatureBaseString('GET', url, [
    ['a', '2'],
    ['a', '1']
  ]);
  assert.match(base, /a%3D1%26a%3D2$/);
});

test('oauth1Header signs the spec example to the expected signature', async () => {
  const header = await oauth1Header('GET', EXAMPLE.url, EXAMPLE.credentials, {
    nonce: EXAMPLE.nonce,
    timestamp: EXAMPLE.timestamp
  });
  assert.equal(signatureOf(header), EXAMPLE.signature);
});

test('oauth1Header emits only oauth_* params, sorted, quoted', async () => {
  const header = await oauth1Header('GET', EXAMPLE.url, EXAMPLE.credentials, {
    nonce: EXAMPLE.nonce,
    timestamp: EXAMPLE.timestamp
  });

  assert.ok(header.startsWith('OAuth '));
  assert.match(header, /oauth_consumer_key="dpf43f3p2l4k3l03"/);
  assert.match(header, /oauth_signature_method="HMAC-SHA1"/);
  assert.match(header, /oauth_timestamp="1191242096"/);
  assert.match(header, /oauth_version="1.0"/);
  assert.doesNotMatch(header, /file=/);
  assert.doesNotMatch(header, /size=/);
});

test('oauth1Header generates a fresh nonce by default', async () => {
  const a = await oauth1Header('GET', EXAMPLE.url, EXAMPLE.credentials);
  const b = await oauth1Header('GET', EXAMPLE.url, EXAMPLE.credentials);
  assert.notEqual(nonceOf(a), nonceOf(b));
});
