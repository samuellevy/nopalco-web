import React from 'react';

import * as S from './modal-song-list.component.styles';
import { SongList } from '@/presentation/components/songlist';
import { X } from 'lucide-react';
import { Song } from '@/domain/models';
import { LoadAllSongsRequest } from '@/domain/usecases';

type ModalSongsProps = {
  loadAllSongsRequest: LoadAllSongsRequest;
  modalSongsOpen: boolean;
  setModalSongsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleClickSong: (songId: string) => void;
};

export const ModalSongsListComponent: React.FC<ModalSongsProps> = ({
  loadAllSongsRequest,
  modalSongsOpen,
  setModalSongsOpen,
  handleClickSong,
}) => {
  const [songList, setSongList] = React.useState<Song[]>([]);
  const [originalList, setSongOriginalList] = React.useState<Song[]>([]);
  const [loadingData, setLoadingData] = React.useState(true);

  const fetchLoadAllSongsRequest = React.useCallback(async () => {
    setLoadingData(true);
    try {
      const loadAllSongsRequestResult = await loadAllSongsRequest.execute();
      setSongList(loadAllSongsRequestResult.songs);
      setSongOriginalList(loadAllSongsRequestResult.songs);
      setLoadingData(false);
    } catch (error) {
      throw new Error(error as undefined);
    }
  }, [loadAllSongsRequest]);

  const handleFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const filteredSongList = originalList.filter((song) =>
      song.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .includes(value.toLowerCase()),
    );
    setSongList(filteredSongList);
  };

  React.useEffect(() => {
    fetchLoadAllSongsRequest();
  }, [fetchLoadAllSongsRequest]);

  if (loadingData) {
    return <div>Carregando...</div>;
  }

  return (
    <S.ModalSongList $open={modalSongsOpen}>
      <S.ModalSongListContent>
        <S.ModalSongListHeader>
          <S.FormInput placeholder="Pesquisa rápida" onChange={handleFilter} />
          <S.ModalClose onClick={() => setModalSongsOpen(false)}>
            <X />
          </S.ModalClose>
        </S.ModalSongListHeader>

        {songList.map((song: Song) => (
          <SongList.Badge $variant="darkGray" onClick={() => handleClickSong(song.id)} key={song.uid}>
            <SongList.ASide>
              <SongList.Thumbnail>
                <img src="/assets/no-photo.png" alt="" />
              </SongList.Thumbnail>
            </SongList.ASide>
            <SongList.ASide>
              <SongList.BadgeTitle>{song.name}</SongList.BadgeTitle>
              <SongList.BadgeSubTitle>{song.author}</SongList.BadgeSubTitle>
            </SongList.ASide>
          </SongList.Badge>
        ))}
      </S.ModalSongListContent>
    </S.ModalSongList>
  );
};
