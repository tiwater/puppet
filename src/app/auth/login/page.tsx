'use client';
// pages/page.tsx
import { useEffect } from 'react';

const RedirectToAuth = () => {

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get("redirect");

    if (redirect && typeof redirect === 'string') {
      const redirectTo = `${process.env.NEXT_PUBLIC_PENLESS_SERVER_URL}/auth/login?redirect=${encodeURIComponent(redirect)}`;
      window.location.href = redirectTo;
    }
  }, []);

  return (
    <div>
      正在重定向...
    </div>
  );
};

export default RedirectToAuth;
