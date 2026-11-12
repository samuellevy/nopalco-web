import styled from 'styled-components';
import { BottomNavigation, NavigationButton } from '@/presentation/components/song-component/song.component.styles';

const COLORS = {
  bg: '#0F1117',
  card: '#171B26',
  cardHover: '#1D2232',

  border: 'rgba(255,255,255,.06)',

  primary: '#8B5CF6',
  primaryLight: '#A78BFA',

  text: '#F8FAFC',
  textSecondary: '#94A3B8',
};

export const DuplicateOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.7);
`;

export const DuplicateDialog = styled.form`
  width: 100%;
  max-width: 460px;
  max-height: calc(100vh - 32px);
  max-height: calc(100dvh - 32px);
  overflow-y: auto;
  padding: 24px;
  border: 1px solid rgba(167, 139, 250, 0.3);
  border-top: 3px solid ${COLORS.primaryLight};
  border-radius: 8px;
  background: ${COLORS.card};
  color: ${COLORS.text};
`;

export const DuplicateTitle = styled.h2`
  margin: 0 0 20px;
  font-size: 20px;
  font-weight: 600;
`;

export const DuplicateFields = styled.fieldset`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;

  p[role='alert'] {
    color: #fca5a5;
    font-size: 14px;
    font-weight: 400;
  }

  &:disabled {
    opacity: 0.7;
  }
`;

export const DuplicateField = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  font-size: 14px;
  font-weight: 500;
  color: ${COLORS.textSecondary};

  input {
    width: 100%;
    min-width: 0;
    min-height: 40px;
    padding: 8px 10px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    background: ${COLORS.bg};
    color: ${COLORS.text};
    color-scheme: dark;
    font-size: 16px;
    font-weight: 400;
  }

  input:focus-visible {
    outline: 2px solid ${COLORS.primaryLight};
    outline-offset: 2px;
  }
`;

export const DuplicateActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
`;

export const SetlistNavigation = styled(BottomNavigation)`
  justify-content: flex-start;
  overflow-x: auto;

  > button {
    flex: 1 0 64px;
    max-width: none;
    white-space: nowrap;
  }
`;

export const EditNavigationButton = styled(NavigationButton)<{ $intent: 'save' | 'cancel' }>`
  background: ${({ $intent }) => ($intent === 'save' ? '#166534' : '#991b1b')};
  color: #fff;

  span {
    font-weight: 600;
  }

  &:hover {
    background: ${({ $intent }) => ($intent === 'save' ? '#15803d' : '#b91c1c')};
  }

  &:disabled {
    opacity: 0.55;
    cursor: wait;
  }
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  margin-bottom: 10rem;
  background: radial-gradient(circle at top right, rgba(139, 92, 246, 0.08), transparent 30%), #0f1117;
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
  letter-spacing: 0.08em;
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

export const SetlistLayout = styled.div`
  display: flex;
  width: 100%;
  min-height: 100vh;
  padding: 2rem 2.5rem;
  padding-bottom: calc(100px + env(safe-area-inset-bottom, 0px));
  gap: 2rem;
  box-sizing: border-box;
  background: ${({ theme }) => theme.colors.background};
  background: radial-gradient(circle at top right, rgba(139, 92, 246, 0.08), transparent 30%), #0f1117;
`;

export const Main = styled.main`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1120px;
  gap: 1.5rem;
`;

export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  padding: 1.5rem 1.5rem 1rem;
  /* background: rgba(255, 255, 255, 0.02); */
  /* border: 1px solid rgba(255, 255, 255, 0.08); */
  border-radius: 24px;

  @media (max-width: 720px) {
    flex-direction: column-reverse;
    align-items: stretch;
    gap: 1.5rem;
    padding: 0;
  }
`;

export const TitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
  overflow-wrap: anywhere;
`;

export const SetlistTitle = styled.h1`
  margin: 0;
  color: #fff;
  font-size: 2rem;
  font-weight: 600;
  letter-spacing: 0.08em;
`;

export const SetlistSubtitle = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.5rem;
  letter-spacing: 0.08em;
