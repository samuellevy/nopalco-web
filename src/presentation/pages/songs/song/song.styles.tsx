import styled, { keyframes } from 'styled-components';

type BadgeProps = {
  $variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'lightGray';
};

type CellValueProps = {
  $size?: string;
  $variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'lightGray' | 'purple';
  hidden?: boolean;
};

type SectionTitleProps = {
  $isBold?: boolean;
  $isUnderline?: boolean;
};

type ContainerProps = {
  minified?: boolean;
};

export const Container = styled.div<ContainerProps>`
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: all 0.2s ease-in-out;

  ${({ minified }) => (minified ? 'transform: scale(0.8) translate(-17%, -14%);' : '')}
`;

/** Header */
export const Header = styled.header``;

export const FlexColumn = styled.header`
  display: flex;
  flex-direction: column;
`;

export const FlexRow = styled.header`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 5rem 1rem;
  height: 3rem;
`;

export const Title = styled.h1`
  font-size: 1.6rem;
  font-weight: bold;
`;

export const Author = styled.h1`
  font-size: 1.6rem;
  font-weight: normal;
  margin: 0.6rem 0;
  color: ${({ theme }) => theme.colors.gray};
`;

/** END Header */

/* CELL */
export const Cell = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

export const CellValue = styled.div<CellValueProps>`
  background-color: ${({ theme, $variant }) => ($variant ? theme.colors[$variant] : theme.colors.grayBg)};
  width: 100%;
  text-align: center;
  padding: 1rem 1rem;
  font-size: ${({ $size }) => ($size ? $size : `1.5rem`)};
  font-weight: bold;
  display: ${({ hidden }) => (hidden ? 'none' : 'flex')};
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
`;

export const CellLabel = styled.div`
  font-size: 1.3rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  min-height: 25px;
`;
/** END CELL */

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  gap: 1.6rem;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
`;

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const SectionTitle = styled.h1<SectionTitleProps>`
  font-size: 1.5rem;
  margin-bottom: 1.2rem;
  color: ${({ theme, $isBold }) => ($isBold ? theme.colors.white : theme.colors.gray)};
  font-weight: ${({ $isBold }) => ($isBold ? 'bold' : 'normal')};
  text-decoration: ${({ $isUnderline }) => ($isUnderline ? 'underline' : 'normal')};
`;

export const SectionContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 2rem;
`;

export const Badge = styled.div<BadgeProps>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  border-radius: 25%;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
  width: 10rem;
  height: 10rem;
  padding: 1rem;

  ${({ theme, $variant }) =>
    $variant && `background-color: ${theme.variants[$variant].background}; color: ${theme.variants[$variant].color};`};
`;

export const BadgeTitle = styled.h1`
  font-size: 3rem;
  font-weight: bold;
`;

export const BadgeSubTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 500;
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
  text-align: center;
  transform: translateY(0);
  transition:
    transform 150ms,
    box-shadow 150ms;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
`;

interface BlinkingDivProps {
  bpm: number;
  active?: boolean;
}

// Função que converte BPM para duração da animação (em segundos)
const calculateDuration = (bpm: number) => 60 / bpm;

// Definindo a animação de piscar
const blink = keyframes`
  0% { background-color: #ff6347; }   /* Tomate */
  49.9% { background-color: #1f1f1f; } /* Tomate */
  50% { background-color: #1f1f1f; }     /* Branco */
  100% { background-color: #1f1f1f; }     /* Branco */
`;

// Componente estilizado com animação dinâmica
export const BlinkingDiv = styled.div<BlinkingDivProps>`
  background-color: ${({ theme }) => theme.colors.grayBg};
  width: 100%;
  text-align: center;
  padding: 1rem 1rem;
  font-size: 1.2rem;
  font-weight: bold;
  display: ${({ active }) => (active ? 'flex' : 'none')};
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  background-color: #ff6347; /* Tomate */
  animation: ${blink} ${({ bpm }) => calculateDuration(bpm)}s infinite;
`;
