/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {
  QueryValidationFeature,
  RequestTypes
} from '@salesforce/soql-language-server';
import { LanguageClient } from 'vscode-languageclient';
import { QueryRunner } from '../editor/queryRunner';
import { withSFConnection } from '../sfdx';

export function init(client: LanguageClient): LanguageClient {
  client.registerFeature(new QueryValidationFeature());
  return client;
}
export function afterStart(client: LanguageClient): LanguageClient {
  client.onRequest(RequestTypes.RunQuery, async (queryText: string) => {
    try {
      return await withSFConnection(async conn => {
        const queryData = await new QueryRunner(conn).runQuery(queryText, {
          showErrors: false
        });
        return { result: queryData };
      });
    } catch (e) {
      // NOTE: The return value must be serializable, for JSON-RPC.
      // Thus we cannot include the exception object as-is
      return {
        error: {
          name: e.name,
          errorCode: e.errorCode,
          message: e.message
        }
      };
    }
  });

  return client;
}
