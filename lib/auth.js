import { oauth1Header } from './oauth1.js';

export const ENV_VARS = {
  consumer_key: 'TUMBLR_CONSUMER_KEY',
  consumer_secret: 'TUMBLR_CONSUMER_SECRET',
  token: 'TUMBLR_TOKEN',
  token_secret: 'TUMBLR_TOKEN_SECRET',
  access_token: 'TUMBLR_ACCESS_TOKEN'
};

function pick(credentials, env) {
  const read = (name) => {
    const value = credentials[name] ?? env?.[ENV_VARS[name]];

    return value || undefined;
  };

  return {
    consumer_key: read('consumer_key'),
    consumer_secret: read('consumer_secret'),
    token: read('token'),
    token_secret: read('token_secret'),
    access_token: read('access_token')
  };
}

export function resolveAuth(credentials = {}, env = process.env) {
  const { consumer_key, consumer_secret, token, token_secret, access_token } =
    pick(credentials, env);

  if (consumer_key && consumer_secret && token && token_secret) {
    return {
      type: 'oauth1',
      credentials: { consumer_key, consumer_secret, token, token_secret }
    };
  }

  if (access_token) {
    return { type: 'bearer', accessToken: access_token };
  }

  if (consumer_secret || token || token_secret) {
    throw new TypeError(
      'Incomplete OAuth 1.0a credentials: consumer_key, consumer_secret, token, and token_secret are all required'
    );
  }

  if (consumer_key) {
    return { type: 'apikey', apiKey: consumer_key };
  }

  throw new TypeError(
    'No credentials: pass { consumer_key } for public reads, { access_token } for OAuth 2.0, or all four OAuth 1.0a fields'
  );
}

export async function applyAuth(strategy, method, url) {
  if (strategy.type === 'apikey') {
    url.searchParams.set('api_key', strategy.apiKey);

    return { url, headers: {} };
  }

  if (strategy.type === 'bearer') {
    return {
      url,
      headers: { Authorization: `Bearer ${strategy.accessToken}` }
    };
  }

  const header = await oauth1Header(method, url, strategy.credentials);

  return { url, headers: { Authorization: header } };
}
