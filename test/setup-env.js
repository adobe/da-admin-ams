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
import { config } from 'dotenv';

// Load .env file if present
config();

// Export constants and set in process.env for source code that reads from environment
export const DA_DOMAIN = process.env.DA_DOMAIN || 'BAD_VAR_da-admin-ams_DA_DOMAIN';
export const DA_COLLAB = process.env.DA_COLLAB || 'BAD_VAR_da-admin-ams_DA_COLLAB';
export const HLX_PROD_SERVER_HOST_PAGE = process.env.HLX_PROD_SERVER_HOST_PAGE || 'BAD_VAR_da-admin-ams_HLX_PROD_SERVER_HOST_PAGE';
export const HLX_PROD_SERVER_HOST_LIVE = process.env.HLX_PROD_SERVER_HOST_LIVE || 'BAD_VAR_da-admin-ams_HLX_PROD_SERVER_HOST_LIVE';
export const AEM_BUCKET_NAME = process.env.AEM_BUCKET_NAME || 'BAD_VAR_da-admin-ams_AEM_BUCKET_NAME';
export const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID || 'BAD_VAR_da-admin-ams_CF_ACCOUNT_ID';

// IMS_ORIGIN needs a valid URL for offline token validation tests
export const IMS_ORIGIN = process.env.IMS_ORIGIN || 'BAD_VAR_da-admin-ams_IMS_ORIGIN';
