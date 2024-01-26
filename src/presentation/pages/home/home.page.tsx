import React from 'react';

import * as S from './home.styles';
import { BadgeComponent } from '@/presentation/components/badge';
import { SongList } from '@/presentation/components/songlist';
import { useNavigate } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleLinkClick = (navItem: string) => {
    navigate(`/${navItem}`);
  };

  return (
    <S.Container>
      <S.Header>
        <S.Title>Olá, Samuel!</S.Title>
        <S.UserNavigation>
          <S.UserAvatar src="https://avatars.githubusercontent.com/u/26466516?v=4" />
        </S.UserNavigation>
      </S.Header>

      <S.Content>
        <S.Section>
          <S.SectionTitle>Próximos eventos</S.SectionTitle>

          <S.SectionContent>
            <BadgeComponent.Badge $variant="darkGray">
              <BadgeComponent.BadgeTitle>20/01</BadgeComponent.BadgeTitle>
              <BadgeComponent.BadgeSubTitle>Festa privada na Tijuca</BadgeComponent.BadgeSubTitle>
            </BadgeComponent.Badge>

            <BadgeComponent.Badge $variant="darkGray">
              <BadgeComponent.BadgeTitle>27/01</BadgeComponent.BadgeTitle>
              <BadgeComponent.BadgeSubTitle>Ateliê Bonifácio</BadgeComponent.BadgeSubTitle>
            </BadgeComponent.Badge>
          </S.SectionContent>
        </S.Section>

        <S.Section>
          <S.SectionTitle>Setlists salvos</S.SectionTitle>

          <S.SectionContent>
            <BadgeComponent.Badge $variant="darkGray">
              <BadgeComponent.BadgeSubTitle>É o Tchan</BadgeComponent.BadgeSubTitle>
            </BadgeComponent.Badge>

            <BadgeComponent.Badge $variant="darkGray">
              <BadgeComponent.BadgeSubTitle>Ijexá</BadgeComponent.BadgeSubTitle>
            </BadgeComponent.Badge>

            <BadgeComponent.Badge $variant="darkGray">
              <BadgeComponent.BadgeSubTitle>Samba-enredo</BadgeComponent.BadgeSubTitle>
            </BadgeComponent.Badge>

            <BadgeComponent.Badge $variant="darkGray">
              <BadgeComponent.BadgeSubTitle>Samba-reggae</BadgeComponent.BadgeSubTitle>
            </BadgeComponent.Badge>

            <BadgeComponent.Badge $variant="darkGray">
              <BadgeComponent.BadgeSubTitle>Turbinado</BadgeComponent.BadgeSubTitle>
            </BadgeComponent.Badge>

            <BadgeComponent.Badge $variant="darkGray">
              <BadgeComponent.BadgeSubTitle>Coco</BadgeComponent.BadgeSubTitle>
            </BadgeComponent.Badge>

            <BadgeComponent.Badge $variant="darkGray">
              <BadgeComponent.BadgeSubTitle>Maracatu</BadgeComponent.BadgeSubTitle>
            </BadgeComponent.Badge>
          </S.SectionContent>
        </S.Section>

        <S.Section>
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
          </S.SectionContent>
        </S.Section>
      </S.Content>
    </S.Container>
  );
};
