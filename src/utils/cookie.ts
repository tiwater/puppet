export function parseCookies(cookieString: string): Record<string, string> {
  const cookies: Record<string, string> = {};

  cookieString.split(';').forEach((cookie) => {
    const [name, value] = cookie.split('=');
    cookies[name.trim()] = decodeURIComponent(value);
  });

  return cookies;
}