import React from 'react';
import { Eye, EyeOff, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import * as S from './login.styles';
import FullscreenButtonComponent from '@/presentation/components/fullscreen-button/fullscreen-button.component';
import { AxiosHttpClient } from '@/infra/http/axios-http-client/axios-http-client';
import { RemoteAuthentication } from '@/data/usecases/authentication/remote-authentication';
import { InvalidCredentialsError } from '@/domain/errors';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [remember, setRemember] = React.useState(true);
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError('Digite seu e-mail e sua senha');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const auth = new RemoteAuthentication(`${window.env.API}/auth/login`, new AxiosHttpClient());
      const account = await auth.auth({ username, password });
      localStorage.setItem('account', JSON.stringify({ ...account, remember }));
      navigate('/');
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        setError('Usuário ou senha inválidos');
      } else {
        setError('Erro ao autenticar. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <S.Container>
      <S.Card>
        <S.Topbar>
          <FullscreenButtonComponent />
        </S.Topbar>
        <S.IconWrapper>
          <Music size={28} />
        </S.IconWrapper>
        <S.Title>Bem-vindo de volta!</S.Title>
        <S.Subtitle>Faça login para acessar seus shows</S.Subtitle>

        <S.Form onSubmit={handleLogin}>
          <S.Field>
            <S.Label htmlFor="username">Usuário</S.Label>
            <S.Input
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="seu usuário ou e-mail"
              autoComplete="username"
            />
          </S.Field>

          <S.Field>
            <S.Label htmlFor="password">Senha</S.Label>
            <S.PasswordWrapper>
              <S.Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Sua senha"
                autoComplete="current-password"
              />
              <S.PasswordToggle
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </S.PasswordToggle>
            </S.PasswordWrapper>
          </S.Field>

          <S.OptionsRow>
            <S.CheckboxLabel>
              <S.Checkbox type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
              Lembrar de mim
            </S.CheckboxLabel>
            <S.ForgotLink href="#">Esqueci minha senha</S.ForgotLink>
          </S.OptionsRow>

          {error ? <S.Error>{error}</S.Error> : null}

          <S.SubmitButton type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </S.SubmitButton>
        </S.Form>
      </S.Card>
    </S.Container>
  );
};
