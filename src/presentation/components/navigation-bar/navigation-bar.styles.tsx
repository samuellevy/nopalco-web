import styled from 'styled-components';

type NavigationItemProps = {
  $active?: boolean;
};

export const NavigationBar = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3.5rem 2.5rem;
  height: 3rem;
  background-color: ${({ theme }) => theme.colors.primary};
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
  position: fixed;
  width: 100%;
  bottom: 0;
`;

export const NavigationItem = styled.div<NavigationItemProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding: 2rem;

  ${({ $active }) => $active && 'border-top: 5px solid #fff;'};

  &:hover {
    border-top: 5px solid #fff;
    cursor: pointer;
  }
`;

export const NavigationIconBox = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  color: white;
`;

export const NavigationLabel = styled.span`
  font-size: 1rem;
  font-weight: 500;
  color: white;
  display: none;
`;
