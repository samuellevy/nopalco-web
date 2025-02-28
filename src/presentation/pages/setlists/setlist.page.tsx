import React from 'react';

import * as S from './setlist.styles';
import { SongList } from '@/presentation/components/songlist';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Setlist } from '@/domain/models/setlist';
import { LoadSetlistRequest } from '@/domain/usecases/setlists/load-setlist-request';

type SetlistProps = {
  loadSetlistRequest: LoadSetlistRequest;
};

export const SetlistPage: React.FC<SetlistProps> = ({ loadSetlistRequest }) => {
  const navigate = useNavigate();
  const { setlistId } = useParams<{ setlistId: string }>();
  const [searchParams] = useSearchParams();
  const position = searchParams.get('position') || null;

  const [loadingData, setLoadingData] = React.useState(true);
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
    navigate(`/songs/${songId}?setlist=${setlistId}&key=${key}`);
  };

  React.useEffect(() => {
    if (!loadingData) return;

    fetchLoadSetlistsRequest().then(() => {
      if (position) {
        const element = document.getElementById(position);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  }, [fetchLoadSetlistsRequest, loadingData, setlist, position]);

  return (
    <S.Container>
      <S.Content>
        <S.Section>
          <S.SectionTitle>{`${setlist.name} - ${setlist.description}`}</S.SectionTitle>
          {setlist && (
            <S.SectionContent>
              {setlist.items?.map((item) => (
                <>
                  {item.song && (
                    <SongList.Badge 
                      id={item.song.id}
                      $variant="darkGray" 
                      onClick={() => handleLinkClick(item.song.id, setlistId, item.key)}
                    >
                      <SongList.ASide>
                        <SongList.BadgeTitle>{item.song.name}</SongList.BadgeTitle>
                        <SongList.BadgeSubTitle>{item.song.author}</SongList.BadgeSubTitle>
                      </SongList.ASide>
                    </SongList.Badge>
                  )}
                   {!item.song && (
                    <SongList.Badge $variant="disabled">
                      <SongList.ASide>
                        <SongList.BadgeTitle>{item.pureTitle}</SongList.BadgeTitle>
                        {/* <SongList.BadgeTitle>{item.pureAuthor}</SongList.BadgeTitle> */}
                      </SongList.ASide>
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
    </S.Container>
  );
};
