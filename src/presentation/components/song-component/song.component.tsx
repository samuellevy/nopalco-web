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
  MessageSquare,
  Check,
  X,
  Trash2,
  Upload,
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
import { SongConversation } from '@/presentation/components/song-conversation/song-conversation.component';
import { getAccessToken, useSession } from '@/main/config/session';
import { UserMenu } from '@/presentation/components/user-menu/user-menu.component';
import { SetlistObservations } from '@/presentation/components/setlist-observations/setlist-observations.component';
import { ObservationsRichText } from '@/presentation/components/setlist-observations/observations-rich-text.component';

interface Content {
  block: string;
  notes: (string | [string, string])[];
  score?: string;
  obs?: string;
  scoreFile?: File;
  scoreUpload?: boolean;
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
  lyricsMode?: boolean;
  onLyricsModeChange?: (active: boolean) => void;
  editMode?: boolean;
  onEditModeChange?: (active: boolean) => void;
  conversationGroupId?: string | null;
  conversationGroupName?: string;
  observationsMode?: boolean;
  onObservationsModeChange?: (active: boolean) => void;
  observations?: string;
  onSaveObservations?: (value: string) => Promise<void>;
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
  lyricsMode: controlledLyricsMode,
  onLyricsModeChange,
  editMode: controlledEditMode,
  onEditModeChange,
  conversationGroupId,
  conversationGroupName,
  observationsMode = false,
  onObservationsModeChange,
  observations,
  onSaveObservations,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSession();
  const { setlistId } = useParams<{ setlistId: string }>();
  const [searchParams] = useSearchParams();
  const setlist = searchParams.get('setlist') || setlistId;
  const key = dataKey || null;
  const [activeBpm, setActiveBpm] = React.useState(false);
  const [localEditMode, setLocalEditMode] = React.useState(false);
  const [sheetMusicMode, setSheetMusicMode] = React.useState(true);
  const [localLyricsMode, setLocalLyricsMode] = React.useState(false);
  const [conversationMode, setConversationMode] = React.useState(false);
  const [chordsMusicMode] = React.useState(true);
  const [modalSongsOpen, setModalSongsOpen] = React.useState(false);
  const [modalSetlistOpen, setModalSetlistOpen] = React.useState(false);
  const [modalSingersOpen, setModalSingersOpen] = React.useState(false);
  const [isSplitted, setIsSplitted] = React.useState(false);
  const [song, setSong] = React.useState<Song>(null as unknown as Song);
  const [saving, setSaving] = React.useState(false);
  const editSnapshot = React.useRef<Song | null>(null);
  const editMode = controlledEditMode ?? localEditMode;
  const lyricsMode = controlledLyricsMode ?? localLyricsMode;

  const setEditMode = (value: React.SetStateAction<boolean>) => {
    const active = typeof value === 'function' ? value(editMode) : value;
    setLocalEditMode(active);
    onEditModeChange?.(active);
  };

  const setLyricsMode = (value: React.SetStateAction<boolean>) => {
    const active = typeof value === 'function' ? value(lyricsMode) : value;
    setLocalLyricsMode(active);
    onLyricsModeChange?.(active);
  };

  React.useEffect(() => {
    if (controlledLyricsMode) setConversationMode(false);
  }, [controlledLyricsMode]);

  React.useEffect(() => {
    if (observationsMode) setConversationMode(false);
  }, [observationsMode]);

  React.useEffect(() => {
    if (!isAuthenticated) {
      setEditMode(false);
      setModalSingersOpen(false);
    }
  }, [isAuthenticated]);

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
    if (!getAccessToken()) {
      navigate('/login', { state: { from: window.location.pathname + window.location.search } });
      return false;
    }
    const { content, ...rest } = tempSong;

    if (!song?.id) {
      console.error('Cannot update song: song ID is missing');
      return false;
    }

