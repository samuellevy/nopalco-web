/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { PlusCircle, MinusCircle } from 'lucide-react';

import * as S from './song.styles';

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
export const SongPage: React.FC = () => {
  const [song, setSong] = useState({} as Song);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch('/song.json');
      const songFromApi: Song = await response.json();
      setSong(songFromApi);
    }
    fetchData();
  }, []);

  const musicalNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const increaseNotePitch = (note: string): string => {
    const index = musicalNotes.indexOf(note);

    if (index !== -1) {
      const newIndex = (index + 1) % musicalNotes.length;
      return musicalNotes[newIndex];
    }

    return note;
  };

  const parseChord = (chord: string): string[] => {
    const regex = /([CDEFGAB])([b#]?)([mM]?[b#]?)?([+\-º\d]*)/;
    const [, baseNote, accidental, quality, extension] = chord.match(regex) || [];

    const parsedChord = [baseNote];

    if (accidental) {
      if (accidental === 'b') {
        // Ajuste para aumentar meio tom abaixo
        const index = musicalNotes.indexOf(baseNote);
        const newIndex = (index + musicalNotes.length - 1) % musicalNotes.length;
        parsedChord[0] = musicalNotes[newIndex] + '#';
      } else {
        parsedChord[0] = increaseNotePitch(parsedChord[0]);
      }
    }

    if (quality) {
      parsedChord.push(quality);
    }

    if (extension) {
      parsedChord.push(extension);
    }

    return parsedChord;
  };

  const increasePitchOfChord = (chord: string): string => {
    const parsedChord = parseChord(chord);

    return parsedChord
      .map((component) => {
        if (/^\d+$/.test(component) || ['+', '-', 'º'].includes(component)) {
          return component;
        } else {
          return increaseNotePitch(component);
        }
      })
      .join('');
  };

  const increasePitchOfNotes = (notes: (string | [string, string])[]): (string | [string, string])[] => {
    return notes.map((note) => {
      if (Array.isArray(note)) {
        return [increasePitchOfChord(note[0]), increasePitchOfChord(note[1])];
      } else {
        return note === '%' ? note : increasePitchOfChord(note);
      }
    });
  };

  const increasePitchOfVersion = (version: Version): Version => {
    return {
      ...version,
      content: version.content.map((item) => ({
        ...item,
        notes: increasePitchOfNotes(item.notes),
      })),
    };
  };

  const increasePitchOfSong = (song: Song): Song => {
    return {
      ...song,
      versions: song.versions.map(increasePitchOfVersion),
    };
  };

  const handleIncreasePitch = () => {
    setSong(increasePitchOfSong(song));
  };

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
                <S.SectionTitle>{songSection.block}</S.SectionTitle>
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
