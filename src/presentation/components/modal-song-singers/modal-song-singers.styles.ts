import styled from 'styled-components';

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.7);
`;

export const Dialog = styled.form`
  width: 100%;
  max-width: 520px;
  max-height: calc(100dvh - 32px);
  overflow-y: auto;
  padding: 20px;
  border: 1px solid rgba(167, 139, 250, 0.3);
  border-top: 3px solid #a78bfa;
  border-radius: 8px;
  background: #171b26;
  color: #f8fafc;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
`;

export const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
`;

export const Fields = styled.fieldset`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;

  &:disabled {
    opacity: 0.7;
  }
`;

export const Row = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 80px 36px;
  align-items: end;
  gap: 8px;
`;

export const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 500;

  input {
    width: 100%;
    min-width: 0;
    height: 40px;
    padding: 6px 8px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 6px;
    background: #0f1117;
    color: #f8fafc;
    font-size: 16px;
    font-weight: 400;
  }

  input:focus-visible {
    outline: 2px solid #a78bfa;
    outline-offset: 2px;
  }
`;

export const IconButton = styled.button`
  display: grid;
  place-items: center;
  width: 36px;
  height: 40px;
  border-radius: 6px;
  color: #94a3b8;
  cursor: pointer;

  &:hover {
    background: #1d2232;
    color: #a78bfa;
  }

  &:focus-visible {
    outline: 2px solid #a78bfa;
  }
`;

export const Action = styled.button<{ $primary?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 40px;
  padding: 8px 12px;
  border: 1px solid rgba(167, 139, 250, 0.3);
  border-radius: 6px;
  background: ${({ $primary }) => $primary ? '#8b5cf6' : '#1d2232'};
  color: #f8fafc;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid #a78bfa;
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
`;

export const Error = styled.p`
  color: #fca5a5;
  font-size: 14px;
  font-weight: 400;
`;