    try {
      const updatedSong = await updateSongRequest.execute(song.id, {
        ...rest,
        singers: undefined,
        content: JSON.stringify(content),
      });
      console.log('Song updated successfully:', updatedSong);
      return true;
    } catch (error) {
      console.error('Error updating song:', error);
      alert('Failed to update song. Please try again.');
      return false;
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
    if (saving) return;
    if (!getAccessToken()) {
      navigate('/login', { state: { from: window.location.pathname + window.location.search } });
      return;
    }
    setConversationMode(false);
    if (editMode) {
      if (editSnapshot.current) setSong(editSnapshot.current);
      editSnapshot.current = null;
      setEditMode(false);
    } else {
      editSnapshot.current = song;
      setEditMode(true);
    }
    // console.log(song.content);
  };

  const toggleSplit = () => {
    setIsSplitted((prevState) => !prevState);
  };

  const handleToggleSheetMusicMode = () => {
    onObservationsModeChange?.(false);
    setSheetMusicMode((prevState) => !prevState);
    // console.log(song.content);
  };

  const handleToggleLyricsMode = () => {
    onObservationsModeChange?.(false);
    setConversationMode(false);
    setLyricsMode((prevState) => !prevState);
    // console.log(song.content);
  };

  const handleUpdateNote = (e: React.ChangeEvent<HTMLInputElement>, noteKey: number, sectionKeyChanged: number) => {
    if (!song?.content || saving) return;
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

  const handleUpdateMetadata = (field: 'name' | 'author' | 'bpm' | 'key' | 'rhythm' | 'lyrics', value: string) => {
    if (saving) return;
    setSong((prevState) => ({ ...prevState, [field]: value }));
  };

  const handleUpdateSectionTitle = (e: React.ChangeEvent<HTMLInputElement>, sectionIndex: number) => {
    if (!song?.content || saving) return;
    const { value } = e.target;
    const updatedContent = song.content.map((section: Content, index: number) =>
      index === sectionIndex ? { ...section, block: value } : section,
    );
    setSong((prevState) => ({ ...prevState, content: updatedContent }));
  };

  const handleUpdateSectionObs = (e: React.ChangeEvent<HTMLInputElement>, sectionIndex: number) => {
    if (!song?.content || saving) return;
    const { value } = e.target;
    const updatedContent = song.content.map((section: Content, index: number) =>
      index === sectionIndex ? { ...section, obs: value } : section,
    );
    setSong((prevState) => ({ ...prevState, content: updatedContent }));
  };

  const handleRemoveSection = (sectionIndex: number) => {
    if (!song?.content || saving) return;
    const updatedContent = song.content.filter((_, index: number) => index !== sectionIndex);
    setSong((prevState) => ({ ...prevState, content: updatedContent }));
  };

  const handleAddSection = () => {
    if (!song?.content || saving) return;
    const newSection: Content = {
      block: 'Nova Seção',
      notes: ['%', '%', '%', '%'],
      score: '',
    };
    const updatedContent = [...song.content, newSection];
    setSong((prevState) => ({ ...prevState, content: updatedContent }));
  };

  const handleAddScore = (sectionIndex: number) => {
    if (!song?.content || saving) return;
    const newSection: Content = { block: 'Nova partitura', notes: [], scoreUpload: true };
    setSong((previous) => ({
      ...previous,
      content: [
        ...previous.content!.slice(0, sectionIndex + 1),
        newSection,
        ...previous.content!.slice(sectionIndex + 1),
      ],
    }));
  };

  const handleScoreFile = (file: File | undefined, sectionIndex: number) => {
    if (!file || saving) return;
    setSong((previous) => ({
      ...previous,
      content: previous.content?.map((section, index) =>
        index === sectionIndex ? { ...section, scoreFile: file } : section,
      ),
    }));
  };

  const handleAddNote = (noteKey: number) => {
    if (!song?.content || saving) return;
    // preciso adicionar uma nova nota vazia após a notaKey
    const updatedContent = song.content.map((section: Content) => ({
      ...section,
      notes: section.notes?.flatMap((note, key) => (key === noteKey ? [note, ''] : [note])),
    }));
    setSong((prevState) => ({ ...prevState, content: updatedContent }));
  };

  const handleSaveButton = async () => {
    if (!song || saving) return;
    const sections = (song.content || []) as Content[];
    if (sections.some((section) => section.scoreUpload && !section.scoreFile && !section.score)) {
      alert('Selecione um arquivo para cada partitura.');
      return;
    }
    const token = getAccessToken();
    if (!token) {
      navigate('/login', { state: { from: window.location.pathname + window.location.search } });
      return;
    }
    setSaving(true);
    try {
      const uploadedContent = [...sections];
      for (let index = 0; index < uploadedContent.length; index++) {
        const section = uploadedContent[index];
        if (!section.scoreFile) continue;
        const form = new FormData();
        form.append('file', section.scoreFile);
        const response = await fetch(`${window.env.API}/songs/scores`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
        if (!response.ok) throw new Error('Falha ao enviar partitura.');
        const result = await response.json();
        if (typeof result.filename !== 'string' || !result.filename) throw new Error('Resposta de upload inválida.');
        const { scoreFile, scoreUpload, ...rest } = section;
        uploadedContent[index] = { ...rest, score: result.filename };
        setSong((previous) => ({
          ...previous,
          content: previous.content?.map((item, itemIndex) => (itemIndex === index ? uploadedContent[index] : item)),
        }));
      }
      const cleanedContent = uploadedContent.map(({ scoreFile, scoreUpload, ...section }: Content) => ({
        ...section,
        notes:
          section.score && section.notes?.length === 0
            ? undefined
            : section.notes?.filter((note) => {
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
      if (await updateSong(tempSong)) {
        editSnapshot.current = null;
        setEditMode(false);
      }
    } catch (error) {
      console.error('Error uploading score:', error);
      alert('Não foi possível enviar a partitura. Tente novamente.');
    } finally {
      setSaving(false);
    }
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
                  {editMode && !observationsMode ? (
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
                  {editMode && !observationsMode ? (
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
                  {!editMode && isAuthenticated && (
                    <S.ToolbarButton onClick={handleEditButton} aria-label="Editar" title="Editar">
                      <Edit2 size={15} aria-hidden="true" /> <span>Editar</span>
                    </S.ToolbarButton>
                  )}
                  {editMode && !observationsMode && (
                    <S.EditAction $variant="cancel" type="button" onClick={handleEditButton} disabled={saving}>
                      <X size={16} aria-hidden="true" /> Cancelar
                    </S.EditAction>
                  )}
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
                  {!editMode && isAuthenticated && (
                    <S.ToolbarButton onClick={() => setModalSingersOpen(true)} aria-label="Cantores" title="Cantores">
                      <Users size={15} aria-hidden="true" /> <span>Cantores</span>
                    </S.ToolbarButton>
                  )}
                  {!editMode && (
                    <S.ToolbarButton
                      onClick={() => {
                        onObservationsModeChange?.(false);
                        setConversationMode((current) => !current);
                      }}
                      $active={conversationMode}
                      aria-label="Orientações"
                      aria-pressed={conversationMode}
                      title="Orientações"
                    >
                      <MessageSquare size={15} aria-hidden="true" /> <span>Orientações</span>
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
                  {editMode && !observationsMode && (
                    <>
                      {!lyricsMode && (
                        <>
                          <S.EditAction $variant="add" type="button" onClick={handleAddSection} disabled={saving}>
                            <PlusCircle size={16} aria-hidden="true" /> Seção
                          </S.EditAction>
                          <S.EditAction
                            $variant="add"
                            type="button"
                            onClick={() => handleAddScore(-1)}
                            disabled={saving}
                          >
                            <Upload size={16} aria-hidden="true" /> Partitura no início
                          </S.EditAction>
                        </>
                      )}
                      <S.EditAction $variant="save" type="button" onClick={handleSaveButton} disabled={saving}>
                        <Check size={16} aria-hidden="true" /> {saving ? 'Salvando...' : 'Salvar'}
                      </S.EditAction>
                    </>
                  )}
                </S.PureFlexRow>
              </S.FlexColumn>
              {/* <S.CellHeader>
                <S.CellValue $size="1.2rem">{song.duration}</S.CellValue>
                <S.CellLabel>DURATION</S.CellLabel>
              </S.CellHeader> */}
            </S.FlexRow>

            {!observationsMode && !conversationMode && (!lyricsMode || editMode) && (
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
                      onClick={() => !saving && song.content && decreaseTone(song.content, song.key)}
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
                      onClick={() => !saving && song.content && increaseTone(song.content, false, song.key)}
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

          {!observationsMode && !conversationMode && !lyricsMode && chordsMusicMode && (
            <S.Content className={isSplitted ? 'splitted' : ''}>
              {song.content &&
                song.content.map((songSection: Content, keyContent) => (
                  <S.Section className={isSplitted ? 'splitted' : ''} key={`content-${keyContent}`}>
                    {editMode ? (
                      <S.SectionEditor>
                        <S.CellInput
                          type="text"
                          aria-label={`Título do bloco ${keyContent + 1}`}
                          value={songSection.block}
                          onChange={(e) => handleUpdateSectionTitle(e, keyContent)}
                        />
                        <S.CellInput
                          type="text"
                          aria-label={`Observação do bloco ${keyContent + 1}`}
                          value={songSection.obs || ''}
                          onChange={(e) => handleUpdateSectionObs(e, keyContent)}
                        />
                        <S.EditAction
                          $variant="remove"
                          type="button"
                          onClick={() => handleRemoveSection(keyContent)}
                          disabled={saving}
                        >
                          <Trash2 size={16} aria-hidden="true" /> Remover
                        </S.EditAction>
                        <S.EditAction
                          $variant="add"
                          type="button"
                          onClick={() => handleAddScore(keyContent)}
                          disabled={saving}
                        >
                          <Upload size={16} aria-hidden="true" /> Partitura depois
                        </S.EditAction>
                        {(songSection.score || songSection.scoreUpload) && (
                          <S.ScoreInputLabel>
                            Arquivo da partitura {keyContent + 1}
                            <input
                              type="file"
                              accept=".xml,.musicxml,.mxl"
                              aria-label={`Arquivo da partitura ${keyContent + 1}`}
                              disabled={saving}
                              onChange={(event) => handleScoreFile(event.target.files?.[0], keyContent)}
                            />
                            {songSection.scoreFile?.name || songSection.score || ''}
                          </S.ScoreInputLabel>
                        )}
                      </S.SectionEditor>
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

          {!observationsMode && !conversationMode && !lyricsMode && sheetMusicMode && song && (
            <SheetMusicPage song={song} />
          )}
          {!observationsMode && !conversationMode && lyricsMode && song && (
            <S.LyricsEditor>
              <ObservationsRichText
                key={editMode ? 'lyrics-edit' : 'lyrics-view'}
                content={song.lyrics || ''}
                editable={editMode}
                ariaLabel="Letra da música"
                toolbarLabel="Formatação da letra"
                onChange={(value) => handleUpdateMetadata('lyrics', value)}
              />
            </S.LyricsEditor>
          )}
          {observationsMode && onSaveObservations && (
            <SetlistObservations
              observations={observations}
              onSave={onSaveObservations}
              editing={editMode}
              onEditingChange={setEditMode}
              showEditButton={false}
            />
          )}
          {!observationsMode && conversationMode && song?.id && (
            <SongConversation
              key={`${song.id}:${conversationGroupId || ''}`}
              songId={song.id}
              groupId={conversationGroupId}
              groupName={conversationGroupName}
            />
          )}

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

      {modalSingersOpen && isAuthenticated && song?.id && (
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
          <UserMenu inline />
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
