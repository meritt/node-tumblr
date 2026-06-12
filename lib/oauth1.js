const SIGNATURE_METHOD = 'HMAC-SHA1';
const OAUTH_VERSION = '1.0';

const encoder = new TextEncoder();

export function percentEncode(value) {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

function comparePairs([keyA, valueA], [keyB, valueB]) {
  if (keyA !== keyB) {
    return keyA < keyB ? -1 : 1;
  }

  if (valueA !== valueB) {
    return valueA < valueB ? -1 : 1;
  }

  return 0;
}

export function signatureBaseString(method, url, params) {
  const normalized = params
    .map(([key, value]) => [percentEncode(key), percentEncode(value)])
    .toSorted(comparePairs)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  const baseUri = `${url.origin}${url.pathname}`;

  return `${method.toUpperCase()}&${percentEncode(baseUri)}&${percentEncode(normalized)}`;
}

function nonce() {
  return crypto.getRandomValues(new Uint8Array(16)).toHex();
}

async function sign(base, signingKey) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(signingKey),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  const digest = await crypto.subtle.sign('HMAC', key, encoder.encode(base));

  return new Uint8Array(digest).toBase64();
}

export async function oauth1Header(method, url, credentials, options = {}) {
  const { consumer_key, consumer_secret, token, token_secret } = credentials;

  const oauthParams = {
    oauth_consumer_key: consumer_key,
    oauth_nonce: options.nonce ?? nonce(),
    oauth_signature_method: SIGNATURE_METHOD,
    oauth_timestamp: String(
      options.timestamp ??
        Math.floor(Temporal.Now.instant().epochMilliseconds / 1000)
    ),
    oauth_token: token,
    oauth_version: OAUTH_VERSION
  };

  const params = [...Object.entries(oauthParams), ...url.searchParams];
  const base = signatureBaseString(method, url, params);

  const signingKey = `${percentEncode(consumer_secret)}&${percentEncode(token_secret ?? '')}`;
  const signature = await sign(base, signingKey);

  const headerParams = { ...oauthParams, oauth_signature: signature };

  const header = Object.keys(headerParams)
    .toSorted()
    .map(
      (name) => `${percentEncode(name)}="${percentEncode(headerParams[name])}"`
    )
    .join(', ');

  return `OAuth ${header}`;
}
