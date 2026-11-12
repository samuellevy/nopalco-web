import { useEffect, useSyncExternalStore } from 'react';
import { AccountModel } from '@/domain/models/account-model';

const sessionEvent = 'nopalco-session-change';

export const getAccount = (): AccountModel | null => {
  try {
    return JSON.parse(sessionStorage.getItem('account') || localStorage.getItem('account') || 'null');
  } catch {
    return null;
  }
};

const getExpiration = (token: string): number => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp === 'number' ? payload.exp * 1000 : 0;
  } catch {
    return 0;
  }
};

export const getAccessToken = (): string | null => {
  const token = getAccount()?.access_token;
  return token && getExpiration(token) > Date.now() ? token : null;
};

export const saveAccount = (account: AccountModel, remember: boolean) => {
  localStorage.removeItem('account');
  sessionStorage.removeItem('account');
  (remember ? localStorage : sessionStorage).setItem('account', JSON.stringify(account));
  window.dispatchEvent(new Event(sessionEvent));
};

export const clearAccount = () => {
  localStorage.removeItem('account');
  sessionStorage.removeItem('account');
  window.dispatchEvent(new Event(sessionEvent));
};

const subscribe = (listener: () => void) => {
  window.addEventListener('storage', listener);
  window.addEventListener(sessionEvent, listener);
  return () => {
    window.removeEventListener('storage', listener);
    window.removeEventListener(sessionEvent, listener);
  };
};

export const useSession = () => {
  const token = useSyncExternalStore(subscribe, getAccessToken, () => null);
  useEffect(() => {
    if (!token) return;
    const timer = window.setTimeout(
      () => window.dispatchEvent(new Event(sessionEvent)),
      getExpiration(token) - Date.now() + 1,
    );
    return () => window.clearTimeout(timer);
  }, [token]);
  return { isAuthenticated: !!token, account: token ? getAccount() : null };
};
