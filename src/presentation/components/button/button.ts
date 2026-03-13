import styled from 'styled-components';

type BadgeProps = {
  $variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'lightGray' | 'darkGray' | 'lucide';
};

export const ButtonComponent = styled.button<BadgeProps>`
  margin: 20px 0;
  background-color: #06f;
  border: none;
  border-radius: 4px;
  box-shadow: rgba(0, 0, 0, 0.1) 0 2px 4px 0;
  box-sizing: border-box;
  color: #fff;
  cursor: pointer;
  font-size: 1.2rem;
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

  ${({ theme, $variant }) =>
    $variant && `background-color: ${theme.variants[$variant].background}; color: ${theme.variants[$variant].color};`};
`;
