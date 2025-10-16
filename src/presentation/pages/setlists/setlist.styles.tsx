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

export const HeaderText = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  justify-content: center;
  align-items: center;
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
  width: 40px;
  height: 40px;
  background-color: #4191e1;
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #fff;
`;

export const RightSideActions = styled.div`
  position: fixed;
  top: 1rem;
  right: 1rem;
`;

export const FlexRow = styled.header`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  @media (min-width: 350px) {
    gap: 10px;
    padding: 5rem 1rem;
    height: 3rem;
  }
`;

export const SimpleButton = styled.button`
  margin: 20px 0;
  background-color: #06f;
  border: 1px solid #06f;
  border-radius: 4px;
  box-shadow: rgba(0, 0, 0, 0.1) 0 2px 4px 0;
  box-sizing: border-box;
  color: #fff;
  cursor: pointer;
  font-size: 16px;
  font-weight: 400;
  outline: none;
  outline: 0;
  padding: 10px 25px;
  @media (max-width: 350px) {
    padding: 10px 0px;
    width: 33%;
  }
  text-align: center;
  transform: translateY(0);
  transition:
    transform 150ms,
    box-shadow 150ms;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
`;
