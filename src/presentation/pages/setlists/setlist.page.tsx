import React, { useEffect } from 'react';

import * as S from './setlist.styles';
import { SongList } from '@/presentation/components/songlist';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Setlist } from '@/domain/models/setlist';
import { LoadSetlistRequest } from '@/domain/usecases/setlists/load-setlist-request';
import { MessageCircle, Search } from 'lucide-react';
import { LoadAllSongsRequest } from '@/domain/usecases';
import { ModalSongsListComponent } from '@/presentation/components/modal-song-list/modal-song-list.component';

type SetlistProps = {
  loadSetlistRequest: LoadSetlistRequest;
  loadAllSongsRequest: LoadAllSongsRequest;
};

export const SetlistPage: React.FC<SetlistProps> = ({ loadSetlistRequest, loadAllSongsRequest }) => {
  const navigate = useNavigate();
  const { setlistId } = useParams<{ setlistId: string }>();
  const [searchParams] = useSearchParams();
  const position = searchParams.get('position') || null;

  const [loadingData, setLoadingData] = React.useState(true);
  const [modalSongsOpen, setModalSongsOpen] = React.useState(false);
  const [setlist, setSetlist] = React.useState<Setlist>({} as Setlist);

  const fetchLoadSetlistsRequest = React.useCallback(async () => {
    setLoadingData(true);
    if (setlistId) {
      try {
        const loadSetlistsRequestResult = await loadSetlistRequest.execute(setlistId);
        console.log(loadSetlistsRequestResult);
        setSetlist(loadSetlistsRequestResult);
        setLoadingData(false);
      } catch (error) {
        throw new Error(error as undefined);
      }
    }
  }, [loadSetlistRequest, setlistId]);

  const handleLinkClick = (songId: string, setlistId: string, key: string) => {
    navigate(`/songs/${songId}?setlist=${setlistId}&key=${encodeURIComponent(key)}`);
  };

  const handleCopySetlist = () => {
    // convert setlist to text
    let text = `Setlist: ${setlist.name}\nData: ${setlist.description}\n\n`;
    setlist.items
      ?.sort((a, b) => a.order - b.order)
      .forEach((item, index) => {
        if (item.song) {
          text += `${index + 1}. ${item.pureTitle ? item.pureTitle : item.song.name} - ${item.song.author} [${
            item.key
          }]\n`;
        } else {
          text += `${index + 1}. ${item.pureTitle} `;
          text += `[${item.key}]\n`;
        }
      });
    navigator.clipboard.writeText(text);
  };

  const handleClickSong = (songId: string) => {
    navigate(`/songs/${songId}`);
  };

  const handleGoToHome = () => {
    navigate(`/`);
  };

  useEffect(() => {
    if (!loadingData) return;

    fetchLoadSetlistsRequest().then(() => {
      if (position) {
        const element = document.getElementById(position);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });

    //fetchLoadAllSongsRequest();
  }, [fetchLoadSetlistsRequest, loadingData, setlist, position]);

  React.useEffect(() => {
    if (setlist && setlist.name) {
      document.title = `${setlist.name} - NoPalco`;
    }
  }, [setlist]);

  return (
    <>
      <S.Container>
        <S.Content>
          <S.Section>
            <S.HeaderText>
              <S.SectionTitle>{`${setlist.name} - ${setlist.description}`}</S.SectionTitle>
              <MessageCircle onClick={() => handleCopySetlist()} />
            </S.HeaderText>
            {setlist && (
              <S.SectionContent>
                {setlist.items
                  ?.sort((a, b) => a.order - b.order)
                  .map((item) => (
                    <>
                      {item.song && (
                        <SongList.Badge
                          id={item.song.id}
                          $variant="darkGray"
                          onClick={() => handleLinkClick(item.song.id, setlistId, item.key)}
                        >
                          <SongList.ASide>
                            <SongList.BadgeTitle>
                              {item.pureTitle ? item.pureTitle : item.song.name}
                            </SongList.BadgeTitle>
                            <SongList.BadgeSubTitle>{item.song.author}</SongList.BadgeSubTitle>
                          </SongList.ASide>
                          <SongList.ASide>
                            <S.BadgeKey>{item.key}</S.BadgeKey>
                          </SongList.ASide>
                        </SongList.Badge>
                      )}
                      {!item.song && (
                        <SongList.Badge $variant="disabled">
                          <SongList.ASide>
                            <SongList.BadgeTitle>{item.pureTitle}</SongList.BadgeTitle>
                            {/* <SongList.BadgeTitle>{item.pureAuthor}</SongList.BadgeTitle> */}
                          </SongList.ASide>
                          {item.key && (
                            <SongList.ASide>
                              <S.BadgeKey>{item.key}</S.BadgeKey>
                            </SongList.ASide>
                          )}
                        </SongList.Badge>
                      )}
                    </>
                  ))}
                {/* 
            <SongList.Badge $variant="darkGray">
              <SongList.ASide>
                <SongList.Thumbnail>
                  <img src="https://images03.brasildefato.com.br/2e6b2c54d374ff3e215caf093a8ac7e4.jpeg" alt="" />
                </SongList.Thumbnail>
              </SongList.ASide>

              <SongList.ASide>
                <SongList.BadgeTitle>Banho de Folhas</SongList.BadgeTitle>
                <SongList.BadgeSubTitle>Luedji Luna</SongList.BadgeSubTitle>
              </SongList.ASide>
            </SongList.Badge> */}
              </S.SectionContent>
            )}
          </S.Section>
        </S.Content>

        <S.FlexRow>
          <S.SimpleButton onClick={handleGoToHome}>Voltar</S.SimpleButton>
        </S.FlexRow>
      </S.Container>

      <S.RightSideActions>
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
