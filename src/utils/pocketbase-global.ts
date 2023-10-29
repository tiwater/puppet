/*

The issue you're facing is related to Next.js's Hot Module Replacement (HMR) feature which replaces modules that have changed in your running app without restarting the entire process. This means that global state, like your pocketbase instance, can be lost when a module is replaced.

A common workaround for this issue is to store your global state in a module that does not have any exports. This ensures that the module will not be hot-replaced and its state will be preserved.

*/

import PocketBase from 'pocketbase';

let pocketbase: PocketBase | null = null;

export function initializePocketBase(pocketBaseUrl: string): PocketBase {
  if (!pocketbase) {
    pocketbase = new PocketBase(pocketBaseUrl);
  }
  return pocketbase;
}
