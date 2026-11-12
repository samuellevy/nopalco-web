import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';

export const Bar = styled.header<{ $inline?: boolean }>`
  position: ${({ $inline }) => ($inline ? 'relative' : 'sticky')};
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  min-height: ${({ $inline }) => ($inline ? '40px' : '56px')};
  padding: ${({ $inline }) => ($inline ? '0' : '8px 16px')};
  border-bottom: ${({ $inline }) => ($inline ? 'none' : '1px solid rgba(255, 255, 255, 0.06)')};
  background: ${({ $inline }) => ($inline ? 'transparent' : '#0f1117')};
`;

export const Container = styled.div`
  position: relative;
  max-width: 100%;
`;

export const Trigger = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  max-width: 100%;
  padding: 8px 10px;
  border: 1px solid rgba(167, 139, 250, 0.3);
  border-radius: 6px;
  background: #171b26;
  color: #c4b5fd;
  cursor: pointer;

  span {
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 14px;
    font-weight: 500;
  }

  &:focus-visible {
    outline: 2px solid #a78bfa;
    outline-offset: 2px;
  }

  @media (max-width: 720px) {
    span {
      display: none;
    }
  }
`;

export const Menu = styled.nav`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 250px;
  max-width: calc(100vw - 32px);
  padding: 6px;
  border: 1px solid rgba(167, 139, 250, 0.3);
  border-top: 2px solid #a78bfa;
  border-radius: 8px;
  background: #171b26;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
`;

const menuItemStyles = css`
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 10px;
  border-radius: 6px;
  color: #f8fafc;
  font-size: 14px;
  font-weight: 400;

  svg {
    flex-shrink: 0;
    color: #c4b5fd;
  }
  &:hover,
  &:focus-visible {
    background: #1d2232;
    outline: 1px solid #a78bfa;
  }
`;

export const Item = styled(Link)`
  ${menuItemStyles}
`;

export const MenuAction = styled.button`
  ${menuItemStyles}
  width: 100%;
  background: transparent;
  text-align: left;
  cursor: pointer;
`;
