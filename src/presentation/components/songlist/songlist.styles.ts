import styled from 'styled-components';

type BadgeProps = {
  $variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'lightGray' | 'darkGray';
};

export const Badge = styled.div<BadgeProps>`
  display: flex;
  flex-direction: row;
  border-radius: 1rem;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
  width: 100%;
  height: 10rem;
  cursor: pointer;

  ${({ theme, $variant }) =>
    $variant && `background-color: ${theme.variants[$variant].background}; color: ${theme.variants[$variant].color};`};
`;

export const BadgeTitle = styled.h1`
  font-size: 1.7rem;
  font-weight: bold;
  text-align: left;
  padding: 1rem;
`;

export const BadgeSubTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 500;
  padding: 1rem;
`;

export const ASide = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Thumbnail = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 10rem;
  height: 10rem;
  padding: 1rem;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    border-radius: 50%;
  }
`;
