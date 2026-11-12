import styled from 'styled-components';

export const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  max-width: 360px;
  min-width: 0;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 500;
`;

export const Select = styled.select`
  width: 100%;
  min-width: 0;
  min-height: 40px;
  padding: 8px 10px;
  border: 1px solid rgba(167, 139, 250, 0.3);
  border-radius: 6px;
  background: #171b26;
  color: #f8fafc;
  color-scheme: dark;
  font-size: 16px;
  font-weight: 400;
  &:focus-visible {
    outline: 2px solid #a78bfa;
    outline-offset: 2px;
  }
`;

export const Error = styled.span`
  color: #fca5a5;
  font-size: 13px;
  font-weight: 400;
`;
