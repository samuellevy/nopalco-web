/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { PlusCircle, MinusCircle, Search } from 'lucide-react';

import * as S from './song.component.styles';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Song } from '@/domain/models';
import { LoadAllSongsRequest } from '@/domain/usecases';
import { LoadSetlistRequest } from '@/domain/usecases/setlists/load-setlist-request';
import { SetlistItem } from '@/domain/models/setlist';
import { UpdateSongRequest } from '@/domain/usecases/songs/update-song-request';
import { ModalSongsListComponent } from '@/presentation/components/modal-song-list/modal-song-list.component';
import FullscreenButtonComponent from '@/presentation/components/fullscreen-button/fullscreen-button.component';
import SheetMusicPage from '@/presentation/pages/sheet-music/sheet-music.page';
import { ButtonComponent } from '../button/button';

interface Content {
  block: string;
  notes: (string | [string, string])[];
  score: string;
  obs?: string;
}

type Props = {
  data: Song;
  dataKey: string | null;
  loadAllSongsRequest: LoadAllSongsRequest;
  loadSetlistRequest: LoadSetlistRequest;
  updateSongRequest: UpdateSongRequest;
  setlistSongList?: SetlistItem[];
  handleSetlistButton: () => void;
  handleNextSongButton: (id: string) => void;
  handlePreviousSongButton: (id: string) => void;
};

