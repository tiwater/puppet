import 'server-only';
import { cookies } from 'next/headers';
import PocketBase from 'pocketbase';

const parseCookie = (str: string) =>
  Object.fromEntries(str.split('; ').map(v => v.split(/=(.*)/s).map(decodeURIComponent)));

const setAuthCookie = (pb: PocketBase) => {
  const authCookie = parseCookie(pb.authStore.exportToCookie({ httpOnly: false }));
  cookies().set('pb_auth', authCookie.pb_auth, {
    httpOnly: false, // This is important!!!
    path: '/',
    expires: new Date(authCookie.Expires),
  });
};

export default setAuthCookie;
