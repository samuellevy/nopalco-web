import styled from 'styled-components';
import { SongList } from '@/presentation/components/songlist';

export const SearchField = styled.div`
  position: relative;
  flex: 1;
  min-width: 0;
`;

export const ClearSearchButton = styled.button`
  position: absolute;
  top: 50%;
  right: 2px;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;

  &:hover {
    color: #a78bfa;
    background: #1d2232;
  }

  &:focus-visible {
    outline: 2px solid #a78bfa;
    outline-offset: -2px;
  }
`;

export const FormInput = styled.input`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  height: 40px;
  background-color: #171b26;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #f8fafc;
  font-size: 14px;
  font-weight: 400;
  padding: 10px 40px 10px 10px;

  @media (max-width: 720px) {
    font-size: 16px;
  }

  &::placeholder {
    color: #94a3b8;
    opacity: 1;
  }

  &:focus-visible {
    border-color: #a78bfa;
    outline: 2px solid rgba(167, 139, 250, 0.25);
    outline-offset: 2px;
  }
`;

export const ModalClose = styled.button`
  flex-shrink: 0;
  background: #171b26;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 1.5rem;
  cursor: pointer;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #1d2232;
    color: #f8fafc;
  }

  &:focus-visible {
    outline: 2px solid #a78bfa;
    outline-offset: 2px;
  }
`;

export const ModalSongList = styled.div<{ $open: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  max-width: 100%;
  height: 100%;
  background-color: #0f1117;
  color: #f8fafc;
  border-top: 3px solid #a78bfa;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: -12px 0 32px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 1rem;

  transform: ${({ $open }) => ($open ? 'translateX(0)' : 'translateX(100%)')};
  transition: transform 0.3s ease-in-out;
`;

export const ModalSongListHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 2;
  flex-shrink: 0;
  min-height: 56px;
  padding: 8px 0;
  background: #0f1117;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

export const ModalSongListContent = styled.div`
  width: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  gap: 1rem;
  margin-top: 1rem;
  scrollbar-color: #343b4f #0f1117;

  ${SongList.Badge} {
    background-color: #171b26;
    color: #f8fafc;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-left: 3px solid rgba(167, 139, 250, 0.6);
    border-radius: 8px;
    box-shadow: none;

    &:hover {
      background-color: #1d2232;
      border-color: rgba(167, 139, 250, 0.4);
    }
  }

  ${SongList.BadgeTitle} {
    color: #f8fafc;
  }

  ${SongList.BadgeSubTitle} {
    color: #94a3b8;
  }
`;

export const AlphabetGroup = styled.section`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: 1rem;
  min-width: 0;
`;

export const AlphabetLetter = styled.div`
  position: sticky;
  top: 56px;
  z-index: 1;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  height: 32px;
  padding: 0 8px;
  border-bottom: 1px solid rgba(167, 139, 250, 0.3);
  background: #0f1117;
  color: #a78bfa;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0;
`;
