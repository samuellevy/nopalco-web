import styled from 'styled-components';

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
`;

export const TitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

export const SetlistTitle = styled.h1`
  margin: 0;
  color: #fff;
  font-size: 2rem;
  font-weight: 600;
`;

export const SetlistSubtitle = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.5rem;
`;

export const ActionGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
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

export const ItemCard = styled.button<{
  $isDragging?: boolean;
  $isDragOver?: boolean;
  draggable?: boolean;
  $linked?: boolean;
}>`
  display: grid;
  grid-template-columns: ${(props) => (props.draggable ? '52px 52px 1fr 1fr' : '52px 1fr 1fr')};
  gap: 1rem;
  width: 100%;
  padding: 1.25rem 1.3rem;
  border-radius: 20px;
  border: 1px solid ${({ $isDragOver }) => ($isDragOver ? 'rgba(94, 60, 255, 0.5)' : 'rgba(255, 255, 255, 0.1)')};
  ${($linked) => $linked && 'border-color: transparent'};
  background: ${({ $linked, theme }) => ($linked ? theme.colors.surface : theme.colors.disabled)};
  color: #fff;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.04);
  }

  @media (max-width: 720px) {
    grid-template-columns: 40px auto;
    grid-template-rows: auto auto;
    align-items: start;
  }
`;

export const ItemHandle = styled.div`
  display: grid;
  place-items: center;
  color: rgba(255, 255, 255, 0.55);
`;

export const ItemNumber = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.85);
  font-weight: 700;
  width: 44px;
  height: 44px;
`;

export const ItemContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
`;

export const ItemName = styled.h2`
  margin: 0;
  font-size: 2rem;
  color: #fff;
  font-weight: 600;
`;

export const ItemArtist = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.65);
  font-size: 1.5rem;
`;

export const ItemMeta = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: 720px) {
    justify-content: flex-start;
    width: 100%;
  }
`;

export const KeyBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 56px;
  height: 36px;
  border-radius: 999px;
  background: ${COLORS.primaryLight};
  color: #fff;
  font-weight: 700;
  padding: 0 0.85rem;
`;

export const KeyInput = styled.input`
  width: 100%;
  max-width: 52px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  color: #fff;
  padding: 0.75rem 1rem;
  outline: none;
  text-align: center;
  font-size: 1.5rem;

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

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  &:focus {
    background: ${COLORS.primaryLight};
    border-color: ${COLORS.primaryLight};
  }
`;

export const SingerSelect = styled.select`
  width: 100%;
  max-width: 140px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  color: #fff;
  padding: 0.75rem 1rem;
  outline: none;
  font-size: 1rem;
  cursor: pointer;

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

  input {
    font-size: 1rem;
    font-weight: 500;
    color: #ffffff;
    /* padding: 5px 10px; */
    text-align: center;

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

  &:hover {
    opacity: 0.6;
  }
`;
