import React from 'react';

import * as S from './navigation-bar.styles';
import { Gauge, PlusCircle, Users, CircleDollarSign, School } from 'lucide-react';

const NavigationBarAdmin: React.FC = () => {
  return (
    <S.NavigationBar>
      <S.NavigationItem $active>
        <S.NavigationIconBox>
          <Gauge size={'100%'} />
        </S.NavigationIconBox>
        <S.NavigationLabel>Dashboard</S.NavigationLabel>
      </S.NavigationItem>

      <S.NavigationItem>
        <S.NavigationIconBox>
          <School size={'100%'} />
        </S.NavigationIconBox>
        <S.NavigationLabel>Aulas</S.NavigationLabel>
      </S.NavigationItem>

      <S.NavigationItem>
        <S.NavigationIconBox>
          <PlusCircle size={'100%'} />
        </S.NavigationIconBox>
        <S.NavigationLabel>Criar</S.NavigationLabel>
      </S.NavigationItem>

      <S.NavigationItem>
        <S.NavigationIconBox>
          <Users size={'100%'} />
        </S.NavigationIconBox>
        <S.NavigationLabel>Pessoas</S.NavigationLabel>
      </S.NavigationItem>

      <S.NavigationItem>
        <S.NavigationIconBox>
          <CircleDollarSign size={'100%'} />
        </S.NavigationIconBox>
        <S.NavigationLabel>Pagamentos</S.NavigationLabel>
      </S.NavigationItem>
    </S.NavigationBar>
  );
};

export default NavigationBarAdmin;
