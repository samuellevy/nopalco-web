import { AccountModel } from '@/domain/models';

export type AuthenticationParams = {
  user: string;
  password: string;
};

export interface Authentication {
  auth: (params: AuthenticationParams) => Promise<AccountModel>;
}
