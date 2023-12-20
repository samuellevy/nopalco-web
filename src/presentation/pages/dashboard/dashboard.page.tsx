import React from 'react';

import * as S from './dashboard.styles';

export const DashboardPage: React.FC = () => {
  return (
    <S.Container>
      <S.Header>
        <S.Title>Olá, Chico!</S.Title>
        <S.UserNavigation>
          <S.UserAvatar src="https://avatars.githubusercontent.com/u/26466516?v=4" />
        </S.UserNavigation>
      </S.Header>

      <S.Content>
        <S.Section>
          <S.SectionTitle>Alunos do curso</S.SectionTitle>

          <S.SectionContent>
            <S.Badge $variant="primary">
              <S.BadgeTitle>120</S.BadgeTitle>
              <S.BadgeSubTitle>alunos cadastrados</S.BadgeSubTitle>
            </S.Badge>

            <S.Badge $variant="info">
              <S.BadgeTitle>50</S.BadgeTitle>
              <S.BadgeSubTitle>alunos ativos</S.BadgeSubTitle>
            </S.Badge>

            <S.Badge $variant="success">
              <S.BadgeTitle>40</S.BadgeTitle>
              <S.BadgeSubTitle>alunos em dia</S.BadgeSubTitle>
            </S.Badge>

            <S.Badge $variant="danger">
              <S.BadgeTitle>80</S.BadgeTitle>
              <S.BadgeSubTitle>alunos inadimplentes</S.BadgeSubTitle>
            </S.Badge>
          </S.SectionContent>
        </S.Section>

        <S.Section>
          <S.SectionTitle>Estatísticas de presença</S.SectionTitle>
          <S.SectionContent>
            <S.Badge $variant="secondary">
              <S.BadgeTitle>39</S.BadgeTitle>
              <S.BadgeSubTitle>nessa semana</S.BadgeSubTitle>
            </S.Badge>
            <S.Badge $variant="secondary">
              <S.BadgeTitle>39</S.BadgeTitle>
              <S.BadgeSubTitle>
                nesse <br /> mês
              </S.BadgeSubTitle>
            </S.Badge>
            <S.Badge $variant="lightGray">
              <S.BadgeTitle>39</S.BadgeTitle>
              <S.BadgeSubTitle>
                mês <br />
                anterior
              </S.BadgeSubTitle>
            </S.Badge>
          </S.SectionContent>
        </S.Section>
      </S.Content>
    </S.Container>
  );
};
