import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const Page = styled.main`
  width: 100%;
  max-width: 960px;
  min-width: 0;
  margin: 0 auto;
  padding: 24px 20px 60px;
  color: #f8fafc;
`;

export const Back = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  margin-bottom: 16px;
  color: #c4b5fd;
  font-size: 14px;
  font-weight: 400;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
`;

export const Title = styled.h1`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 24px;
  font-weight: 600;
  overflow-wrap: anywhere;
  svg {
    flex-shrink: 0;
    color: #a78bfa;
  }
`;

export const Action = styled.button<{ $primary?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 8px 14px;
  border: 1px solid rgba(167, 139, 250, 0.3);
  border-radius: 6px;
  background: ${({ $primary }) => ($primary ? '#8b5cf6' : '#171b26')};
  color: #f8fafc;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
  &:focus-visible {
    outline: 2px solid #c4b5fd;
    outline-offset: 2px;
  }
`;

export const Details = styled.dl`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(167, 139, 250, 0.3);
  dt {
    margin-bottom: 6px;
    color: #94a3b8;
    font-size: 14px;
    font-weight: 400;
  }
  dd {
    color: #f8fafc;
    font-size: 16px;
    font-weight: 500;
    overflow-wrap: anywhere;
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

export const Status = styled.p`
  color: #94a3b8;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.6;
  margin-bottom: 12px;
`;

export const Error = styled(Status)`
  color: #fca5a5;
`;

export const Success = styled(Status)`
  color: #86efac;
`;

export const SectionTitle = styled.h2`
  margin: 20px 0 8px;
  color: #c4b5fd;
  font-size: 18px;
  font-weight: 600;
`;

export const GroupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 8px;

  h2 {
    margin-bottom: 0;
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 0;
  margin-bottom: 20px;
  border-top: 1px solid rgba(167, 139, 250, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

export const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 520px;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 500;
  input,
  textarea {
    width: 100%;
    min-width: 0;
    min-height: 40px;
    padding: 10px;
    border: 1px solid rgba(167, 139, 250, 0.3);
    border-radius: 6px;
    background: #171b26;
    color: #f8fafc;
    font-size: 16px;
    font-weight: 400;
  }
  textarea {
    resize: vertical;
    max-height: 240px;
  }
  input:focus-visible,
  textarea:focus-visible {
    outline: 2px solid #a78bfa;
    outline-offset: 2px;
  }
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

export const Groups = styled.ul`
  display: flex;
  flex-direction: column;
  li {
    padding: 20px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
  h2 {
    margin-bottom: 8px;
    color: #f8fafc;
    font-size: 18px;
    font-weight: 600;
    overflow-wrap: anywhere;
  }
  p {
    color: #cbd5e1;
    font-size: 15px;
    font-weight: 400;
    line-height: 1.6;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  small {
    display: block;
    margin-top: 10px;
    color: #94a3b8;
    font-size: 12px;
    font-weight: 400;
  }
`;
