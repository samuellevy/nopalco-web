import styled from 'styled-components';

type BadgeProps = {
  $variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'lightGray';
};

type CellValueProps = {
  $size?: string;
  $variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'lightGray' | 'purple';
};

type SectionTitleProps = {
  $isBold?: boolean;
  $isUnderline?: boolean;
};

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
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
  padding: 1rem 2rem;
  font-size: ${({ $size }) => ($size ? $size : `1.5rem`)};
  font-weight: bold;
`;

export const CellLabel = styled.div`
  font-size: 1.3rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
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
