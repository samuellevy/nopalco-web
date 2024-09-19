import styled from 'styled-components';

type BadgeProps = {
  $variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'lightGray' | 'darkGray';
};

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
  cursor: pointer;

  ${({ theme, $variant }) =>
    $variant && `background-color: ${theme.variants[$variant].background}; color: ${theme.variants[$variant].color};`};
`;

export const BadgeTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
`;

export const BadgeSubTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 500;
`;
