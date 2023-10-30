import 'server-only';
import setAuthCookie from './set-auth-cookie';
import { cookies } from 'next/headers';
import PocketBase from 'pocketbase';

interface OptionType {
  refresh: boolean;
  pb: PocketBase;
}

// you can place this helper in a separate file so that it can be reused
const loadAuthFromCookie = async (options?: Partial<OptionType>) => {
  const refresh = options?.refresh ?? false;
  const pb = options?.pb ?? new PocketBase(process.env.NEXT_PUBLIC_NOBASE_URL);

  const cookieStore = cookies();
  const cookieObj = cookieStore.get('pb_auth');
  if (cookieObj) {
    // load the store data from the request cookie string
    pb.authStore.loadFromCookie([cookieObj.name, cookieObj.value].join('='));
    if (refresh) {
      pb.authStore.onChange(() => {
        setAuthCookie(pb);
      });
    }
  } else {
    // If there is no user info in the cookie, we need to reset current user's info!
    // Otherwise, it will mess up with other user!!
    pb.authStore.clear();
  }

  try {
    // get an up-to-date auth store state by verifying and refreshing the loaded auth model (if any)
    refresh && pb.authStore.isValid && await pb.collection('users').authRefresh();
  } catch (_) {
    // clear the auth store on failed refresh
    pb.authStore.clear();
  }

  return pb;
};

/**
 * Try to load authorization info for pb from headers and cookies
 * @param headers
 */
export const loadAuthFromAllChannels = async (headers: any) => {
  let pb: PocketBase;
  const apiKey = headers.get('X-API-KEY');
  const authorization = headers.get('Authorization');
  if (apiKey) {
    pb = new PocketBase(process.env.NEXT_PUBLIC_NOBASE_URL);
    pb.beforeSend = function(url, options) {
      options.headers = Object.assign({}, options.headers, {
        'X-API-KEY': apiKey,
      });

      return { url, options };
    };
    await pb.collection('users').authRefresh();
  } else if (authorization) {
    pb = new PocketBase(process.env.NEXT_PUBLIC_NOBASE_URL);
    pb.beforeSend = function(url, options) {
      options.headers = Object.assign({}, options.headers, {
        'Authorization': authorization,
      });

      return { url, options };
    };
    await pb.collection('users').authRefresh();
  } else {
    pb = await loadAuthFromCookie();
  }
  return pb;
};

export default loadAuthFromCookie;
