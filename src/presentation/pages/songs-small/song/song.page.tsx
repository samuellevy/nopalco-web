/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { PlusCircle, MinusCircle } from 'lucide-react';

import * as S from './song.styles';
import { useNavigate, useParams } from 'react-router-dom';
import { LoadSongRequest } from '@/domain/usecases/songs/load-song-request';
import { Song } from '@/domain/models';
import { LoadAllSongsRequest } from '@/domain/usecases';

interface Content {
  block: string;
  notes: (string | [string, string])[];
}

type Props = {
  loadSongRequest: LoadSongRequest;
  loadAllSongsRequest: LoadAllSongsRequest;
};

export const SongSmallPage: React.FC<Props> = ({ loadSongRequest, loadAllSongsRequest }) => {
  const navigate = useNavigate();
  const { songId } = useParams<{ songId: string }>();
  const [loadingData, setLoadingData] = React.useState(true);
  const [song, setSong] = React.useState<Song>({} as Song);
  const [activeBpm, setActiveBpm] = React.useState(false);
  const [songList, setSongList] = React.useState<Song[]>([]);

  const fetchLoadAllSongsRequest = React.useCallback(async () => {
    setLoadingData(true);
    try {
      const loadAllSongsRequestResult = await loadAllSongsRequest.execute();
      setSongList(loadAllSongsRequestResult.songs);
      setLoadingData(false);
    } catch (error) {
      throw new Error(error as undefined);
    }
  }, [loadAllSongsRequest]);

  const fetchLoadSongRequest = React.useCallback(async () => {
    setLoadingData(true);
    try {
      const loadSongRequestResult = await loadSongRequest.execute(songId);
      console.log(loadSongRequestResult.content);
      setSong(loadSongRequestResult);
      setLoadingData(false);
      // console.log(loadSongRequestResult);
    } catch (error) {
      throw new Error(error as undefined);
    }
  }, [loadSongRequest]);

  React.useEffect(() => {
    if (!loadingData) return;

    fetchLoadAllSongsRequest();
    fetchLoadSongRequest();
  }, [fetchLoadSongRequest, fetchLoadAllSongsRequest, loadingData, song]);

  function increaseTone(content: any[]): void {
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
      return notesBlock.split(' ').map(transposeNote).join(' ');
    }

    const newContent = content.map((block) => ({
      ...block,
      notes: block.notes.map(transposeNotesBlock),
    }));

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
      return notesBlock.split(' ').map(transposeNote).join(' ');
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
    navigate('/songs-small');
  };

  const getNextItem = (id: string) => {
    const index = songList.findIndex((item) => item.id === id);
    if (index !== -1 && index < songList.length - 1) {
      return songList[index + 1];
    }
    return null; // Retorna null se não encontrar ou se for o último item
  };

  const getPreviousItem = (id: string) => {
    const index = songList.findIndex((item) => item.id === id);
    if (index > 0) {
      return songList[index - 1];
    }
    return null; // Retorna null se não houver anterior ou se não encontrar o id
  };

  const handleNextSongButton = (id: string) => {
    const nextSong = getNextItem(id);

    console.log(nextSong);
    if (nextSong) {
      window.location.href = `/songs-small/${nextSong.id}`;
    }
  };
  const handlePreviousSongButton = (id: string) => {
    const previousSong = getPreviousItem(id);
    console.log(previousSong);
    if (previousSong) {
      window.location.href = `/songs-small/${previousSong.id}`;
    }
  };

  return (
    <>
      {!song && <h1>Loading</h1>}
      {song && (
        <S.Container>
          <S.Header>
            <S.FlexRow>
              <S.FlexColumn>
                <S.Title>{song.name}</S.Title>
                <S.Author>{song.author}</S.Author>
              </S.FlexColumn>
              <S.FlexRow>
                <S.Cell>
                  <S.CellValue $size="1.2rem">{song.key}</S.CellValue>
                  <S.CellLabel>
                    <MinusCircle size={22} onClick={() => decreaseTone(song.content)} />
                    KEY
                    <PlusCircle size={22} onClick={() => increaseTone(song.content)} />
                  </S.CellLabel>
                </S.Cell>

                <S.Cell onClick={() => setActiveBpm(!activeBpm)}>
                  <S.BlinkingDiv bpm={parseInt(song.bpm)} active={activeBpm}>
                    {song.bpm}
                  </S.BlinkingDiv>
                  <S.CellValue $size="1.2rem" hidden={activeBpm}>
                    {song.bpm}
                  </S.CellValue>
                  <S.CellLabel>BPM</S.CellLabel>
                </S.Cell>
              </S.FlexRow>
            </S.FlexRow>
          </S.Header>

          <S.Content>
            {song.content &&
              song.content.map((songSection: Content, keyContent) => (
                <S.Section key={`content-${keyContent}`}>
                  <S.SectionTitle
                    $isBold={isStringBetweenAsterisks(songSection.block)}
                    $isUnderline={isStringBetweenUnderscores(songSection.block)}
                  >
                    {removeAsterisksAndUnderscores(songSection.block)}
                  </S.SectionTitle>
                  <S.Grid>
                    {songSection.notes.map((note: string, key) => (
                      <S.CellSmall key={key}>
                        <S.CellValueSmall>{typeof note === 'string' ? note : `${note[0]} ${note[1]}`}</S.CellValueSmall>
                      </S.CellSmall>
                    ))}
                  </S.Grid>
                </S.Section>
              ))}
          </S.Content>

          <S.FlexRow>
            <S.SimpleButton onClick={handleSetlistButton}>Voltar</S.SimpleButton>
            <S.SimpleButton onClick={() => handlePreviousSongButton(song.id)}>Anterior</S.SimpleButton>
            <S.SimpleButton onClick={() => handleNextSongButton(song.id)}>Próxima</S.SimpleButton>
          </S.FlexRow>
        </S.Container>
      )}
    </>
  );
};
