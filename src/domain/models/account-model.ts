export type AccountModel = {
  access_token: string;
  name: string;
  username: string;
  scopes: string[];
  type?: 'user' | 'admin';
};
