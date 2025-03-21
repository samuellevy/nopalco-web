import React from 'react';

import * as S from './home.styles';
import { BadgeComponent } from '@/presentation/components/badge';
// import { SongList } from '@/presentation/components/songlist';
import { useNavigate } from 'react-router-dom';
import { LoadAllSetlistsRequest } from '@/domain/usecases/setlists/load-all-setlists-request';
import { Setlist } from '@/domain/models/setlist';

type HomeProps = {
  loadAllSetlistsRequest: LoadAllSetlistsRequest;
};

export const HomePage: React.FC<HomeProps> = ({ loadAllSetlistsRequest }) => {
  const navigate = useNavigate();
  const [loadingData, setLoadingData] = React.useState(true);
  const [setlists, setSetlists] = React.useState<Setlist[]>([]);

  const fetchLoadAllSetlistsRequest = React.useCallback(async () => {
    setLoadingData(true);
    try {
      const loadAllSetlistsRequestResult = await loadAllSetlistsRequest.execute();
      setSetlists(loadAllSetlistsRequestResult);
      setLoadingData(false);
    } catch (error) {
      throw new Error(error as undefined);
    }
  }, [loadAllSetlistsRequest]);

  const handleLinkClick = (navItem: string) => {
    navigate(`/${navItem}`);
  };

  React.useEffect(() => {
    if (!loadingData) return;
    if (setlists && setlists.length > 0) return;

    fetchLoadAllSetlistsRequest();
  }, [fetchLoadAllSetlistsRequest, loadingData, setlists]);

  return (
    <S.Container>
      <S.Header>
        <S.Title>Olá, Samuel!</S.Title>
        <S.UserNavigation>
          <S.UserAvatar src="https://avatars.githubusercontent.com/u/26466516?v=4" />
        </S.UserNavigation>
      </S.Header>

      <S.Content>
        {/* <S.Section>
          <S.SectionTitle>Próximos eventos</S.SectionTitle>

          <S.SectionContent>
            <BadgeComponent.Badge $variant="darkGray" onClick={() => handleLinkClick(`songs/`)}>
              <BadgeComponent.BadgeTitle>12/jan</BadgeComponent.BadgeTitle>
              <BadgeComponent.BadgeSubTitle>JoJoe</BadgeComponent.BadgeSubTitle>
            </BadgeComponent.Badge>
            <BadgeComponent.Badge $variant="darkGray" onClick={() => handleLinkClick(`songs-small/`)}>
              <BadgeComponent.BadgeTitle>12/jan [smartwatch]</BadgeComponent.BadgeTitle>
              <BadgeComponent.BadgeSubTitle>JoJoe</BadgeComponent.BadgeSubTitle>
            </BadgeComponent.Badge>
          </S.SectionContent>
        </S.Section> */}

        <S.Section>
          <S.SectionTitle>Setlists salvos</S.SectionTitle>

          <S.SectionContent>
            {setlists.map((item) => (
              <BadgeComponent.Badge $variant="darkGray" onClick={() => handleLinkClick(`setlists/${item.id}`)}>
                 <BadgeComponent.BadgeTitle>{item.description}</BadgeComponent.BadgeTitle>
                 <BadgeComponent.BadgeSubTitle>{item.name}</BadgeComponent.BadgeSubTitle>
              </BadgeComponent.Badge>
            ))}
          </S.SectionContent>
        </S.Section>

        {/* <S.Section>
          <S.SectionTitle>Músicas</S.SectionTitle>

          <S.SectionContent>
            <SongList.Badge $variant="darkGray" onClick={() => handleLinkClick('songs/123')}>
              <SongList.ASide>
                <SongList.Thumbnail>
                  <img
                    src="https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRGCu3ETf6NPxGijCEaIvANw6fyshVbUJs42fXNSqNI0P_AmBBL"
                    alt=""
                  />
                </SongList.Thumbnail>
              </SongList.ASide>
              <SongList.ASide>
                <SongList.BadgeTitle>Camarão que Dorme a Onda Leva</SongList.BadgeTitle>
                <SongList.BadgeSubTitle>Zeca Pagodinho</SongList.BadgeSubTitle>
              </SongList.ASide>
            </SongList.Badge>
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
            </SongList.Badge>
            <SongList.Badge $variant="darkGray">
              <SongList.ASide>
                <SongList.Thumbnail>
                  <img
                    src="https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcS4vODmRGvasDViGXfn6bzIL0ZdQi91cUSQVn0S6NllO67yowvV"
                    alt=""
                  />
                </SongList.Thumbnail>
              </SongList.ASide>

              <SongList.ASide>
                <SongList.BadgeTitle>Pé na Areia</SongList.BadgeTitle>
                <SongList.BadgeSubTitle>Diogo Nogueira</SongList.BadgeSubTitle>
              </SongList.ASide>
            </SongList.Badge>
            <SongList.Badge $variant="darkGray">
              <SongList.ASide>
                <SongList.Thumbnail>
                  <img
                    src="https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcR8V8tD6hJqi6QpYrXlOXKOStFqu-8lGIo6r3SN4ajZFGA8GQSE"
                    alt=""
                  />
                </SongList.Thumbnail>
              </SongList.ASide>

              <SongList.ASide>
                <SongList.BadgeTitle>O que é o amor?</SongList.BadgeTitle>
                <SongList.BadgeSubTitle>Arlindo Cruz</SongList.BadgeSubTitle>
              </SongList.ASide>
            </SongList.Badge>
          </S.SectionContent>
        </S.Section> */}
      </S.Content>
    </S.Container>
  );
};
