import { clearAccount, getAccessToken, saveAccount } from './session';
import { AccountModel } from '@/domain/models/account-model';

const account = (expiration: number): AccountModel => ({
  access_token: `header.${btoa(JSON.stringify({ exp: expiration }))}.signature`,
  name: 'Ana',
  username: 'ana',
  scopes: [],
});

afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

test('uses session storage when remember is not selected', () => {
  const current = account(Math.floor(Date.now() / 1000) + 3600);
  saveAccount(current, false);
  expect(localStorage.getItem('account')).toBeNull();
  expect(getAccessToken()).toBe(current.access_token);
  clearAccount();
  expect(getAccessToken()).toBeNull();
});

test('does not consider malformed or expired tokens authenticated', () => {
  saveAccount(account(1), true);
  expect(getAccessToken()).toBeNull();
  localStorage.setItem('account', '{broken');
  expect(getAccessToken()).toBeNull();
});
