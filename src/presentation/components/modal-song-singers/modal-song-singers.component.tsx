import { useState } from 'react';
import { Check, Plus, Trash2, X } from 'lucide-react';
import { Singer } from '@/domain/models/setlist';
import { UpdateSongRequest } from '@/domain/usecases/songs/update-song-request';
import * as S from './modal-song-singers.styles';

type SingerDraft = { id?: string; name: string; key: string };

type Props = {
  songId: string;
  singers: Singer[];
  originalKey?: string;
  updateSongRequest: UpdateSongRequest;
  onSaved: (singers: Singer[]) => void;
  onClose: () => void;
};

export const ModalSongSingers = ({ songId, singers, originalKey, updateSongRequest, onSaved, onClose }: Props) => {
  const [rows, setRows] = useState<SingerDraft[]>(() =>
    singers.length
      ? singers.map((singer) => ({ id: singer.id, name: singer.name, key: singer.key || '' }))
      : [{ name: '', key: originalKey || '' }],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updateRow = (index: number, field: 'name' | 'key', value: string) => {
    setRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)));
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const updatedSingers = rows.map((row) => ({ ...row, name: row.name.trim(), key: row.key.trim() }));
    if (updatedSingers.some((row) => !row.name || !row.key)) {
      setError('Preencha o nome e o tom de cada cantor.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const updatedSong = await updateSongRequest.execute(songId, { singers: updatedSingers });
      if (!updatedSong || !updatedSong.singers) throw new Error('Missing saved singers');
      onSaved(updatedSong.singers);
      onClose();
    } catch {
      setError('Não foi possível salvar os cantores. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <S.Overlay
      onClick={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && !saving) onClose();
      }}
    >
      <S.Dialog role="dialog" aria-modal="true" aria-labelledby="song-singers-title" aria-busy={saving} onSubmit={save}>
        <S.Header>
          <S.Title id="song-singers-title">Cantores</S.Title>
          <S.IconButton type="button" title="Fechar" aria-label="Fechar cantores" disabled={saving} onClick={onClose}>
            <X size={20} />
          </S.IconButton>
        </S.Header>
        <S.Fields disabled={saving}>
          {rows.map((row, index) => (
            <S.Row key={row.id || `new-${index}`}>
              <S.Field>
                Nome
                <input
                  autoFocus={index === 0}
                  aria-label={`Cantor ${index + 1}`}
                  value={row.name}
                  required
                  onChange={(event) => updateRow(index, 'name', event.target.value)}
                />
              </S.Field>
              <S.Field>
                Tom
                <input
                  aria-label={`Tom do cantor ${index + 1}`}
                  placeholder="F#m"
                  value={row.key}
                  required
                  onChange={(event) => updateRow(index, 'key', event.target.value)}
                />
              </S.Field>
              {!row.id && (
                <S.IconButton
                  type="button"
                  title="Remover linha"
                  aria-label={`Remover cantor ${index + 1}`}
                  onClick={() => setRows((current) => current.filter((_, rowIndex) => rowIndex !== index))}
                >
                  <Trash2 size={18} />
                </S.IconButton>
              )}
            </S.Row>
          ))}
          <S.Action
            type="button"
            onClick={() => setRows((current) => [...current, { name: '', key: originalKey || '' }])}
          >
            <Plus size={18} /> Adicionar cantor
          </S.Action>
          {error && <S.Error role="alert">{error}</S.Error>}
          <S.Actions>
            <S.Action type="button" onClick={onClose}>
              <X size={16} /> Cancelar
            </S.Action>
            <S.Action type="submit" $primary disabled={!rows.length}>
              <Check size={18} /> {saving ? 'Salvando...' : 'Salvar cantores'}
            </S.Action>
          </S.Actions>
        </S.Fields>
      </S.Dialog>
    </S.Overlay>
  );
};
