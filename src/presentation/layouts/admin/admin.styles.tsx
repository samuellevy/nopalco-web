import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: row;
  background: radial-gradient(circle at top right, rgba(139, 92, 246, 0.08), transparent 30%), #0f1117;
  color: ${({ theme }) => theme.colors.white};
  width: 100%;
  min-height: 100vh;
  gap: 0rem;
`;

export const ContentWrapper = styled.div`
  width: 100%;
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
