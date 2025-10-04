import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: row;
  background-color: ${({ theme }) => theme.variants.lucide.screenBackground};
  color: ${({ theme }) => theme.colors.white};
  width: 100%;
  min-height: 100vh;
  gap: 0rem;
`;

export const ContentWrapper = styled.div`
  width: 100%;
  padding: 0 1.5rem;
`;

export const NavContainer = styled.div`
  width: 300px;
  min-height: 100vh;
  background-color: #fff;
`;

export const ContentContainer = styled.div`
  width: 100%;
  height: 100%;
`;