`;

export const ActionGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;

  @media (max-width: 720px) {
    flex-wrap: nowrap;
    gap: 6px;
    min-width: 0;
    overflow-x: auto;

    > button,
    > div {
      display: inline-flex;
      flex: 0 0 36px;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      padding: 0;
      border-radius: 8px;

      > span {
        display: none;
      }

      svg {
        flex-shrink: 0;
      }
    }
  }
`;

export const IconButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 26px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  color: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
`;

export const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  border-radius: 16px;
  background: ${COLORS.primaryLight};
  color: #fff;
  padding: 0.9rem 1.2rem;
  cursor: pointer;
  font-weight: 600;
`;

export const DangerButton = styled(PrimaryButton)`
  background: #cf142b;
`;

export const SetlistGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 1.5rem;
  align-items: start;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

export const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
`;

export const ItemRow = styled.div`
  position: relative;
  min-width: 0;
`;

export const RemoveItemButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  background: #171b26;
  color: #fca5a5;
  cursor: pointer;

  &:hover {
    background: rgba(248, 113, 113, 0.15);
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.primaryLight};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

export const ReplaceItemButton = styled(RemoveItemButton)`
  right: 48px;
  color: #c4b5fd;

  &:hover {
    background: rgba(167, 139, 250, 0.18);
  }

  @media (hover: none), (pointer: coarse) {
    display: none;
  }
`;

export const ItemCard = styled.button<{
  $editing?: boolean;
  $isDragging?: boolean;
  $isDragOver?: boolean;
  $isSelected?: boolean;
  draggable?: boolean;
  $linked?: boolean;
}>`
  display: grid;
  grid-template-areas: 'number content meta';
  grid-template-columns: 44px minmax(0, 1fr) auto;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 1.25rem 1.3rem;
  padding-right: ${({ $editing }) => ($editing ? '92px' : '1.3rem')};
  border-radius: 20px;
  border: 1px solid ${({ $isDragOver }) => ($isDragOver ? 'rgba(94, 60, 255, 0.5)' : 'rgba(255, 255, 255, 0.1)')};
  ${($linked) => $linked && 'border-color: transparent'};
  background: ${({ $linked, theme }) => ($linked ? theme.colors.surface : theme.colors.disabled)};
  color: #fff;
  cursor: pointer;
  outline: ${({ $isSelected }) => ($isSelected ? '2px solid #a78bfa' : 'none')};
  outline-offset: 2px;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.04);
  }

  @media (max-width: 720px) {
    grid-template-areas: 'number content' 'number meta';
    grid-template-columns: 44px minmax(0, 1fr);
    row-gap: 0.8rem;
    padding-right: 1.3rem;
  }

  @media (hover: none), (pointer: coarse) {
    padding-right: ${({ $editing }) => ($editing ? '52px' : '1.3rem')};

    @media (max-width: 720px) {
      padding-right: 1.3rem;
    }
  }
`;

export const ItemHandle = styled.div`
  display: grid;
  place-items: center;
  color: rgba(255, 255, 255, 0.55);
  flex-shrink: 0;
  cursor: grab;
`;

export const ItemNumber = styled.div`
  grid-area: number;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.85);
  font-weight: 700;
  width: 44px;
  height: 44px;
  gap: 2px;

  @media (max-width: 720px) {
    align-self: start;
  }
`;

export const ItemContent = styled.div<{ $editing?: boolean }>`
  grid-area: content;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
  overflow-wrap: anywhere;

  @media (max-width: 720px) {
    padding-right: ${({ $editing }) => ($editing ? '72px' : '0')};

    @media (hover: none), (pointer: coarse) {
      padding-right: ${({ $editing }) => ($editing ? '32px' : '0')};
    }
  }
`;

export const ItemName = styled.h2`
  margin: 0;
  font-size: 2rem;
  color: #fff;
  font-weight: 600;
  letter-spacing: 0.08em;
`;

export const ItemArtist = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.65);
  font-size: 1.5rem;
  letter-spacing: 0.08em;
`;

export const ItemMeta = styled.div`
  grid-area: meta;
  display: flex;
  min-width: 0;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: 720px) {
    justify-content: flex-start;
  }
`;

