/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import {
  PlusCircle,
  MinusCircle,
  Search,
  Music4,
  Text,
  Home,
  ListMusic,
  RotateCcw,
  Edit2,
  Columns,
  Users,
} from 'lucide-react';

import * as S from './song.component.styles';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Song } from '@/domain/models';
import { LoadAllSongsRequest } from '@/domain/usecases';
import { LoadSetlistRequest } from '@/domain/usecases/setlists/load-setlist-request';
import { SetlistItem } from '@/domain/models/setlist';
import { UpdateSongRequest } from '@/domain/usecases/songs/update-song-request';
import { ModalSongsListComponent } from '@/presentation/components/modal-song-list/modal-song-list.component';
import FullscreenButtonComponent from '@/presentation/components/fullscreen-button/fullscreen-button.component';
import SheetMusicPage from '@/presentation/pages/sheet-music/sheet-music.page';
import { ButtonComponent } from '../button/button';
import { ModalSongSingers } from '@/presentation/components/modal-song-singers/modal-song-singers.component';

interface Content {
  block: string;
  notes: (string | [string, string])[];
  score?: string;
  obs?: string;
}

type Props = {
  data: Song;
  dataKey: string | null;
  loadAllSongsRequest: LoadAllSongsRequest;
  loadSetlistRequest: LoadSetlistRequest;
  updateSongRequest: UpdateSongRequest;
  setlistSongList?: SetlistItem[];
  handleSelectSetlistItem?: (item: SetlistItem) => void;
  handleSetlistButton: () => void;
  handleNextSongButton: () => void;
  handlePreviousSongButton: () => void;
  handlePreloadNextSongButton?: () => void;
  showPageNavigation?: boolean;
};

