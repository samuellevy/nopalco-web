import styled from 'styled-components';

type BadgeProps = {
  $variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'lightGray' | 'darkGray' | 'disabled';
};

export const Badge = styled.div<BadgeProps>`
  display: flex;
  flex-direction: row;
  border-radius: 1rem;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
  width: 100%;
  height: 10rem;
  cursor: pointer;
  padding: 1rem;

  ${({ theme, $variant }) =>
    $variant && `background-color: ${theme.variants[$variant].background}; color: ${theme.variants[$variant].color};`};
`;

export const BadgeTitle = styled.h1`
  font-size: 1.5rem;
  line-height: 1.5rem;
  font-weight: bold;
  text-align: left;
  padding: 1rem;
  overflow-x: hidden;
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
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;

  img {
    max-width: 85%;
    max-height: 85%;
    object-fit: contain;
    object-position: center;
    border-radius: 50%;
  }
`;
