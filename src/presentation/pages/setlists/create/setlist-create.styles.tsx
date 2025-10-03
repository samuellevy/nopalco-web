import styled from 'styled-components';

type BadgeProps = {
  $variant?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'lightGray'
    | 'darkGray'
    | 'disabled';
  $selected?: boolean;
};

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
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
  flex-direction: row;
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

export const SectionHeaderColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const SectionHeaderRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
`;

export const SimpleButton = styled.button`
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

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: flex-end;
`;

export const SectionTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
`;

export const SectionContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 2rem;
  width: 100%;
`;

export const Badge = styled.div<BadgeProps>`
  display: flex;
  flex-direction: row;
  border-radius: 1rem;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
  width: 100%;
  height: 10rem;
  cursor: pointer;
  padding: 10px;
  align-items: center;
  gap: 1rem;

  ${({ theme, $variant }) =>
    $variant && `background-color: ${theme.variants[$variant].background}; color: ${theme.variants[$variant].color};`};

  ${({ theme, $selected, $variant }) =>
    `background-color: ${$selected ? '#4169E1' : theme.variants[$variant].background};`}
`;

export const BadgeTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;

  input {
    font-size: 1.5rem;
    font-weight: 500;
    color: #ffffff;
    width: 45px;
    padding: 5px 2px;
    text-align: left;
    transform: translateX(-5px);

    &:focus {
      outline: ${({ theme }) => theme.colors.primary};
      background-color: #346da7;
    }
  }
`;

export const BadgeSubTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 500;
`;

export const FormInput = styled.input`
  background-color: #fff;
  min-width: 220px;
  font-size: 14px;
  padding: 10px 15px;
  border-radius: 1rem;
`;

export const FormInputHeader = styled.input`
  background-color: #fff;
  max-width: 140px;
  font-size: 14px;
  padding: 10px 15px;
  border-radius: 1rem;
`;

export const ASide = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const ASideTitle = styled(ASide)`
  width: 50%;
`;

export const ASideDetails = styled(ASide)`
  width: 30%;
`;

export const ASidePosition = styled(ASide)`
  width: 10%;
`;

export const ASideButtons = styled.div`
  width: 10%;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  i {
    width: 30px;
    height: 30px;
    background-color: #4191e1;
    border-radius: 25px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background-color: #346da7;
    }
  }
`;

export const PositionText = styled.div`
  background-color: #4191e1;
  width: 50px;
  height: 50px;
  border-radius: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