export const SongComponent: React.FC<Props> = ({
  data,
  dataKey,
  updateSongRequest,
  loadAllSongsRequest,
  setlistSongList,
  handleSelectSetlistItem,
  handleSetlistButton,
  handleNextSongButton,
  handlePreviousSongButton,
  handlePreloadNextSongButton,
  showPageNavigation = false,
}) => {
  const navigate = useNavigate();
  const { setlistId } = useParams<{ setlistId: string }>();
  const [searchParams] = useSearchParams();
  const setlist = searchParams.get('setlist') || setlistId;
  const key = dataKey || null;
  const [activeBpm, setActiveBpm] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);
  const [sheetMusicMode, setSheetMusicMode] = React.useState(true);
  const [lyricsMode, setLyricsMode] = React.useState(false);
  const [chordsMusicMode] = React.useState(true);
  const [modalSongsOpen, setModalSongsOpen] = React.useState(false);
  const [modalSetlistOpen, setModalSetlistOpen] = React.useState(false);
  const [modalSingersOpen, setModalSingersOpen] = React.useState(false);
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

    if (!song?.id) {
      console.error('Cannot update song: song ID is missing');
      return;
    }

    try {
      const updatedSong = await updateSongRequest.execute(song.id, {
        ...rest,
        singers: undefined,
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
      newContent = increaseTone(newContent, true, targetKey);
    }
    return newContent;
  };

  React.useEffect(() => {
    if (data && data.name) {
      document.title = `${data.name} - NoPalco`;
      // console.log(key, `key`);
      // console.log(data, `data`);

      const finalNewKey = key && isMinorChord(key) ? getRelativeMajor(key) : key;

      // Ensure content is parsed if it's a string
      const parsedContent = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;

      const transposedContent =
        key && parsedContent && data.key && finalNewKey
          ? transposeContent(parsedContent, isMinorChord(data.key) ? getRelativeMajor(data.key) : data.key, finalNewKey)
          : parsedContent;
      setSong({ ...data, key: key || data.key, content: transposedContent });
    }
  }, [data, key]);

  function increaseTone(content: any[], returnContent = false, targetKey?: string): any[] {
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

      return note
        .split('/')
        .map((chordPart) => {
          const regex = /^([A-G][#b]?)(.*)$/;
          const match = chordPart.match(regex);

          if (!match) return chordPart;

          let baseNote = match[1];
          const modifiers = match[2];

          if (baseNote in FLAT_TO_SHARP_MAP) {
            baseNote = FLAT_TO_SHARP_MAP[baseNote];
          }

          const noteIndex = NOTES.indexOf(baseNote);
          if (noteIndex === -1) return chordPart;

          const newIndex = (noteIndex + 1) % NOTES.length;
          const transposedNote = targetKey === 'F' && NOTES[newIndex] === 'A#' ? 'Bb' : NOTES[newIndex];

          return transposedNote + modifiers;
        })
        .join('/');
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
    setSong((prevState) => ({
      ...prevState,
      key: prevState.key ? transposeNote(prevState.key) : prevState.key,
      content: newContent,
    }));
    return [];
  }

  function decreaseTone(content: any[], targetKey?: string): void {
    const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const FLAT_TO_SHARP_MAP: { [key: string]: string } = {
      Db: 'C#',
      Eb: 'D#',
      Gb: 'F#',
      Ab: 'G#',
      Bb: 'A#',
    };

    function transposeNote(note: string): string {
      return note
        .split('/')
        .map((chordPart) => {
          const regex = /^([A-G][#b]?)(.*)$/;
          const match = chordPart.match(regex);

          if (!match) return chordPart;

          let baseNote = match[1];
          const modifiers = match[2];

          if (baseNote in FLAT_TO_SHARP_MAP) {
            baseNote = FLAT_TO_SHARP_MAP[baseNote];
          }

          const noteIndex = NOTES.indexOf(baseNote);
          if (noteIndex === -1) return chordPart;

          const newIndex = (noteIndex - 1 + NOTES.length) % NOTES.length;
          const transposedNote = targetKey === 'F' && NOTES[newIndex] === 'A#' ? 'Bb' : NOTES[newIndex];

          return transposedNote + modifiers;
        })
        .join('/');
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

    setSong((prevState) => ({
      ...prevState,
      key: prevState.key ? transposeNote(prevState.key) : prevState.key,
      content: newContent,
    }));
  }

  const handleResetKey = () => {
    const content = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
    setSong((prevState) => ({ ...prevState, key: data.key, content }));
  };

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

  const handleToggleLyricsMode = () => {
    setLyricsMode((prevState) => !prevState);
    // console.log(song.content);
  };

  const handleUpdateNote = (e: React.ChangeEvent<HTMLInputElement>, noteKey: number, sectionKeyChanged: number) => {
    if (!song?.content) return;
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

  const handleUpdateMetadata = (field: 'name' | 'author' | 'bpm' | 'key' | 'rhythm', value: string) => {
    setSong((prevState) => ({ ...prevState, [field]: value }));
  };

  const handleUpdateSectionTitle = (e: React.ChangeEvent<HTMLInputElement>, sectionIndex: number) => {
    if (!song?.content) return;
    const { value } = e.target;
    const updatedContent = song.content.map((section: Content, index: number) =>
      index === sectionIndex ? { ...section, block: value } : section,
    );
    setSong((prevState) => ({ ...prevState, content: updatedContent }));
  };

  const handleUpdateSectionObs = (e: React.ChangeEvent<HTMLInputElement>, sectionIndex: number) => {
    if (!song?.content) return;
    const { value } = e.target;
    const updatedContent = song.content.map((section: Content, index: number) =>
      index === sectionIndex ? { ...section, obs: value } : section,
    );
    setSong((prevState) => ({ ...prevState, content: updatedContent }));
  };

  const handleRemoveSection = (sectionIndex: number) => {
    if (!song?.content) return;
    const updatedContent = song.content.filter((_, index: number) => index !== sectionIndex);
    setSong((prevState) => ({ ...prevState, content: updatedContent }));
  };

  const handleAddSection = () => {
    if (!song?.content) return;
    const newSection: Content = {
      block: 'Nova Seção',
      notes: ['%', '%', '%', '%'],
      score: '',
    };
    const updatedContent = [...song.content, newSection];
    setSong((prevState) => ({ ...prevState, content: updatedContent }));
  };

  const handleAddNote = (noteKey: number) => {
    if (!song?.content) return;
    // preciso adicionar uma nova nota vazia após a notaKey
    const updatedContent = song.content.map((section: Content) => ({
      ...section,
      notes: section.notes?.flatMap((note, key) => (key === noteKey ? [note, ''] : [note])),
    }));
    setSong((prevState) => ({ ...prevState, content: updatedContent }));
  };

  const handleSaveButton = async () => {
    if (!song) return;
    // remover de songs tudo o que for string vazia
    const cleanedContent = (song.content || []).map((section: Content) => ({
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
    const params = new URLSearchParams();
    if (setlist) params.set('setlist', setlist);
    navigate(`/songs/${songId}${params.size ? `?${params.toString()}` : ''}`);
    setModalSongsOpen(false);
  };

  const handleClickSetlistItem = (itemId: string) => {
    const item = setlistSongList?.find((setlistItem) => setlistItem.id === itemId);
    if (!item || !setlist) return;
    setModalSetlistOpen(false);
    if (handleSelectSetlistItem) {
      handleSelectSetlistItem(item);
    } else {
      const params = new URLSearchParams({ setlistItem: item.id, key: item.key || '' });
      navigate(`/setlists/${setlist}?${params.toString()}`);
    }
  };

  return (
    <>
      {!song || !data ? (
        <div
          style={{
            width: '100%',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f1117',
            color: '#f8fafc',
            fontSize: '18px',
          }}
        >
          Carregando...
        </div>
      ) : (
        <S.Container>
          <S.Header>
            <S.FlexRow>
              <S.FlexColumn>
                <S.Title onDoubleClick={() => !editMode && goFullscreen()}>
                  {editMode ? (
                    <S.MetadataInput
                      aria-label="Título"
                      placeholder="Título"
                      value={song.name || ''}
                      onChange={(event) => handleUpdateMetadata('name', event.target.value)}
                    />
                  ) : (
                    song.name
                  )}
                </S.Title>
                <S.Author>
                  {editMode ? (
                    <S.MetadataInput
                      aria-label="Subtítulo"
                      placeholder="Subtítulo"
                      value={song.author || ''}
                      onChange={(event) => handleUpdateMetadata('author', event.target.value)}
                    />
                  ) : (
                    song.author
                  )}
                </S.Author>
                <S.PureFlexRow>
                  {!editMode && (
                    <S.ToolbarButton
                      onClick={handleToggleSheetMusicMode}
                      $active={sheetMusicMode}
                      aria-label="Partitura"
                      aria-pressed={sheetMusicMode}
                      title="Partitura"
                    >
                      <Music4 size={15} aria-hidden="true" /> <span>Partitura</span>
                    </S.ToolbarButton>
                  )}
                  {!editMode && (
                    <S.ToolbarButton
                      onClick={handleToggleLyricsMode}
                      $active={lyricsMode}
                      aria-label="Letra"
                      aria-pressed={lyricsMode}
                      title="Letra"
                    >
                      <Text size={15} aria-hidden="true" /> <span>Letra</span>
                    </S.ToolbarButton>
                  )}
                  {!editMode && (
                    <S.ToolbarButton onClick={handleEditButton} aria-label="Editar" title="Editar">
                      <Edit2 size={15} aria-hidden="true" /> <span>Editar</span>
                    </S.ToolbarButton>
                  )}
                  {editMode && <S.MiniSimpleButton onClick={handleEditButton}>Cancelar</S.MiniSimpleButton>}
                  {!editMode && (
                    <S.ToolbarButton
                      onClick={toggleSplit}
                      $active={isSplitted}
                      aria-label="Split"
                      aria-pressed={isSplitted}
                      title="Split"
                    >
                      <Columns size={15} aria-hidden="true" /> <span>Split</span>
                    </S.ToolbarButton>
                  )}
                  {!editMode && (
                    <S.ToolbarButton onClick={() => setModalSingersOpen(true)} aria-label="Cantores" title="Cantores">
                      <Users size={15} aria-hidden="true" /> <span>Cantores</span>
                    </S.ToolbarButton>
                  )}
                  {!editMode && data.key && (
                    <S.OriginalToneButton
                      title={`Voltar ao tom original: ${data.key}`}
                      aria-label={`Original: ${data.key}`}
                      onClick={handleResetKey}
                      disabled={song.key === data.key}
                    >
                      <RotateCcw size={15} aria-hidden="true" /> <span>Original:</span> {data.key}
                    </S.OriginalToneButton>
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

            {(!lyricsMode || editMode) && (
              <S.MetadataRow>
                <S.CellHeader onClick={() => !editMode && setActiveBpm(!activeBpm)}>
                  {!editMode && (
                    <S.BlinkingDiv bpm={parseInt(song.bpm || '0')} $active={activeBpm}>
                      {song.bpm}
                    </S.BlinkingDiv>
                  )}
                  <S.MetadataValue $field="bpm" hidden={!editMode && activeBpm}>
                    {editMode ? (
                      <S.MetadataInput
                        aria-label="BPM"
                        placeholder="BPM"
                        inputMode="numeric"
                        value={song.bpm || ''}
                        onChange={(event) => handleUpdateMetadata('bpm', event.target.value)}
                      />
                    ) : (
                      song.bpm
                    )}
                  </S.MetadataValue>
                </S.CellHeader>
                <S.CellHeader>
                  <S.CellLabel>
                    <S.MiniSimpleButton
                      aria-label="Diminuir tom"
                      title="Diminuir tom"
                      onClick={() => song.content && decreaseTone(song.content, song.key)}
                    >
                      <MinusCircle size={22} />
                    </S.MiniSimpleButton>
                    <S.KeyValue aria-label={editMode ? undefined : 'Tom atual'}>
                      {editMode ? (
                        <S.MetadataInput
                          aria-label="Tom"
                          placeholder="Tom"
                          value={song.key || ''}
                          onChange={(event) => handleUpdateMetadata('key', event.target.value)}
                        />
                      ) : (
                        song.key
                      )}
                    </S.KeyValue>
                    <S.MiniSimpleButton
                      aria-label="Aumentar tom"
                      title="Aumentar tom"
                      onClick={() => song.content && increaseTone(song.content, false, song.key)}
                    >
                      <PlusCircle size={22} />
                    </S.MiniSimpleButton>
                  </S.CellLabel>
                </S.CellHeader>
                <S.CellHeader>
                  <S.MetadataValue $field="rhythm">
                    {editMode ? (
                      <S.MetadataInput
                        aria-label="Ritmo"
                        placeholder="Ritmo"
                        value={song.rhythm || ''}
                        onChange={(event) => handleUpdateMetadata('rhythm', event.target.value)}
                      />
                    ) : (
                      song.rhythm
                    )}
                  </S.MetadataValue>
                </S.CellHeader>
                {/* <S.Cell>
                <S.CellValue $size="1.2rem" $variant="purple">
                  {song.versions[0].name}
                </S.CellValue>
                <S.CellLabel>VERSION</S.CellLabel>
              </S.Cell> */}
              </S.MetadataRow>
            )}
          </S.Header>

          {!lyricsMode && chordsMusicMode && (
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
                          <span>{removeAsterisksAndUnderscores(songSection.block)}</span>
                        </S.SectionTitle>
                        {songSection.obs && <S.SectionObs>{songSection.obs}</S.SectionObs>}
                      </>
                    )}
                    <S.Grid>
                      {songSection.score ? (
                        <S.FullGridItem hidden={!sheetMusicMode}>
                          <SheetMusicPage sheet={songSection.score} />
                        </S.FullGridItem>
                      ) : null}
                      {!songSection.score &&
                        songSection.notes?.map((note: string | [string, string], noteKey) => (
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
          {lyricsMode && song && <S.LyricsBox>{song.lyrics}</S.LyricsBox>}

          <S.FlexGap style={{ display: 'none' }}>
            <ButtonComponent $variant="purple" onClick={handleSetlistButton}>
              Setlist
            </ButtonComponent>
            <ButtonComponent $variant="purple" onClick={handlePreviousSongButton}>
              Anterior
            </ButtonComponent>
            <ButtonComponent $variant="purple" onClick={handleNextSongButton}>
              Próxima
            </ButtonComponent>
            {handlePreloadNextSongButton && (
              <ButtonComponent $variant="purple" onClick={handlePreloadNextSongButton}>
                + Carregar
              </ButtonComponent>
            )}
            <ButtonComponent $variant="purple" onClick={handleHomeButton}>
              Sair
            </ButtonComponent>
          </S.FlexGap>
        </S.Container>
      )}

      {showPageNavigation && (
        <S.BottomNavigation aria-label="Navegacao da musica">
          <S.NavigationButton type="button" onClick={handleHomeButton}>
            <Home size={22} aria-hidden="true" />
            <span>Home</span>
          </S.NavigationButton>
          {setlist && (
            <S.NavigationButton type="button" onClick={handleSetlistButton}>
              <ListMusic size={22} aria-hidden="true" />
              <span>Setlist</span>
            </S.NavigationButton>
          )}
        </S.BottomNavigation>
      )}

      {modalSingersOpen && song?.id && (
        <ModalSongSingers
          songId={song.id}
          singers={song.singers || []}
          originalKey={data.key}
          updateSongRequest={updateSongRequest}
          onSaved={(singers) => setSong((current) => ({ ...current, singers }))}
          onClose={() => setModalSingersOpen(false)}
        />
      )}

      <S.RightSideActions>
        <S.UserNavigation>
          <FullscreenButtonComponent />
          <S.Button aria-label="Buscar músicas" title="Buscar músicas" onClick={() => setModalSongsOpen(true)}>
            <Search />
          </S.Button>
          {setlist && setlistSongList && (
            <S.Button aria-label="Setlist atual" title="Setlist atual" onClick={() => setModalSetlistOpen(true)}>
              <ListMusic />
            </S.Button>
          )}
        </S.UserNavigation>
        {/* <Search onClick={() => setModalSongsOpen(true)} /> */}
      </S.RightSideActions>

      <ModalSongsListComponent
        loadAllSongsRequest={loadAllSongsRequest}
        modalSongsOpen={modalSongsOpen}
        setModalSongsOpen={setModalSongsOpen}
        handleClickSong={handleClickSong}
      />
      {modalSetlistOpen && setlistSongList && (
        <ModalSongsListComponent
          loadAllSongsRequest={loadAllSongsRequest}
          modalSongsOpen={modalSetlistOpen}
          setModalSongsOpen={setModalSetlistOpen}
          setlistItems={setlistSongList}
          handleClickSong={handleClickSetlistItem}
        />
      )}
    </>
  );
};
