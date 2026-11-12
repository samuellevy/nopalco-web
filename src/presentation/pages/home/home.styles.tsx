import styled from 'styled-components';
import * as DS from '@/presentation/components/ds/ds.styles';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1120px;
  min-width: 0;
  margin: 0 auto;
  padding: 24px 24px 60px;
  gap: 24px;
  color: #f8fafc;

  @media (max-width: 600px) {
    padding: 16px 16px 40px;
    gap: 20px;
  }
`;

/** Header */
export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;

  @media (max-width: 600px) {
    flex-direction: column-reverse;
    align-items: stretch;
  }
`;

export const Title = styled.h1`
  margin: 0;
  font-size: 24px;
  line-height: 1.3;
  font-weight: 600;
  letter-spacing: 0;
`;

export const UserAvatar = styled.img`
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
`;

export const FilterFlag = styled.label`
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 8px;
  min-height: 40px;
  color: #c4b5fd;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  input {
    appearance: auto;
    width: 18px;
    height: 18px;
    accent-color: #a78bfa;
    cursor: pointer;
  }

  input:focus-visible {
    outline: 2px solid #a78bfa;
    outline-offset: 3px;
  }
`;

export const UserNavigation = styled.nav`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-shrink: 0;

  > button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    flex-shrink: 0;
    min-width: 40px;
    height: 40px;
    padding: 8px;
    border: 1px solid rgba(167, 139, 250, 0.3);
    border-radius: 6px;
    background: #171b26;
    color: #c4b5fd;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0;

    svg {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }
    &:hover {
      background: #1d2232;
      opacity: 1;
    }
    &:focus-visible {
      outline: 2px solid #a78bfa;
      outline-offset: 2px;
    }
  }
`;

export const Status = styled.p`
  color: #94a3b8;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.6;
`;

export const Error = styled(Status)`
  color: #fca5a5;
`;

export const LoadState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
`;

export const SetlistList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  gap: 10px;
`;

export const SetlistCard = styled(DS.ItemCard)`
  grid-template-columns: 40px minmax(0, 1fr) 20px;
  align-items: center;
  gap: 14px;
  min-height: 84px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: #171b26;
  text-align: left;

  > svg {
    color: #a78bfa;
  }
  &:hover {
    background: #1d2232;
    border-color: rgba(167, 139, 250, 0.45);
  }
  &:focus-visible {
    outline: 2px solid #a78bfa;
    outline-offset: 2px;
  }

  @media (max-width: 720px) {
    grid-template-columns: 40px minmax(0, 1fr) 20px;
    grid-template-rows: auto;
    align-items: center;
    gap: 10px;
    padding: 14px 12px;
  }
`;

export const SetlistNumber = styled(DS.ItemNumber)`
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background: rgba(167, 139, 250, 0.1);
  color: #c4b5fd;
  font-size: 14px;
  letter-spacing: 0;
`;

export const SetlistName = styled(DS.ItemName)`
  margin-bottom: 6px;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.35;
  letter-spacing: 0;
  overflow-wrap: anywhere;
`;

export const EventMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  color: #94a3b8;
  letter-spacing: 0;
`;

export const MetaEntry = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.5;
  overflow-wrap: anywhere;
  svg {
    flex-shrink: 0;
  }
  time {
    font: inherit;
  }
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
  letter-spacing: 0.08em;
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
