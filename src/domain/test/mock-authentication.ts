import { AccountModel } from '@/domain/models';
import { AuthenticationParams } from '@/domain/usecases';

export const mockAuthentication = (): AuthenticationParams => {
  return {
    user: 'johndoe@gmail.com',
    password: 'AnyPassword123',
  };
};

export const mockAccountModel = (): AccountModel => {
  return {
    tokenType: 'bearer',
    expiresIn: '1808787',
    refreshToken: '29567e3f97445d60e8',
    idToken: 'eyJhbGciOiJSUz',
    scopes: ['openid'],
    nomeUsuario: null,
  };
};
