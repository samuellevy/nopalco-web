import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  margin-bottom: 10rem;
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
`;

/** Header */

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 2rem 1rem;
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
  font-size: 2.5rem;
  font-weight: 500;
`;

export const SectionContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 2rem;
  width: 100%;
`;

export const BadgeKey = styled.div`
  width: 30px;
  height: 30px;
  background-color: #4191e1;
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
