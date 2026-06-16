import { AccountModel } from '@/domain/models';
import { AuthenticationParams } from '@/domain/usecases';

export const mockAuthentication = (): AuthenticationParams => {
  return {
    username: 'johndoe@gmail.com',
    password: 'AnyPassword123',
  };
};

export const mockAccountModel = (): AccountModel => {
  return {
    access_token: 'mocked_access_token',
    name: 'John Doe',
    username: 'johndoe@gmail.com',
    scopes: ['openid'],
  };
};
