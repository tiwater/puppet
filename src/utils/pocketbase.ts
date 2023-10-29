/**
 * Helper to initialize the PocketBase client, and helper functions.
 */
import PocketBase from 'pocketbase';
import { initializePocketBase } from './pocketbase-global';

const pocketBaseUrl = process.env.NEXT_PUBLIC_NOBASE_URL;

let pocketbase = initializePocketBase(pocketBaseUrl || 'https://nb.penless.ai');

export enum AssetTag {
  Product = 'product',
  Creation = 'creation',
  Canvas = 'canvas',
  Image = 'image', // Uploaded abitrary images
  Mask = 'mask',
  Tool = 'tool',
  Model = 'model',
  Knowledge = 'knowledge',
  Workflow = 'workflow',
}

export const getRecordFileUrl = (
  pocketbase: PocketBase,
  fileFieldName: string,
) =>
(record: any) => pocketbase.files.getUrl(record, record[fileFieldName]);

export const getAssetFileUrl = (pocketbase: PocketBase) => getRecordFileUrl(pocketbase, 'file');
export const getAvatarUrl = getRecordFileUrl(pocketbase, 'avatar');

export const getAssetImageUrl = async (
  pocketbase: PocketBase,
  assetId: string,
) => {
  const assetImageRecord = await pocketbase
    .collection('assets')
    .getOne(assetId, {
      $autoCancel: false,
    });
  return getAssetFileUrl(pocketbase)(assetImageRecord);
};

export default pocketbase;