export const SongComponent: React.FC<Props> = ({
  data,
  dataKey,
  updateSongRequest,
  loadAllSongsRequest,
  handleSetlistButton,
  handleNextSongButton,
  handlePreviousSongButton,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setlist = searchParams.get('setlist');
  const key = dataKey || null;
  const [activeBpm, setActiveBpm] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);
  const [sheetMusicMode, setSheetMusicMode] = React.useState(true);
  const [chordsMusicMode] = React.useState(true);
  const [modalSongsOpen, setModalSongsOpen] = React.useState(false);
  const [isSplitted, setIsSplitted] = React.useState(false);
  const [song, setSong] = React.useState<Song>(null as unknown as Song);

  const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  const goFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if ((elem as any).webkitRequestFullscreen) {
      (elem as any).webkitRequestFullscreen();
    } else if ((elem as any).msRequestFullscreen) {
      (elem as any).msRequestFullscreen();
    }
  };

  const getNoteIndex = (note: string): number => {
    const FLAT_TO_SHARP_MAP: { [key: string]: string } = {
      Db: 'C#',
      Eb: 'D#',
      Gb: 'F#',
      Ab: 'G#',
      Bb: 'A#',
    };

    if (note in FLAT_TO_SHARP_MAP) {
      note = FLAT_TO_SHARP_MAP[note];
    }
    return NOTES.indexOf(note);
  };

  function isMinorChord(chord: string): boolean {
    const minorChordRegex = /^[A-G][#b]?m/;
    return minorChordRegex.test(chord);
  }

  function getRelativeMajor(minorChord: string): string {
    const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const FLAT_TO_SHARP_MAP: { [key: string]: string } = {
      Db: 'C#',
      Eb: 'D#',
      Gb: 'F#',
      Ab: 'G#',
      Bb: 'A#',
    };

    const regex = /^([A-G][#b]?)(.*)$/;
    const match = minorChord.match(regex);

    if (!match) return minorChord;

    let baseNote = match[1];
    const modifiers = match[2];

    if (baseNote in FLAT_TO_SHARP_MAP) {
      baseNote = FLAT_TO_SHARP_MAP[baseNote];
    }

    const noteIndex = NOTES.indexOf(baseNote);
    if (noteIndex === -1) return minorChord;

    // Calcula o relativo maior (3 semitons acima)
    const majorIndex = (noteIndex + 3) % NOTES.length;
    const majorNote = NOTES[majorIndex];

    const newModifiers = modifiers.replace('m', '');

    return majorNote + newModifiers;
  }

  const updateSong = async (tempSong: Song) => {
    const { content, ...rest } = tempSong;

    try {
      const updatedSong = await updateSongRequest.execute(song.id, {
        ...rest,
        content: JSON.stringify(content),
      });
      console.log('Song updated successfully:', updatedSong);
    } catch (error) {
      console.error('Error updating song:', error);
      alert('Failed to update song. Please try again.');
    }
  };

  const transposeContent = (content: any[], currentKey: string, targetKey: string): any[] => {
    const currentIndex = getNoteIndex(currentKey);
    const targetIndex = getNoteIndex(targetKey);

    if (currentIndex === -1 || targetIndex === -1) return content;

    const steps = (targetIndex - currentIndex + NOTES.length) % NOTES.length;

    let newContent = content;
    for (let i = 0; i < steps; i++) {
      newContent = increaseTone(newContent, true);
    }
    return newContent;
  };

  React.useEffect(() => {
    if (data) {
      document.title = `${data.name} - NoPalco`;
      // console.log(key, `key`);
      // console.log(data, `data`);

      const transposedContent = key
        ? transposeContent(data.content, isMinorChord(data.key) ? getRelativeMajor(data.key) : data.key, key)
        : data.content;
      setSong({ ...data, content: transposedContent });
    }
  }, [data, key]);

  function increaseTone(content: any[], returnContent = false): any[] {
    function transposeNote(note: string): string {
      const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

      // Mapeamento de notas bemóis para sustenidos equivalentes
      const FLAT_TO_SHARP_MAP: { [key: string]: string } = {
        Db: 'C#',
        Eb: 'D#',
        Gb: 'F#',
        Ab: 'G#',
        Bb: 'A#',
      };

      // Extrair a parte da nota base (C, C#, D, etc.)
      const regex = /^([A-G][#b]?)(.*)$/;
      const match = note.match(regex);

      if (!match) return note; // Se não corresponder ao padrão de uma nota, retorna o valor original

      let baseNote = match[1]; // A nota base (Ex: E, F#, Db)
      const modifiers = match[2]; // Modificadores (Ex: m, º, sus4, etc.)

      // Se a nota for bemol, converte para o sustenido equivalente
      if (baseNote in FLAT_TO_SHARP_MAP) {
        baseNote = FLAT_TO_SHARP_MAP[baseNote];
      }

      const noteIndex = NOTES.indexOf(baseNote);
      if (noteIndex === -1) return note; // Se não for uma nota válida, retorna o valor original

      // Aumenta um semitom e faz o wrap usando o módulo para ciclar a lista
      const newIndex = (noteIndex + 1) % NOTES.length;
      const transposedNote = NOTES[newIndex];

      return transposedNote + modifiers; // Retorna a nota transposta junto com os modificadores
    }

    function transposeNotesBlock(notesBlock: string | [string, string]): string | [string, string] {
      if (Array.isArray(notesBlock)) {
        return [transposeNote(notesBlock[0]), transposeNote(notesBlock[1])];
      }
      return notesBlock.split(' ').map(transposeNote).join(' ');
    }

    const newContent = content.map((block) => ({
      ...block,
      notes: block.notes ? block.notes.map(transposeNotesBlock) : block.notes,
    }));

    if (returnContent) {
      return newContent;
    }
    setSong((prevState) => ({ ...prevState, content: newContent }));
  }

  function decreaseTone(content: any[]): void {
    const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const FLAT_TO_SHARP_MAP: { [key: string]: string } = {
      Db: 'C#',
      Eb: 'D#',
      Gb: 'F#',
      Ab: 'G#',
      Bb: 'A#',
    };

    function transposeNote(note: string): string {
      const regex = /^([A-G][#b]?)(.*)$/;
      const match = note.match(regex);

      if (!match) return note;

      let baseNote = match[1];
      const modifiers = match[2];

      if (baseNote in FLAT_TO_SHARP_MAP) {
        baseNote = FLAT_TO_SHARP_MAP[baseNote];
      }

      const noteIndex = NOTES.indexOf(baseNote);
      if (noteIndex === -1) return note;

      const newIndex = (noteIndex - 1 + NOTES.length) % NOTES.length;
      const transposedNote = NOTES[newIndex];

      return transposedNote + modifiers;
    }

    function transposeNotesBlock(notesBlock: string | [string, string]): string | [string, string] {
      if (Array.isArray(notesBlock)) {
        // Se for array, transpõe cada elemento
        return [transposeNote(notesBlock[0]), transposeNote(notesBlock[1])];
      }
      // Se for string, divide por espaço, transpõe cada nota e junta novamente
      return notesBlock.split(' ').map(transposeNote).join(' ');
    }

    const newContent = content.map((block) => ({
      ...block,
      notes: block.notes ? block.notes.map(transposeNotesBlock) : block.notes,
    }));

    setSong((prevState) => ({ ...prevState, content: newContent }));
  }

  function isStringBetweenAsterisks(str: string): boolean {
    const asteriskRegex = /\*([^*]+)\*/;
    const asteriskMatch = str.match(asteriskRegex);
    return !!asteriskMatch;
  }

  function isStringBetweenUnderscores(str: string): boolean {
    const underscoreRegex = /_([^_]+)_/;
    const underscoreMatch = str.match(underscoreRegex);
    return !!underscoreMatch;
  }

  function removeAsterisksAndUnderscores(str: string): string {
    return str.replace(/^[*_]+|[*_]+$/g, '');
  }

  const handleHomeButton = () => {
    navigate(`/`);
  };

  // const getNextItem = (actualSongId: string) => {
  //   console.log(actualSongId, `nextSongId`);
  //   if (setlistSongList) {
  //     const actualSongIndex = setlistSongList.findIndex((item) =>
  //       item.song && item.song.id === actualSongId ? item : null,
  //     );
  //     if (actualSongIndex !== -1 && actualSongIndex < setlistSongList.length - 1) {
  //       return setlistSongList[actualSongIndex + 1];
  //     }
  //     return null;
  //     // setlistSongList.map(item => {
  //     //   console.log(item.song.id);
  //     // })
  //   }
  //   // console.log(setlistSongList);
  //   // const index = setlistSongList.findIndex((item) => item.song.id === id);
  //   // if (index !== -1 && index < setlistSongList.length - 1) {
  //   //   return setlistSongList[index + 1];
  //   // }
  //   // return null; // Retorna null se não encontrar ou se for o último item
  //   return null;
  // };

  // const getPreviousItem = (actualSongId: string) => {
  //   if (setlistSongList) {
  //     const actualSongIndex = setlistSongList.findIndex((item) =>
  //       item.song && item.song.id === actualSongId ? item : null,
  //     );
  //     if (actualSongIndex > 0) {
  //       return setlistSongList[actualSongIndex - 1];
  //     }
  //     return null;
  //     // setlistSongList.map(item => {
  //     //   console.log(item.song.id);
  //     // })
  //   }
  //   // console.log(setlistSongList);
  //   // const index = setlistSongList.findIndex((item) => item.song.id === id);
  //   // if (index !== -1 && index < setlistSongList.length - 1) {
  //   //   return setlistSongList[index + 1];
  //   // }
  //   // return null; // Retorna null se não encontrar ou se for o último item
  //   return null; // Retorna null se não houver anterior ou se não encontrar o id
  // };

  // const handleNextSongButton = (id: string) => {
  //   const nextSong = getNextItem(id);
  //   console.log(nextSong, `nextSong`);

  //   if (nextSong && nextSong.song) {
  //     // window.location.href = `/songs/${nextSong.song.id}?setlist=${setlist}&key=${encodeURIComponent(nextSong.key)}`;
  //   } else {
  //     // window.location.href = `/setlists/${setlist}?position=${songId}`;
  //   }
  // };

  // const handlePreviousSongButton = (id: string) => {
  //   const previousSong = getPreviousItem(id);
  //   console.log(previousSong);
  //   if (previousSong && previousSong.song) {
  //     window.location.href = `/songs/${previousSong.song.id}?setlist=${setlist}&key=${encodeURIComponent(
  //       previousSong.key,
  //     )}`;
  //   } else {
  //     window.location.href = `/setlists/${setlist}?position=${songId}`;
  //   }
  // };

  const handleEditButton = () => {
    setEditMode((prevState) => !prevState);
    // console.log(song.content);
  };

  const toggleSplit = () => {
    setIsSplitted((prevState) => !prevState);
  };

  const handleToggleSheetMusicMode = () => {
    setSheetMusicMode((prevState) => !prevState);
    // console.log(song.content);
  };

  const handleUpdateNote = (e: React.ChangeEvent<HTMLInputElement>, noteKey: number, sectionKeyChanged: number) => {
    const { value } = e.target;
    const updatedContent = song.content.map((section: Content, sectionKey: number) => ({
      ...section,
      notes: section.notes?.map((note, key) => {
        if (key === noteKey && sectionKey === sectionKeyChanged) {
          // Just return the value as-is, letting the backend handle the format
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

  const handleUpdateSectionTitle = (e: React.ChangeEvent<HTMLInputElement>, sectionIndex: number) => {
    const { value } = e.target;
    const updatedContent = song.content.map((section: Content, index: number) =>
      index === sectionIndex ? { ...section, block: value } : section,
    );
    setSong((prevState) => ({ ...prevState, content: updatedContent }));
  };

  const handleUpdateSectionObs = (e: React.ChangeEvent<HTMLInputElement>, sectionIndex: number) => {
    const { value } = e.target;
    const updatedContent = song.content.map((section: Content, index: number) =>
      index === sectionIndex ? { ...section, obs: value } : section,
    );
    setSong((prevState) => ({ ...prevState, content: updatedContent }));
  };

  const handleRemoveSection = (sectionIndex: number) => {
    const updatedContent = song.content.filter((_, index: number) => index !== sectionIndex);
    setSong((prevState) => ({ ...prevState, content: updatedContent }));
  };

  const handleAddSection = () => {
    const newSection: Content = {
      block: 'Nova Seção',
      notes: ['%', '%', '%', '%'],
      score: '',
    };
    const updatedContent = [...song.content, newSection];
    setSong((prevState) => ({ ...prevState, content: updatedContent }));
  };

  const handleAddNote = (noteKey: number) => {
    // preciso adicionar uma nova nota vazia após a notaKey
    const updatedContent = song.content.map((section: Content) => ({
      ...section,
      notes: section.notes?.flatMap((note, key) => (key === noteKey ? [note, ''] : [note])),
    }));
    setSong((prevState) => ({ ...prevState, content: updatedContent }));
  };

  const handleSaveButton = async () => {
    // remover de songs tudo o que for string vazia
    const cleanedContent = song.content.map((section: Content) => ({
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
    setEditMode(false);
  };

  const handleClickSong = (songId: string) => {
    window.location.href = `/songs/${songId}?setlist=${setlist}`;
    setModalSongsOpen(false);
  };

  return (
    <>
      {!song && <h1>Loading</h1>}
      {song && (
        <S.Container>
          <S.Header>
            <S.FlexRow>
              <S.FlexColumn>
                <S.Title onDoubleClick={() => goFullscreen()}>{song.name}</S.Title>
                <S.Author>{song.author}</S.Author>
                <S.PureFlexRow>
                  {!editMode && (
                    <S.MiniSimpleButton onClick={handleToggleSheetMusicMode} $active={sheetMusicMode}>
                      Partitura
                    </S.MiniSimpleButton>
                  )}
                  {!editMode && <S.MiniSimpleButton onClick={handleEditButton}>Editar</S.MiniSimpleButton>}
                  {editMode && <S.MiniSimpleButton onClick={handleEditButton}>Cancelar</S.MiniSimpleButton>}
                  {!editMode && (
                    <S.MiniSimpleButton onClick={toggleSplit} $active={isSplitted}>
                      Split
                    </S.MiniSimpleButton>
                  )}
                  {editMode && (
                    <>
                      <S.MiniSimpleButton $backgroundColor="#008000" onClick={handleAddSection}>
                        + Seção
                      </S.MiniSimpleButton>
                      <S.MiniSimpleButton $backgroundColor="#D0342c" onClick={handleSaveButton}>
                        Salvar
                      </S.MiniSimpleButton>
                    </>
                  )}
                </S.PureFlexRow>
              </S.FlexColumn>
              {/* <S.CellHeader>
                <S.CellValue $size="1.2rem">{song.duration}</S.CellValue>
                <S.CellLabel>DURATION</S.CellLabel>
              </S.CellHeader> */}
            </S.FlexRow>

            <S.FlexRow>
              <S.CellHeader onClick={() => setActiveBpm(!activeBpm)}>
                <S.BlinkingDiv bpm={parseInt(song.bpm || '0')} $active={activeBpm}>
                  {song.bpm}
                </S.BlinkingDiv>
                <S.CellValue $size="1.2rem" hidden={activeBpm}>
                  {song.bpm}
                </S.CellValue>
                <S.CellLabel>BPM</S.CellLabel>
              </S.CellHeader>
              <S.CellHeader>
                <S.CellValue $size="1.2rem">
                  {editMode && <S.CellInput type="text" value={song.key} onChange={(e) => handleUpdateKey(e)} />}
                  {!editMode && (key || song.key)}
                </S.CellValue>
                <S.CellLabel>
                  <MinusCircle size={22} onClick={() => decreaseTone(song.content)} />
                  KEY
                  <PlusCircle size={22} onClick={() => increaseTone(song.content)} />
                </S.CellLabel>
              </S.CellHeader>
              <S.CellHeader>
                <S.CellValue $size="1.2rem">{song.rhythm}</S.CellValue>
                <S.CellLabel>RHYTHM</S.CellLabel>
              </S.CellHeader>
              {/* <S.Cell>
                <S.CellValue $size="1.2rem" $variant="purple">
                  {song.versions[0].name}
                </S.CellValue>
                <S.CellLabel>VERSION</S.CellLabel>
              </S.Cell> */}
            </S.FlexRow>
          </S.Header>

          {chordsMusicMode && (
            <S.Content className={isSplitted ? 'splitted' : ''}>
              {song.content &&
                song.content.map((songSection: Content, keyContent) => (
                  <S.Section className={isSplitted ? 'splitted' : ''} key={`content-${keyContent}`}>
                    {editMode ? (
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
                        <S.CellInput
                          type="text"
                          value={songSection.obs || ''}
                          onChange={(e) => handleUpdateSectionObs(e, keyContent)}
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
                    ) : (
                      <>
                        <S.SectionTitle
                          $isBold={isStringBetweenAsterisks(songSection.block)}
                          $isUnderline={isStringBetweenUnderscores(songSection.block)}
                        >
                          {removeAsterisksAndUnderscores(songSection.block)}
                        </S.SectionTitle>
                        <S.SectionObs>{songSection.obs || ''}</S.SectionObs>
                      </>
                    )}
                    <S.Grid>
                      {songSection.score ? (
                        <S.FullGridItem hidden={!sheetMusicMode}>
                          <SheetMusicPage sheet={songSection.score} />
                        </S.FullGridItem>
                      ) : null}
                      {!songSection.score &&
                        songSection.notes.map((note: string, noteKey) => (
                          <S.Cell key={`${noteKey}`}>
                            {editMode && (
                              <S.CellInputValue>
                                <S.CellInput
                                  type="text"
                                  value={typeof note === 'string' ? note : `${note[0]} ${note[1]}`}
                                  onChange={(e) => handleUpdateNote(e, noteKey, keyContent)}
                                  onDoubleClick={() => handleAddNote(noteKey)}
                                />
                              </S.CellInputValue>
                            )}
                            {!editMode && (
                              <S.CellValue>{typeof note === 'string' ? note : `${note[0]} ${note[1]}`}</S.CellValue>
                            )}
                          </S.Cell>
                        ))}
                    </S.Grid>
                  </S.Section>
                ))}
            </S.Content>
          )}

          {sheetMusicMode && song && <SheetMusicPage song={song} />}

          <S.FlexRow>
            <ButtonComponent $variant="secondary" onClick={handleSetlistButton}>
              Setlist
            </ButtonComponent>
            <ButtonComponent $variant="primary" onClick={() => handlePreviousSongButton(song.id)}>
              Anterior
            </ButtonComponent>
            <ButtonComponent $variant="primary" onClick={() => handleNextSongButton(song.id)}>
              Próxima
            </ButtonComponent>
            <ButtonComponent $variant="danger" onClick={handleHomeButton}>
              Sair
            </ButtonComponent>
          </S.FlexRow>
        </S.Container>
      )}

      <S.RightSideActions>
        <S.UserNavigation>
          <FullscreenButtonComponent />
          <S.Button onClick={() => setModalSongsOpen(true)}>
            <Search />
          </S.Button>
        </S.UserNavigation>
        {/* <Search onClick={() => setModalSongsOpen(true)} /> */}
      </S.RightSideActions>

      <ModalSongsListComponent
        loadAllSongsRequest={loadAllSongsRequest}
        modalSongsOpen={modalSongsOpen}
        setModalSongsOpen={setModalSongsOpen}
        handleClickSong={handleClickSong}
      />
    </>
  );
};
