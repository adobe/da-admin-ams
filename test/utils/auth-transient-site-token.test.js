/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import assert from 'node:assert';
import {
  exportJWK, generateKeyPair, SignJWT,
} from 'jose';

// Deliberately NOT esmocked (unlike auth.test.js's top-level import) — this exercises the
// real jose signature/audience/expiry verification against a real key pair, not the
// colon-delimited-token fake in mocks/jose.js.
import { getUsers } from '../../src/utils/auth.js';

const HLX_PROD_SERVER_HOST_PAGE = 'gov-aem.page';
const HLX_PROD_SERVER_HOST_LIVE = 'gov-aem.live';
const KEYS_URL = `https://admin.${HLX_PROD_SERVER_HOST_PAGE}/auth/discovery/keys`;

const ENV = {
  HLX_PROD_SERVER_HOST_PAGE,
  HLX_PROD_SERVER_HOST_LIVE,
  DA_AUTH: { get: async () => undefined, put: async () => {} },
};

function stubDiscoveryKeys(keys) {
  const saved = globalThis.fetch;
  globalThis.fetch = async (url) => {
    if (url.toString() === KEYS_URL) {
      return { ok: true, status: 200, json: async () => ({ keys }) };
    }
    throw new Error(`unexpected fetch in test: ${url}`);
  };
  return () => {
    globalThis.fetch = saved;
  };
}

async function signSiteToken(privateKey, {
  org = 'owner', site = 'repo', domain = HLX_PROD_SERVER_HOST_PAGE, sub = 'author@example.com', expSecondsFromNow = 3600, kid = 'hlxtst-1',
} = {}) {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'RS256', kid })
    .setAudience(`${site}--${org}.${domain}`)
    .setSubject(sub)
    .setExpirationTime(Math.floor(Date.now() / 1000) + expSecondsFromNow)
    .sign(privateKey);
}

function req(path, token) {
  return new Request(`https://admin.${HLX_PROD_SERVER_HOST_PAGE}${path}`, {
    headers: { Authorization: `Bearer hlxtst_${token}` },
  });
}

describe('DA auth: transient site token (hlxtst_...)', () => {
  let privateKey;
  let publicJwk;
  let restoreFetch;

  before(async () => {
    const keyPair = await generateKeyPair('RS256', { extractable: true });
    privateKey = keyPair.privateKey;
    publicJwk = { ...await exportJWK(keyPair.publicKey), kid: 'hlxtst-1' };
  });

  afterEach(() => {
    if (restoreFetch) restoreFetch();
  });

  it('accepts a validly signed, correctly-scoped token and returns the identity with no groups', async () => {
    restoreFetch = stubDiscoveryKeys([publicJwk]);
    const token = await signSiteToken(privateKey, { org: 'owner', site: 'repo' });

    const users = await getUsers(req('/source/owner/repo/', token), ENV);
    assert.deepStrictEqual(users, [{ email: 'author@example.com', ident: 'author@example.com', orgs: [] }]);
  });

  it('accepts a token scoped to the live domain too', async () => {
    restoreFetch = stubDiscoveryKeys([publicJwk]);
    const token = await signSiteToken(privateKey, {
      org: 'owner', site: 'repo', domain: HLX_PROD_SERVER_HOST_LIVE,
    });

    const users = await getUsers(req('/source/owner/repo/', token), ENV);
    assert.strictEqual(users[0].email, 'author@example.com');
  });

  it('rejects a token minted for a different site (aud mismatch)', async () => {
    restoreFetch = stubDiscoveryKeys([publicJwk]);
    const token = await signSiteToken(privateKey, { org: 'owner', site: 'other-repo' });

    const users = await getUsers(req('/source/owner/repo/', token), ENV);
    assert.strictEqual(users[0].email, 'anonymous');
  });

  it('rejects an expired token', async () => {
    restoreFetch = stubDiscoveryKeys([publicJwk]);
    const token = await signSiteToken(privateKey, {
      org: 'owner', site: 'repo', expSecondsFromNow: -60,
    });

    const users = await getUsers(req('/source/owner/repo/', token), ENV);
    assert.strictEqual(users[0].email, 'anonymous');
  });

  it('rejects a token signed with an unrelated key', async () => {
    restoreFetch = stubDiscoveryKeys([publicJwk]);
    const otherKeyPair = await generateKeyPair('RS256', { extractable: true });
    const token = await signSiteToken(otherKeyPair.privateKey, { org: 'owner', site: 'repo' });

    const users = await getUsers(req('/source/owner/repo/', token), ENV);
    assert.strictEqual(users[0].email, 'anonymous');
  });

  it('falls back to anonymous when the requested path has no org/site', async () => {
    const token = await signSiteToken(privateKey, { org: 'owner', site: 'repo' });
    const users = await getUsers(req('/list', token), ENV);
    assert.strictEqual(users[0].email, 'anonymous');
  });
});
