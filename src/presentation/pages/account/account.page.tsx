import { useEffect, useState } from 'react';
import { ArrowLeft, RotateCcw, User } from 'lucide-react';
import { UserProfile } from '@/domain/models/user-profile';
import { loadProfile } from '@/data/services/account-service';
import * as S from './account.styles';

export const AccountPage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    loadProfile().then(
      (result) => {
        if (active) {
          setProfile(result);
          setLoading(false);
        }
      },
      () => {
        if (active) {
          setError(true);
          setLoading(false);
        }
      },
    );
    return () => {
      active = false;
    };
  }, [refresh]);

  return (
    <S.Page>
      <S.Back to="/">
        <ArrowLeft size={16} /> Home
      </S.Back>
      <S.Header>
        <S.Title>
          <User size={24} /> Informações do usuário
        </S.Title>
      </S.Header>
      {loading && <S.Status role="status">Carregando perfil...</S.Status>}
      {error && (
        <>
          <S.Error role="alert">Não foi possível carregar o perfil.</S.Error>
          <S.Action type="button" onClick={() => setRefresh((current) => current + 1)}>
            <RotateCcw size={16} /> Tentar novamente
          </S.Action>
        </>
      )}
      {!loading && !error && profile && (
        <S.Details>
          <div>
            <dt>Nome</dt>
            <dd>{profile.name}</dd>
          </div>
          <div>
            <dt>Usuário</dt>
            <dd>{profile.username}</dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd>{profile.email || 'Não informado'}</dd>
          </div>
        </S.Details>
      )}
    </S.Page>
  );
};
