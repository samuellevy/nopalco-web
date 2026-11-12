import React from 'react';

import * as S from './modal-song-list.component.styles';
import { SongList } from '@/presentation/components/songlist';
import { X } from 'lucide-react';
import { Song } from '@/domain/models';
import { LoadAllSongsRequest } from '@/domain/usecases';
import { SetlistItem } from '@/domain/models/setlist';
import { compareSongsForSearch, normalizeSearchText } from '@/presentation/utils/song-search';

type ModalSongsProps = {
  loadAllSongsRequest: LoadAllSongsRequest;
  modalSongsOpen: boolean;
  setModalSongsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleClickSong: (songId: string) => void;
  onSelectSong?: (song: Song) => void;
  ariaLabel?: string;
  setlistItems?: SetlistItem[];
};

export const ModalSongsListComponent: React.FC<ModalSongsProps> = ({
  loadAllSongsRequest,
  modalSongsOpen,
  setModalSongsOpen,
  handleClickSong,
  onSelectSong,
  ariaLabel,
  setlistItems,
}) => {
  const [songList, setSongList] = React.useState<Song[]>([]);
  const [originalList, setSongOriginalList] = React.useState<Song[]>([]);
  const [loadingData, setLoadingData] = React.useState(true);
  const [searchText, setSearchText] = React.useState('');
  const searchInput = React.useRef<HTMLInputElement>(null);

  const fetchLoadAllSongsRequest = React.useCallback(async () => {
    if (setlistItems) {
      const songs = setlistItems.slice().sort((first, second) => first.order - second.order).map((item) => ({
        ...item.song,
        id: item.id,
        name: item.pureTitle || item.song?.name || 'Sem título',
        author: [item.singer?.name || item.song?.author, item.key].filter(Boolean).join(' - '),
      }));
      setSongList(songs);
      setSongOriginalList(songs);
      setLoadingData(false);
      return;
    }
    setLoadingData(true);
    try {
      const loadAllSongsRequestResult = await loadAllSongsRequest.execute();
      const songs = loadAllSongsRequestResult.songs.slice().sort(compareSongsForSearch);
      setSongList(songs);
      setSongOriginalList(songs);
      setLoadingData(false);
    } catch (error) {
      throw new Error(error as undefined);
    }
  }, [loadAllSongsRequest, setlistItems]);

  const handleFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchText(value);
    const query = normalizeSearchText(value);
    const filteredSongList = originalList.filter((song) =>
      normalizeSearchText(song.name).includes(query) || normalizeSearchText(song.author).includes(query),
    );
    setSongList(filteredSongList);
  };

  const handleClearSearch = () => {
    setSearchText('');
    setSongList(originalList);
    searchInput.current?.focus({ preventScroll: true });
  };

  React.useEffect(() => {
    fetchLoadAllSongsRequest();
  }, [fetchLoadAllSongsRequest]);

  if (loadingData) {
    return <div>Carregando...</div>;
  }

  const songGroups: { letter: string; songs: Song[] }[] = [];
  for (const song of songList) {
    const initial = normalizeSearchText(song.name).charAt(0).toUpperCase();
    const letter = setlistItems ? '' : /^[A-Z]$/.test(initial) ? initial : '#';
    const previousGroup = songGroups[songGroups.length - 1];
    if (previousGroup?.letter === letter) {
      previousGroup.songs.push(song);
    } else {
      songGroups.push({ letter, songs: [song] });
    }
  }

  return (
    <S.ModalSongList
      $open={modalSongsOpen}
      role="dialog"
      aria-modal={modalSongsOpen}
      aria-hidden={!modalSongsOpen}
      aria-label={ariaLabel || (onSelectSong ? 'Adicionar música ao setlist' : setlistItems ? 'Setlist atual' : 'Buscar músicas')}
    >
      <S.ModalSongListContent>
        <S.ModalSongListHeader>
          <S.SearchField>
            <S.FormInput
              ref={searchInput}
              value={searchText}
              aria-label={setlistItems ? 'Buscar no setlist atual' : 'Buscar músicas'}
              placeholder={setlistItems ? 'Buscar no setlist atual' : 'Pesquisa rápida'}
              onChange={handleFilter}
            />
            {searchText && (
              <S.ClearSearchButton
                type="button"
                aria-label="Limpar pesquisa"
                title="Limpar pesquisa"
                onMouseDown={(event) => event.preventDefault()}
                onClick={handleClearSearch}
              >
                <X size={16} aria-hidden="true" />
              </S.ClearSearchButton>
            )}
          </S.SearchField>
          <S.ModalClose aria-label="Fechar busca" title="Fechar busca" onClick={() => setModalSongsOpen(false)}>
            <X />
          </S.ModalClose>
        </S.ModalSongListHeader>

        {songGroups.map((group, groupIndex) => (
          <S.AlphabetGroup
            key={`${group.letter}-${groupIndex}`}
            aria-label={setlistItems ? undefined : `Músicas com inicial ${group.letter}`}
          >
            {!setlistItems && <S.AlphabetLetter aria-hidden="true">{group.letter}</S.AlphabetLetter>}
            {group.songs.map((song: Song, key: number) => (
              <SongList.Badge
                key={`${song.id}-${key}`}
                $variant="darkGray"
                onClick={() => onSelectSong ? onSelectSong(song) : handleClickSong(song.id)}
              >
                <SongList.ASide>
                  <SongList.Thumbnail>
                    <img src="/assets/no-photo.png" alt="" />
                  </SongList.Thumbnail>
                </SongList.ASide>
                <SongList.ASide>
                  <SongList.BadgeTitle>{song.name}</SongList.BadgeTitle>
                  <SongList.BadgeSubTitle>
                    {[song.author, !setlistItems ? song.key : null]
                      .filter(Boolean)
                      .join(' - ')}
                  </SongList.BadgeSubTitle>
                </SongList.ASide>
              </SongList.Badge>
            ))}
          </S.AlphabetGroup>
        ))}
      </S.ModalSongListContent>
    </S.ModalSongList>
  );
};
