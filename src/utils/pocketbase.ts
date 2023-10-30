/**
 * Helper to initialize the PocketBase client, and helper functions.
 */
import PocketBase from 'pocketbase';
import { initializePocketBase } from './pocketbase-global';
import { UserInfo } from '../types/user';

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

const getAdminPocketBase = async () => {
  const pocketbase = new PocketBase(pocketBaseUrl);
  const authData = await pocketbase.admins.authWithPassword(process.env.NB_ADMIN_ACCOUNT ?? '', process.env.NB_ADMIN_PASSWORD ?? '');
  return pocketbase;
}

export const getUserInfoList = async (userIds: string[]): Promise<UserInfo[]> =>{
  const pb = await getAdminPocketBase();

  const users = await pb.collection('users')
    .getFullList({
      filter: userIds.map((id)=>`id='${id}'`).join(' || '),
      fields: ['id', 'username', 'email', 'name'].join(',')
    });

  return users.map((user)=>({
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name}));
}

export default pocketbase;
