/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import { DA_DOMAIN } from '../../setup-env.js';

const optsWithEmptyHead = {
  headers: new Headers(),
};

const optsWithEmptyBearer = {
  headers: new Headers({
    Authorization: ' ',
  }),
};

const optsWithAuth = {
  headers: new Headers({
    Authorization: 'Bearer aparker@geometrixx.info:200:1000',
  }),
};

const optsWithExpAuth = {
  headers: new Headers({
    Authorization: 'Bearer aparker@geometrixx.info:100:-150',
  }),
};

const optsWithMultiAuthAnon = {
  headers: new Headers({
    'Authorization': `,Bearer aparker@geometrixx.info`
  }),
};

const optsWithForceFail = {
  headers: new Headers({
    'x-mock-fail': true,
    Authorization: 'Bearer aparker@geometrixx.info',
  }),
};

const reqs = {
  api: new Request(`https://${DA_DOMAIN}/api/source/cq/`, optsWithEmptyHead),
  org: new Request(`https://${DA_DOMAIN}/source/cq/`, optsWithEmptyHead),
  site: new Request(`https://${DA_DOMAIN}/source/cq/Geometrixx`, optsWithAuth),
  folder: new Request(`https://${DA_DOMAIN}/source/cq/Geometrixx/NFT/`, optsWithExpAuth),
  file: new Request(`https://${DA_DOMAIN}/source/cq/Geometrixx/NFT/Outreach.html`, optsWithEmptyBearer),
  media: new Request(`https://${DA_DOMAIN}/source/cq/Geometrixx/NFT/blockchain.png`, optsWithForceFail),
  siteMulti: new Request(`https://${DA_DOMAIN}/source/cq/Geometrixx`, optsWithMultiAuthAnon),
};

export default reqs;
