import React from 'react';

import { Container, ContentContainer, ContentWrapper } from './admin.styles';
import { Outlet } from 'react-router-dom';
// import NavigationBarAdmin from '@/presentation/components/navigation-bar/navigation-bar-admin';

type Props = {
  children?: React.ReactNode;
};

const AdminLayout: React.FC<Props> = () => {
  return (
    <Container>
      <ContentContainer>
        <ContentWrapper>
          <Outlet />
        </ContentWrapper>
        {/* <NavigationBarAdmin /> */}
      </ContentContainer>
    </Container>
  );
};

export default AdminLayout;
