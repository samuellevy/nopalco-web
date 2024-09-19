/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { PlusCircle, MinusCircle } from 'lucide-react';

import * as S from './song.styles';
import { useNavigate, useParams } from 'react-router-dom';
import { LoadSongRequest } from '@/domain/usecases/songs/load-song-request';
import { Song } from '@/domain/models';

interface Content {
  block: string;
  notes: (string | [string, string])[];
}

type Props = {
  loadSongRequest: LoadSongRequest;
};

export const SongPage: React.FC<Props> = ({ loadSongRequest }) => {
  const navigate = useNavigate();
  const { songId } = useParams<{ songId: string }>();
  const [loadingData, setLoadingData] = React.useState(true);
  const [song, setSong] = React.useState<Song>({} as Song);
  const [activeBpm, setActiveBpm] = React.useState(false);

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

    fetchLoadSongRequest();
  }, [fetchLoadSongRequest, loadingData, song]);

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
    navigate('/songs');
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
              <S.Cell>
                <S.CellValue $size="1.2rem">{song.duration}</S.CellValue>
                <S.CellLabel>DURATION</S.CellLabel>
              </S.Cell>
            </S.FlexRow>

            <S.FlexRow>
              <S.Cell onClick={() => setActiveBpm(!activeBpm)}>
                <S.BlinkingDiv bpm={parseInt(song.bpm)} active={activeBpm}>
                  {song.bpm}
                </S.BlinkingDiv>
                <S.CellValue $size="1.2rem" hidden={activeBpm}>
                  {song.bpm}
                </S.CellValue>
                <S.CellLabel>BPM</S.CellLabel>
              </S.Cell>
              <S.Cell>
                <S.CellValue $size="1.2rem">{song.key}</S.CellValue>
                <S.CellLabel>
                  <MinusCircle size={22} onClick={() => decreaseTone(song.content)} />
                  KEY
                  <PlusCircle size={22} onClick={() => increaseTone(song.content)} />
                </S.CellLabel>
              </S.Cell>
              <S.Cell>
                <S.CellValue $size="1.2rem">{song.rhythm}</S.CellValue>
                <S.CellLabel>RHYTHM</S.CellLabel>
              </S.Cell>
              {/* <S.Cell>
                <S.CellValue $size="1.2rem" $variant="purple">
                  {song.versions[0].name}
                </S.CellValue>
                <S.CellLabel>VERSION</S.CellLabel>
              </S.Cell> */}
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
                      <S.Cell key={key}>
                        <S.CellValue>{typeof note === 'string' ? note : `${note[0]} ${note[1]}`}</S.CellValue>
                      </S.Cell>
                    ))}
                  </S.Grid>
                </S.Section>
              ))}
          </S.Content>

          <S.SimpleButton onClick={handleSetlistButton}>Voltar</S.SimpleButton>
        </S.Container>
      )}
    </>
  );
};
