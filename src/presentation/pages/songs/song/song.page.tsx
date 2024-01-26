/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { PlusCircle, MinusCircle } from 'lucide-react';

import * as S from './song.styles';
import { useParams } from 'react-router-dom';
import { LoadSongRequest } from '@/domain/usecases/songs/load-song-request';

interface Content {
  block: string;
  notes: (string | [string, string])[];
}

interface Version {
  name: string;
  content: Content[];
}

interface Song {
  uid: string;
  mashup: string;
  name: string;
  author: string;
  bpm: string;
  key: string;
  timeSignature: string;
  rhythm: string;
  duration: string;
  versions: Version[];
}

type Props = {
  loadSongRequest: LoadSongRequest;
};

export const SongPage: React.FC<Props> = ({ loadSongRequest }) => {
  const { songId } = useParams<{ songId: string }>();
  const [loadingData, setLoadingData] = React.useState(true);
  const [song, setSong] = React.useState<Song>({} as Song);

  const fetchLoadSongRequest = React.useCallback(async () => {
    setLoadingData(true);
    try {
      const loadSongRequestResult = await loadSongRequest.execute(songId);
      setSong(loadSongRequestResult);
      console.log(loadSongRequestResult);
      setLoadingData(false);
    } catch (error) {
      throw new Error(error as undefined);
    }
  }, [loadSongRequest]);

  React.useEffect(() => {
    if (!loadingData) return;

    fetchLoadSongRequest();
  }, [fetchLoadSongRequest, loadingData, song]);
  const handleIncreasePitch = () => {
    console.log('increase pitch');
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

  return (
    <>
      {!song && <h1>Loading</h1>}
      {song.versions && (
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
              <S.Cell>
                <S.CellValue $size="1.2rem">{song.bpm}</S.CellValue>
                <S.CellLabel>BPM</S.CellLabel>
              </S.Cell>
              <S.Cell>
                <S.CellValue $size="1.2rem">{song.key}</S.CellValue>
                <S.CellLabel>
                  <MinusCircle size={15} />
                  KEY
                  <PlusCircle size={15} onClick={() => handleIncreasePitch()} />
                </S.CellLabel>
              </S.Cell>
              <S.Cell>
                <S.CellValue $size="1.2rem">{song.rhythm}</S.CellValue>
                <S.CellLabel>RHYTHM</S.CellLabel>
              </S.Cell>
              <S.Cell>
                <S.CellValue $size="1.2rem" $variant="purple">
                  {song.versions[0].name}
                </S.CellValue>
                <S.CellLabel>VERSION</S.CellLabel>
              </S.Cell>
            </S.FlexRow>
          </S.Header>

          <S.Content>
            {song.versions[0].content.map((songSection: Content, keyContent) => (
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
        </S.Container>
      )}
    </>
  );
};
