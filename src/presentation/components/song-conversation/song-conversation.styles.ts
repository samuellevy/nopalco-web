import styled from 'styled-components';

export const Conversation = styled.section`
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const History = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
`;

export const Messages = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const Message = styled.article<{ $own: boolean }>`
  width: fit-content;
  max-width: 100%;
  align-self: ${({ $own }) => ($own ? 'flex-end' : 'flex-start')};
  padding: 12px 16px;
  border-left: 3px solid #a78bfa;
  border-radius: 6px;
  background: #171b26;
`;

export const MessageHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 20px;
  margin-bottom: 8px;

  time {
    color: #94a3b8;
    font-size: 12px;
    font-weight: 400;
  }
`;

export const Author = styled.span`
  color: #c4b5fd;
  font-size: 13px;
  font-weight: 600;
  overflow-wrap: anywhere;
`;

export const Text = styled.p`
  color: #e6e8ed;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.7;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
`;

export const Status = styled.p`
  color: #94a3b8;
  font-size: 14px;
  font-weight: 400;
`;

export const Error = styled(Status)`
  color: #fca5a5;
`;

export const Composer = styled.form`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
`;

export const Input = styled.textarea`
  width: 100%;
  min-width: 0;
  min-height: 88px;
  max-height: 280px;
  resize: vertical;
  padding: 12px;
  border: 1px solid rgba(167, 139, 250, 0.3);
  border-radius: 6px;
  background: #171b26;
  color: #f8fafc;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.6;

  &:focus-visible {
    outline: 2px solid #a78bfa;
    outline-offset: 2px;
  }
`;

export const Action = styled.button`
  display: inline-flex;
  align-items: center;
  align-self: flex-end;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 8px 16px;
  border-radius: 6px;
  background: #8b5cf6;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid #c4b5fd;
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;
