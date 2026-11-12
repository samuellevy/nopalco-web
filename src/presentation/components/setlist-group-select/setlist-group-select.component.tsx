import { useEffect, useState } from 'react';
import { loadGroups } from '@/data/services/account-service';
import { UserGroup } from '@/domain/models/user-profile';
import * as S from './setlist-group-select.styles';

type Props = {
  value: string | null;
  currentName?: string;
  label?: string;
  disabled?: boolean;
  onChange: (groupId: string | null) => void;
};

export const SetlistGroupSelect = ({ value, currentName, label = 'Grupo', disabled, onChange }: Props) => {
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    loadGroups().then(
      (result) => {
        if (active) {
          setGroups(result);
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
  }, []);

  return (
    <S.Field>
      {label}
      <S.Select
        value={value || ''}
        disabled={disabled || loading}
        onChange={(event) => onChange(event.target.value || null)}
      >
        <option value="">{loading ? 'Carregando grupos...' : 'Sem grupo'}</option>
        {value && !groups.some((group) => group.id === value) && (
          <option value={value} disabled>
            {currentName || 'Grupo atual'}
          </option>
        )}
        {groups.map((group) => (
          <option key={group.id} value={group.id}>
            {group.name}
          </option>
        ))}
      </S.Select>
      {error && <S.Error role="alert">Não foi possível carregar seus grupos.</S.Error>}
    </S.Field>
  );
};
