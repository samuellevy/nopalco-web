import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  margin-bottom: 10rem;
  /* background-color: #161618; */
`;

/** Header */
export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5rem 1rem;
  height: 3rem;
`;

export const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
`;

export const UserAvatar = styled.img`
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
`;

export const UserNavigation = styled.nav`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

/** Header */

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  gap: 5rem;
`;

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: flex-start;
`;

export const SectionTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 500;
`;

export const SectionContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 2rem;
  width: 100%;
`;

export const Button = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: white;

  &:hover {
    opacity: 0.6;
  }
`;
