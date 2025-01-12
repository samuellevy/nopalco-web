import React from 'react';

import * as S from './songs.styles';
import { SongList } from '@/presentation/components/songlist';
import { LoadAllSongsRequest } from '@/domain/usecases';
import { Song } from '@/domain/models';
import Loader from '@/presentation/components/loader/loader';
import { useNavigate } from 'react-router-dom';

type Props = {
  loadAllSongsRequest: LoadAllSongsRequest;
};

export const SongsPage: React.FC<Props> = ({ loadAllSongsRequest }) => {
  const navigate = useNavigate();
  const [loadingData, setLoadingData] = React.useState(true);
  const [songList, setSongList] = React.useState<Song[]>([]);

  const handleClickSong = (songId: string) => {
    navigate(`${songId}`);
  };

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

  React.useEffect(() => {
    if (!loadingData) return;
    if (songList && songList.length > 0) return;

    fetchLoadAllSongsRequest();
  }, [fetchLoadAllSongsRequest, loadingData, songList]);

  return loadingData ? (
    <S.Container>
      <Loader />
    </S.Container>
  ) : (
    <S.Container>
      <S.Header>
        <S.Title>Olá, Samuel!</S.Title>
        <S.UserNavigation>
          <S.UserAvatar src="/assets/avatar.jpg" />
        </S.UserNavigation>
      </S.Header>

      <S.Content>
        <S.Section>
          <S.SectionTitle>Músicas</S.SectionTitle>
          <S.SectionContent>
            {songList.map((song: Song) => (
              <SongList.Badge $variant="darkGray" onClick={() => handleClickSong(song.id)} key={song.uid}>
                <SongList.ASide>
                  <SongList.Thumbnail>
                    <img src='/assets/no-photo.png' alt="" />
                  </SongList.Thumbnail>
                </SongList.ASide>
                <SongList.ASide>
                  <SongList.BadgeTitle>{song.name}</SongList.BadgeTitle>
                  <SongList.BadgeSubTitle>{song.author}</SongList.BadgeSubTitle>
                </SongList.ASide>
              </SongList.Badge>
            ))}
          </S.SectionContent>
        </S.Section>
      </S.Content>
    </S.Container>
  );
};
