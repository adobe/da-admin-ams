#!/usr/bin/env node
/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* eslint-disable no-underscore-dangle */
/*
 * Renders wrangler.toml from wrangler.toml.tpl by substituting ${VAR} tokens
 * with values from process.env. Mirrors the helix-cloudflare-*-ams convention.
 *
 * Env vars are sourced from ams-eds-terraform's environments/<env>.env (generated
 * by scripts/generate-env-file.sh) — customer/env specifics live there, NOT in
 * this repo. Invoked via the `predeploy` npm hook before prepare-deploy.js.
 *
 * When NODE_ENV is set (the env-var-driven deploy path), every ${VAR} in the
 * template MUST resolve or this exits 1. The upstream @@VERSION@@ token is left
 * untouched here — prepare-deploy.js substitutes it into wrangler-versioned.toml.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tplPath = path.join(repoRoot, 'wrangler.toml.tpl');
const outPath = path.join(repoRoot, 'wrangler.toml');

const envVarDrivenMode = Boolean(process.env.NODE_ENV);
const tpl = fs.readFileSync(tplPath, 'utf8');
const missing = new Set();

const rendered = tpl.replace(/\$\{(\w+)\}/g, (match, key) => {
  const value = process.env[key];
  if (value === undefined || value === '') {
    missing.add(key);
    return envVarDrivenMode ? '' : match;
  }
  return value;
});

if (envVarDrivenMode && missing.size > 0) {
  console.error(`✗ Missing required env vars: ${[...missing].sort().join(', ')}`);
  console.error('  Source the environment file (environments/<env>.env) before re-running.');
  process.exit(1);
}

fs.writeFileSync(outPath, rendered);
console.log(`✓ Rendered ${path.relative(process.cwd(), outPath)} from wrangler.toml.tpl`);
