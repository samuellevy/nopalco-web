import { useEffect, useState } from 'react';
import { Check, Edit2, X } from 'lucide-react';
import { getAccessToken, useSession } from '@/main/config/session';
import * as S from '@/presentation/components/song-component/song.component.styles';

type Props = {
  observations?: string;
  onSave: (value: string) => Promise<void>;
  editing?: boolean;
  onEditingChange?: (active: boolean) => void;
  showEditButton?: boolean;
};

export const SetlistObservations = ({
  observations = '',
  onSave,
  editing,
  onEditingChange,
  showEditButton = true,
}: Props) => {
  const { isAuthenticated } = useSession();
  const [localEditing, setLocalEditing] = useState(false);
  const [draft, setDraft] = useState(observations);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const active = editing ?? localEditing;

  useEffect(() => {
    if (!active) setDraft(observations);
  }, [observations, active]);

  const changeEditing = (value: boolean) => {
    setLocalEditing(value);
    onEditingChange?.(value);
    if (value) setDraft(observations);
    setError('');
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!getAccessToken() || saving) return;
    setSaving(true);
    setError('');
    try {
      await onSave(draft);
      changeEditing(false);
    } catch {
      setError('Não foi possível salvar as observações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section aria-label="Observações do item">
      {active && isAuthenticated ? (
        <S.LyricsEditor>
          <S.ObservationsForm onSubmit={save}>
            <S.LyricsInput
              aria-label="Observações do item"
              placeholder="Observações"
              rows={16}
              value={draft}
              disabled={saving}
              onChange={(event) => setDraft(event.target.value)}
            />
            {error && <S.ObservationsError role="alert">{error}</S.ObservationsError>}
            <S.PureFlexRow>
              <S.EditAction $variant="save" type="submit" disabled={saving}>
                <Check size={16} /> {saving ? 'Salvando...' : 'Salvar observações'}
              </S.EditAction>
              <S.EditAction $variant="cancel" type="button" disabled={saving} onClick={() => changeEditing(false)}>
                <X size={16} /> Cancelar
              </S.EditAction>
            </S.PureFlexRow>
          </S.ObservationsForm>
        </S.LyricsEditor>
      ) : (
        <>
          <S.LyricsBox>{observations || 'Nenhuma observação.'}</S.LyricsBox>
          {showEditButton && isAuthenticated && (
            <S.LyricsEditor>
              <S.EditAction $variant="add" type="button" onClick={() => changeEditing(true)}>
                <Edit2 size={16} /> Editar observações
              </S.EditAction>
            </S.LyricsEditor>
          )}
        </>
      )}
    </section>
  );
};
