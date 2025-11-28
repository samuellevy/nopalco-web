/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { PlusCircle, MinusCircle, Search, File } from 'lucide-react';

import * as S from './song.styles';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { LoadSongRequest } from '@/domain/usecases/songs/load-song-request';
import { Song } from '@/domain/models';
import { LoadAllSongsRequest } from '@/domain/usecases';
import { LoadSetlistRequest } from '@/domain/usecases/setlists/load-setlist-request';
import { SetlistItem } from '@/domain/models/setlist';
import { UpdateSongRequest } from '@/domain/usecases/songs/update-song-request';
import SheetMusicPage from '../../sheet-music/sheet-music.page';
import { ModalSongsListComponent } from '@/presentation/components/modal-song-list/modal-song-list.component';

interface Content {
  block: string;
  notes: (string | [string, string])[];
  score: string;
}

type Props = {
  loadSongRequest: LoadSongRequest;
  loadAllSongsRequest: LoadAllSongsRequest;
  loadSetlistRequest: LoadSetlistRequest;
  updateSongRequest: UpdateSongRequest;
};

export const SongPage: React.FC<Props> = ({
  loadSongRequest,
  loadSetlistRequest,
  updateSongRequest,
  loadAllSongsRequest,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setlist = searchParams.get('setlist');
  const key = searchParams.get('key') || null;
  const { songId } = useParams<{ songId: string }>();
  const [loadingData, setLoadingData] = React.useState(true);
  const [song, setSong] = React.useState<Song>(null);
  const [activeBpm, setActiveBpm] = React.useState(false);
  // const [_, setSongList] = React.useState<Song[]>([]);
  const [setlistSongList, setSetlistSongList] = React.useState<SetlistItem[]>([]);
  const [editMode, setEditMode] = React.useState(false);
  const [sheetMusicMode, setSheetMusicMode] = React.useState(true);
  const [chordsMusicMode] = React.useState(true);
  const [modalSongsOpen, setModalSongsOpen] = React.useState(false);
  const [, setModalSetlistOpen] = React.useState(false);
  const [isSplitted, setIsSplitted] = React.useState(false);

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
    // Regex para identificar acordes menores
    // Exemplos que correspondem: Am, C#m, Dbm, Em7, Fm9
    // Exemplos que não correspondem: A, C#, Db, E7, F9
    const minorChordRegex = /^[A-G][#b]?m/;
    return minorChordRegex.test(chord);
  }

  // const fetchLoadAllSongsRequest = React.useCallback(async () => {
  //   setLoadingData(true);
  //   try {
  //     const loadAllSongsRequestResult = await loadAllSongsRequest.execute();
  //     setSongList(loadAllSongsRequestResult.songs);
  //     setLoadingData(false);
  //   } catch (error) {
  //     throw new Error(error as undefined);
  //   }
  // }, [loadAllSongsRequest]);

  const fetchLoadSetlistsRequest = React.useCallback(
    async (setlistId: string) => {
      setLoadingData(true);
      if (setlist) {
        try {
          const loadSetlistsRequestResult = await loadSetlistRequest.execute(setlistId);
          console.log(loadSetlistsRequestResult);
          setSetlistSongList(loadSetlistsRequestResult.items);
          setLoadingData(false);
        } catch (error) {
          throw new Error(error as undefined);
        }
      }
    },
    [loadSetlistRequest, setlist],
  );

  function getRelativeMajor(minorChord: string): string {
    const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const FLAT_TO_SHARP_MAP: { [key: string]: string } = {
      Db: 'C#',
      Eb: 'D#',
      Gb: 'F#',
      Ab: 'G#',
      Bb: 'A#',
    };

    // Extrai a nota base e os modificadores
    const regex = /^([A-G][#b]?)(.*)$/;
    const match = minorChord.match(regex);

    if (!match) return minorChord; // Se não for um acorde válido, retorna o original

    let baseNote = match[1];
    const modifiers = match[2];

    // Converte bemol para sustenido equivalente
    if (baseNote in FLAT_TO_SHARP_MAP) {
      baseNote = FLAT_TO_SHARP_MAP[baseNote];
    }

    const noteIndex = NOTES.indexOf(baseNote);
    if (noteIndex === -1) return minorChord; // Se não for uma nota válida, retorna o original

    // Calcula o relativo maior (3 semitons acima)
    const majorIndex = (noteIndex + 3) % NOTES.length;
    const majorNote = NOTES[majorIndex];

    // Remove o 'm' do acorde menor e mantém os outros modificadores
    const newModifiers = modifiers.replace('m', '');

    return majorNote + newModifiers;
  }

  const fetchLoadSongRequest = React.useCallback(async () => {
    setLoadingData(true);
    try {
      const loadSongRequestResult = await loadSongRequest.execute(songId);
      // Se houver uma key na URL, transpor antes de setar o estado
      if (key) {
        const finalNewKey = isMinorChord(key) ? getRelativeMajor(key) : key;
        const transposedContent = transposeContent(
          loadSongRequestResult.content,
          isMinorChord(loadSongRequestResult.key)
            ? getRelativeMajor(loadSongRequestResult.key)
            : loadSongRequestResult.key,
          finalNewKey,
        );
        setSong({ ...loadSongRequestResult, content: transposedContent });
      } else {
        setSong(loadSongRequestResult);
      }
      setLoadingData(false);
    } catch (error) {
      throw new Error(error as undefined);
    }
  }, [loadSongRequest, key, songId]);

  const updateSong = async (tempSong: Song) => {
    const { content, ...rest } = tempSong;

    try {
      const updatedSong = await updateSongRequest.execute(songId, {
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
    if (!loadingData) return;

    fetchLoadSongRequest();
    if (setlist) {
      fetchLoadSetlistsRequest(setlist);
    }
  }, [fetchLoadSongRequest, loadingData, song, setlist]);

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

    function transposeNotesBlock(notesBlock: string): string {
      // console.log(notesBlock, `notesBlock`);
      return notesBlock.split(' ').map(transposeNote).join(' ');
    }

    const newContent = content.map((block) => ({
      ...block,
      notes: block.notes.map(transposeNotesBlock),
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

    function transposeNotesBlock(notesBlock: string): string {
      console.log(notesBlock, `notesBlock`);
      if (Array.isArray(notesBlock)) {
        return notesBlock.map(transposeNote).join(' ');
      }
      return typeof notesBlock === 'string' && notesBlock.split(' ').map(transposeNote).join(' ');
    }

    const newContent = content.map((block) => ({
      ...block,
      notes: block.notes.map(transposeNotesBlock),
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

  const handleSetlistButton = () => {
    navigate(`/setlists/${setlist}?position=${songId}`);
  };

  const getNextItem = (actualSongId: string) => {
    console.log(actualSongId, `nextSongId`);
    if (setlistSongList) {
      const actualSongIndex = setlistSongList.findIndex((item) =>
        item.song && item.song.id === actualSongId ? item : null,
      );
      if (actualSongIndex !== -1 && actualSongIndex < setlistSongList.length - 1) {
        return setlistSongList[actualSongIndex + 1];
      }
      return null;
      // setlistSongList.map(item => {
      //   console.log(item.song.id);
      // })
    }
    // console.log(setlistSongList);
    // const index = setlistSongList.findIndex((item) => item.song.id === id);
    // if (index !== -1 && index < setlistSongList.length - 1) {
    //   return setlistSongList[index + 1];
    // }
    // return null; // Retorna null se não encontrar ou se for o último item
    return null;
  };

  const getPreviousItem = (actualSongId: string) => {
    if (setlistSongList) {
      const actualSongIndex = setlistSongList.findIndex((item) =>
        item.song && item.song.id === actualSongId ? item : null,
      );
      if (actualSongIndex > 0) {
        return setlistSongList[actualSongIndex - 1];
      }
      return null;
      // setlistSongList.map(item => {
      //   console.log(item.song.id);
      // })
    }
    // console.log(setlistSongList);
    // const index = setlistSongList.findIndex((item) => item.song.id === id);
    // if (index !== -1 && index < setlistSongList.length - 1) {
    //   return setlistSongList[index + 1];
    // }
    // return null; // Retorna null se não encontrar ou se for o último item
    return null; // Retorna null se não houver anterior ou se não encontrar o id
  };

  const handleNextSongButton = (id: string) => {
    const nextSong = getNextItem(id);
    console.log(nextSong, `nextSong`);

    if (nextSong && nextSong.song) {
      window.location.href = `/songs/${nextSong.song.id}?setlist=${setlist}&key=${encodeURIComponent(nextSong.key)}`;
    } else {
      window.location.href = `/setlists/${setlist}?position=${songId}`;
    }
  };

  const handlePreviousSongButton = (id: string) => {
    const previousSong = getPreviousItem(id);
    console.log(previousSong);
    if (previousSong && previousSong.song) {
      window.location.href = `/songs/${previousSong.song.id}?setlist=${setlist}&key=${encodeURIComponent(
        previousSong.key,
      )}`;
    } else {
      window.location.href = `/setlists/${setlist}?position=${songId}`;
    }
  };

  const handleEditButton = () => {
    setEditMode((prevState) => !prevState);
    console.log(song.content);
  };

  const toggleSplit = () => {
    setIsSplitted((prevState) => !prevState);
  };

  const handleToggleSheetMusicMode = () => {
    setSheetMusicMode((prevState) => !prevState);
    console.log(song.content);
  };

  const handleUpdateNote = (e: React.ChangeEvent<HTMLInputElement>, noteKey: number, sectionKeyChanged: number) => {
    const { value } = e.target;
    const updatedContent = song.content.map((section: Content, sectionKey: number) => ({
      ...section,
      notes: section.notes.map((note, key) => {
        if (key === noteKey && sectionKey === sectionKeyChanged) {
          if (value.includes(' ')) {
            const parts = value.split(' ');
            // Ensure tuple of two strings, fill with empty string if missing
            return [parts[0] || '', parts[1] || ''] as [string, string];
          }
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

  const handleAddNote = (noteKey: number) => {
    // preciso adicionar uma nova nota vazia após a notaKey
    const updatedContent = song.content.map((section: Content) => ({
      ...section,
      notes: section.notes.flatMap((note, key) => (key === noteKey ? [note, ''] : [note])),
    }));
    setSong((prevState) => ({ ...prevState, content: updatedContent }));
  };

  const handleSaveButton = async () => {
    // remover de songs tudo o que for string vazia
    const cleanedContent = song.content.map((section: Content) => ({
      ...section,
      notes: section.notes.filter((note) => {
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
                    <S.MiniSimpleButton $backgroundColor="#D0342c" onClick={handleSaveButton}>
                      Salvar
                    </S.MiniSimpleButton>
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
                <S.BlinkingDiv bpm={parseInt(song.bpm)} $active={activeBpm}>
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
                    <S.SectionTitle
                      $isBold={isStringBetweenAsterisks(songSection.block)}
                      $isUnderline={isStringBetweenUnderscores(songSection.block)}
                    >
                      {removeAsterisksAndUnderscores(songSection.block)}
                    </S.SectionTitle>
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
            <S.SimpleButton onClick={handleSetlistButton}>Voltar</S.SimpleButton>
            <S.SimpleButton onClick={() => handlePreviousSongButton(song.id)}>Anterior</S.SimpleButton>
            <S.SimpleButton onClick={() => handleNextSongButton(song.id)}>Próxima</S.SimpleButton>
          </S.FlexRow>
        </S.Container>
      )}

      <S.RightSideActions>
        <File style={{ display: 'none' }} onClick={() => setModalSetlistOpen(true)} />
        <Search onClick={() => setModalSongsOpen(true)} />
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
