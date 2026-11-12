import React from 'react';

import { Container, ContentContainer, ContentWrapper } from './admin.styles';
import { Outlet, useLocation } from 'react-router-dom';
import { UserMenu } from '@/presentation/components/user-menu/user-menu.component';
// import NavigationBarAdmin from '@/presentation/components/navigation-bar/navigation-bar-admin';

type Props = {
  children?: React.ReactNode;
};

const AdminLayout: React.FC<Props> = () => {
  const { pathname } = useLocation();
  const hasInlineMenu =
    pathname === '/' || (/^\/(setlists|songs)\/[^/]+\/?$/.test(pathname) && !/\/create\/?$/.test(pathname));
  return (
    <Container>
      <ContentContainer>
        <ContentWrapper>
          {!hasInlineMenu && <UserMenu />}
          <Outlet />
        </ContentWrapper>
        {/* <NavigationBarAdmin /> */}
      </ContentContainer>
    </Container>
  );
};

export default AdminLayout;
