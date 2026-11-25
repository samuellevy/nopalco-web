import styled from 'styled-components';
import { Link } from 'react-router-dom';

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
  min-height: 100%;
  background: #0f1117;
  color: #f8fafc;
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
  display: grid;
  grid-template-columns: minmax(240px, 1fr) minmax(0, 2fr);
  flex: 1;
  align-items: start;
  padding: 2rem 2.5rem calc(100px + env(safe-area-inset-bottom, 0px));
  gap: 2rem;

  @media (max-width: 800px) {
    grid-template-columns: minmax(0, 1fr);
    padding: 1.5rem 1rem calc(100px + env(safe-area-inset-bottom, 0px));
  }
`;

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  align-items: stretch;
`;

export const SectionHeaderColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const SectionHeaderRow = styled.div`
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  align-items: end;
`;

export const SimpleButton = styled.button`
  background-color: #8b5cf6;
  border: 1px solid #8b5cf6;
  border-radius: 6px;
  box-sizing: border-box;
  color: #fff;
  cursor: pointer;
  min-height: 40px;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 16px;
  text-align: center;
  &:hover:not(:disabled) {
    background-color: #a78bfa;
  }

  &:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  &:focus-visible {
    outline: 2px solid #a78bfa;
    outline-offset: 2px;
  }
`;

export const Footer = styled.footer`
  position: fixed;
  inset: auto 0 0;
  z-index: 50;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 2.5rem calc(12px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  background: #0f1117;

  @media (max-width: 800px) {
    padding-left: 1rem;
    padding-right: 1rem;
  }
`;

export const SaveButton = styled(SimpleButton)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 120px;
`;

export const HomeLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  background: #171b26;
  color: #f8fafc;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;

  &:hover {
    background: #1d2232;
  }

  &:focus-visible {
    outline: 2px solid #a78bfa;
    outline-offset: 2px;
  }
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  justify-content: flex-end;
  min-width: 0;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 500;
`;

export const SectionTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
`;

export const SectionContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.5rem;
  width: 100%;
`;

export const Badge = styled.div<BadgeProps>`
  display: flex;
  flex-direction: row;
  border: 1px solid ${({ $selected }) => ($selected ? 'rgba(167, 139, 250, 0.3)' : 'rgba(255, 255, 255, 0.06)')};
  border-radius: 8px;
  width: 100%;
  min-width: 0;
  min-height: 72px;
  cursor: pointer;
  padding: 12px;
  align-items: center;
  gap: 0.75rem;
  background: ${({ $selected }) => ($selected ? '#1d2232' : '#171b26')};
  color: #f8fafc;

  &:hover {
    background: #1d2232;
  }
`;

export const BadgeTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  overflow-wrap: anywhere;

  input {
    font-size: 1rem;
    font-weight: 500;
    color: #f8fafc;
    background: #0f1117;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    width: 56px;
    min-width: 0;
    padding: 8px;

    &:focus-visible {
      outline: 2px solid #a78bfa;
      outline-offset: 2px;
    }
  }
`;

export const BadgeSubTitle = styled.h2`
  color: #94a3b8;
  font-size: 1.125rem;
  font-weight: 400;
  overflow-wrap: anywhere;
`;

export const FormInput = styled.input`
  width: 100%;
  min-width: 0;
  min-height: 40px;
  padding: 8px 10px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  background: #0f1117;
  color: #f8fafc;
  color-scheme: dark;
  font-size: 16px;

  &:focus-visible {
    outline: 2px solid #a78bfa;
    outline-offset: 2px;
  }
`;

export const FormInputHeader = styled(FormInput)``;

export const MomentForm = styled.div`
  grid-column: 1 / -1;
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  max-width: 420px;
  width: 100%;

  > div {
    flex: 1;
  }
`;

export const MomentButton = styled(SimpleButton)`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 40px;
  width: 40px;
  padding: 0;
`;

export const ASide = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
`;

export const ASideTitle = styled(ASide)`
  flex: 1 1 0;
`;

export const ASideDetails = styled(ASide)`
  flex: 0 1 80px;
`;

export const ASidePosition = styled(ASide)`
  flex: 0 0 auto;
`;

export const ASideButtons = styled.div`
  flex: 0 0 auto;
  display: flex;
  gap: 0.5rem;

  i {
    width: 32px;
    height: 32px;
    background-color: #292e3d;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background-color: #3a4052;
    }
  }
`;

export const PositionText = styled.div`
  background-color: rgba(167, 139, 250, 0.18);
  color: #c4b5fd;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