export const KeyBadge = styled.span`
  display: inline-flex;
  flex: 0 0 56px;
  align-items: center;
  justify-content: center;
  min-width: 56px;
  height: 36px;
  border-radius: 999px;
  background: ${COLORS.primaryLight};
  color: #fff;
  font-weight: 700;
  padding: 0 0.85rem;
  letter-spacing: 0.08em;
`;

export const KeyInput = styled.input`
  flex: 0 0 56px;
  width: 56px;
  max-width: 56px;
  height: 36px;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  color: #fff;
  padding: 0 6px;
  outline: none;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0;

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  &:focus {
    background: ${COLORS.primaryLight};
    border-color: ${COLORS.primary};
  }
`;

export const SingerBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  height: 36px;
  border-radius: 999px;

  background: rgba(139, 92, 246, 0.15);
  color: #ddd6fe;
  border: 1px solid rgba(167, 139, 250, 0.7);

  font-weight: 600;
  padding: 0 0.85rem;
  letter-spacing: 0.08em;
`;

export const SingerInput = styled.input`
  width: 100%;
  max-width: 140px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  color: #fff;
  padding: 0.75rem 1rem;
  outline: none;
  font-size: 1rem;
  letter-spacing: 0.08em;

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  &:focus {
    background: ${COLORS.primaryLight};
    border-color: ${COLORS.primaryLight};
  }
`;

export const SingerSelect = styled.select`
  flex: 0 1 140px;
  width: 140px;
  max-width: 140px;
  min-width: 0;
  height: 36px;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  color: #fff;
  padding: 0 8px;
  outline: none;
  font-size: 16px;
  font-weight: 400;
  cursor: pointer;
  letter-spacing: 0;

  option {
    background: #1a1a2e;
    color: #fff;
  }

  &:focus {
    background: #5e3cff;
    border-color: #5e3cff;
  }
`;

export const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const InfoCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 1.5rem;
  color: #fff;
`;

export const CardTitle = styled.h3`
  margin: 0 0 1rem;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 0.08em;
`;

export const InfoList = styled.div`
  display: grid;
  gap: 0.9rem;
`;

export const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem 0.9rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  color: rgba(255, 255, 255, 0.85);

  span {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.95rem;
  }

  strong {
    font-size: 0.95rem;
  }
`;

export const ActionCard = styled(InfoCard)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const ToolList = styled.div`
  display: grid;
  gap: 0.65rem;
`;

export const ToolItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.9rem 1rem;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
  color: #fff;
  font-size: 0.95rem;
  cursor: pointer;
  letter-spacing: 0.08em;

  svg {
    color: #8a84ff;
  }
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

  input {
    height: 40px;
    width: 100%;
    font-size: 1.5rem;
    font-weight: 500;
    color: #ffffff;
    padding: 5px 2px;
    text-align: center;
    letter-spacing: 0.08em;

    &:focus {
      outline: ${({ theme }) => theme.colors.primary};
      background-color: #ae682f;
      border-radius: 25px;
    }
  }
`;

export const BadgeSinger = styled.div`
  background-color: #4191e1;
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #fff;
  padding: 2px 10px;
  font-size: 1rem;
  letter-spacing: 0.08em;

  input {
    font-size: 1rem;
    font-weight: 500;
    color: #ffffff;
    /* padding: 5px 10px; */
    text-align: center;
    letter-spacing: 0.08em;

    &:focus {
      outline: ${({ theme }) => theme.colors.primary};
      background-color: #ae682f;
      border-radius: 25px;
    }
  }
`;

export const RightSideActions = styled.div`
  position: fixed;
  top: 2rem;
  right: 2rem;
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
  letter-spacing: 0.08em;
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

export const Button = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: white;

  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  border-radius: 16px;
  padding: 0.9rem 1.2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  letter-spacing: 0.08em;
  &:hover {
    opacity: 0.6;
  }
`;

export const NavigationFooter = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  gap: 10px;
  padding: 1rem;
  background: linear-gradient(to top, rgba(15, 17, 23, 0.98), rgba(15, 17, 23, 0.95));
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  z-index: 1000;

  @media (max-width: 720px) {
    padding: 0.75rem;
    gap: 8px;
  }
`;
