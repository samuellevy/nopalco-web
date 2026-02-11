/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';

import * as S from './song.styles';
import { useNavigate } from 'react-router-dom';
import { Song } from '@/domain/models';
import { CreateSongRequest } from '@/domain/usecases/songs/create-song-request';

type Props = {
  createSongRequest: CreateSongRequest;
};

export const CreateSongPage: React.FC<Props> = ({ createSongRequest }) => {
  const navigate = useNavigate();
  const [song, setSong] = React.useState<Song>({
    name: '',
    author: '',
    bpm: '0',
    key: 'C',
    rhythm: '',
    order: 0,
    imageUrl: '',
    duration: '0:00',
    content: [
      {
        block: '1 Seção',
        notes: ['%', '%', '%', '%'],
        score: '',
        obs: '',
        lyrics: '',
      },
    ],
  } as any);

  const goHome = () => {
    navigate('/');
  };

  const updateSong = async (tempSong: Song) => {
    const { content, ...rest } = tempSong;

    try {
      const updatedSong = await createSongRequest.execute({
        ...rest,
        content: JSON.stringify(content),
      });
      console.log('Song created successfully:', updatedSong);
      navigate(`/songs/${updatedSong.id}`);
    } catch (error) {
      console.error('Error creating song:', error);
      alert('Failed to create song. Please try again.');
    }
  };

  const handleUpdateNote = (e: React.ChangeEvent<HTMLInputElement>, noteKey: number, sectionKeyChanged: number) => {
    const { value } = e.target;
    const updatedContent = song.content.map((section: any, sectionKey: number) => ({
      ...section,
      notes: section.notes?.map((note, key) => {
        if (key === noteKey && sectionKey === sectionKeyChanged) {
          return value;
        }
        return note;
      }),
    }));

    setSong((prevState) => ({ ...prevState, content: updatedContent }));
  };

  const handleUpdateKey = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSong((prevState) => ({ ...prevState, key: value }));
  };

  const handleUpdateName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSong((prevState) => ({ ...prevState, name: value }));
  };

  const handleUpdateAuthor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSong((prevState) => ({ ...prevState, author: value }));
  };

  const handleUpdateBpm = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSong((prevState) => ({ ...prevState, bpm: value }));
  };

  const handleUpdateRhythm = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSong((prevState) => ({ ...prevState, rhythm: value }));
  };

  const handleUpdateSectionTitle = (e: React.ChangeEvent<HTMLInputElement>, sectionIndex: number) => {
    const { value } = e.target;
    const updatedContent = song.content.map((section: any, index: number) =>
      index === sectionIndex ? { ...section, block: value } : section,
    );
    setSong((prevState) => ({ ...prevState, content: updatedContent }));
  };

  const handleUpdateSectionObs = (e: React.ChangeEvent<HTMLTextAreaElement>, sectionIndex: number) => {
    const { value } = e.target;
    const updatedContent = song.content.map((section: any, index: number) =>
      index === sectionIndex ? { ...section, obs: value } : section,
    );
    setSong((prevState) => ({ ...prevState, content: updatedContent }));
  };

  const handleUpdateSectionLyrics = (e: React.ChangeEvent<HTMLTextAreaElement>, sectionIndex: number) => {
    const { value } = e.target;
    const updatedContent = song.content.map((section: any, index: number) =>
      index === sectionIndex ? { ...section, lyrics: value } : section,
    );
    setSong((prevState) => ({ ...prevState, content: updatedContent }));
  };

  const handleRemoveSection = (sectionIndex: number) => {
    const updatedContent = song.content.filter((_, index: number) => index !== sectionIndex);
    setSong((prevState) => ({ ...prevState, content: updatedContent }));
  };

  const handleAddSection = () => {
    const newSection = {
      block: `+ ${song.content.length + 1} seção`,
      notes: ['%', '%', '%', '%'],
      score: '',
      obs: '',
      lyrics: '',
    };
    const updatedContent = [...song.content, newSection];
    setSong((prevState) => ({ ...prevState, content: updatedContent }));
  };

  const handleAddNote = (noteKey: number) => {
    const updatedContent = song.content.map((section: any) => ({
      ...section,
      notes: section.notes?.flatMap((note, key) => (key === noteKey ? [note, ''] : [note])),
    }));
    setSong((prevState) => ({ ...prevState, content: updatedContent }));
  };

  const handleSaveButton = async () => {
    const cleanedContent = song.content.map((section: any) => ({
      ...section,
      notes: section.notes?.filter((note) => {
        if (typeof note === 'string') {
          return note.trim() !== '';
        } else if (Array.isArray(note)) {
          return note[0].trim() !== '' || note[1].trim() !== '';
        }
        return true;
      }),
    }));
    const tempSong = { ...song, content: cleanedContent };
    setSong((prevState) => ({ ...prevState, content: cleanedContent }));
    await updateSong(tempSong);
  };

  return (
    <>
      {song && (
        <S.Container>
          <S.Header>
            <S.FlexRow>
              <S.FlexColumn>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Título</label>
                  <S.CellInput
                    type="text"
                    value={song.name}
                    onChange={(e) => handleUpdateName(e)}
                    placeholder="Nome da música"
                    style={{ fontSize: '1.4em', padding: '10px' }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Artista</label>
                  <S.CellInput
                    type="text"
                    value={song.author}
                    onChange={(e) => handleUpdateAuthor(e)}
                    placeholder="Nome do artista"
                    style={{ fontSize: '1em', padding: '10px' }}
                  />
                </div>

                <S.FlexRow>
                  <S.CellHeader>
                    <S.CellLabel>BPM</S.CellLabel>
                    <S.CellInput
                      type="text"
                      value={song.bpm}
                      onChange={(e) => handleUpdateBpm(e)}
                      placeholder="BPM"
                      style={{ fontSize: '1.2rem', padding: '8px', width: '80px' }}
                    />
                  </S.CellHeader>
                  <S.CellHeader>
                    <S.CellLabel>TONALIDADE</S.CellLabel>
                    <S.CellInput
                      type="text"
                      value={song.key}
                      onChange={(e) => handleUpdateKey(e)}
                      placeholder="Tonalidade"
                      style={{ fontSize: '1.2rem', padding: '8px', width: '80px' }}
                    />
                  </S.CellHeader>
                  <S.CellHeader>
                    <S.CellLabel>RITMO</S.CellLabel>
                    <S.CellInput
                      type="text"
                      value={song.rhythm}
                      onChange={(e) => handleUpdateRhythm(e)}
                      placeholder="Ritmo"
                      style={{ fontSize: '1.2rem', padding: '8px', width: '100px' }}
                    />
                  </S.CellHeader>
                </S.FlexRow>

                <S.PureFlexRow>
                  <S.MiniSimpleButton $backgroundColor="#008000" onClick={handleAddSection}>
                    + 1 seção
                  </S.MiniSimpleButton>
                </S.PureFlexRow>
              </S.FlexColumn>
            </S.FlexRow>
          </S.Header>

          <S.Content>
            {song.content &&
              song.content.map((songSection: any, keyContent) => (
                <S.Section key={`content-${keyContent}`}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                    <S.CellInput
                      type="text"
                      value={songSection.block}
                      onChange={(e) => handleUpdateSectionTitle(e, keyContent)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        fontSize: '1.2em',
                        fontWeight: 'bold',
                      }}
                    />
                    <button
                      onClick={() => handleRemoveSection(keyContent)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#CF142b',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                      }}
                    >
                      Remover
                    </button>
                  </div>
                  <S.Grid>
                    {songSection.notes.map((note: any, noteKey) => (
                      <S.Cell key={`${noteKey}`}>
                        <S.CellInputValue>
                          <S.CellInput
                            type="text"
                            value={typeof note === 'string' ? note : `${note[0]} ${note[1]}`}
                            onChange={(e) => handleUpdateNote(e, noteKey, keyContent)}
                            onDoubleClick={() => handleAddNote(noteKey)}
                          />
                        </S.CellInputValue>
                      </S.Cell>
                    ))}
                  </S.Grid>
                  <div style={{ marginTop: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9em' }}>
                      Observações
                    </label>
                    <textarea
                      value={songSection.obs || ''}
                      onChange={(e) => handleUpdateSectionObs(e, keyContent)}
                      placeholder="Adicione observações para esta seção"
                      style={{
                        width: '100%',
                        padding: '8px',
                        fontSize: '0.9em',
                        minHeight: '60px',
                        fontFamily: 'inherit',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        color: 'white',
                      }}
                    />
                  </div>
                  <div style={{ marginTop: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9em' }}>
                      Letras
                    </label>
                    <textarea
                      value={songSection.lyrics || ''}
                      onChange={(e) => handleUpdateSectionLyrics(e, keyContent)}
                      placeholder="Adicione as letras para esta seção"
                      style={{
                        width: '100%',
                        padding: '8px',
                        fontSize: '0.9em',
                        minHeight: '60px',
                        fontFamily: 'inherit',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        color: 'white',
                      }}
                    />
                  </div>
                </S.Section>
              ))}
          </S.Content>

          <S.FlexRow>
            <S.SimpleButton onClick={goHome}>Cancelar</S.SimpleButton>
            <S.SimpleButton $variant="success" onClick={handleSaveButton}>
              Salvar
            </S.SimpleButton>
            <S.SimpleButton $variant="danger" onClick={goHome}>
              Cancelar
            </S.SimpleButton>
          </S.FlexRow>
        </S.Container>
      )}
    </>
  );
};
