import styled from 'styled-components';

export const Surface = styled.div<{ $editing: boolean }>`
  width: 100%;
  min-width: 0;
  border: ${({ $editing }) => ($editing ? '1px solid rgba(167, 139, 250, 0.4)' : 'none')};
  border-radius: 6px;
  background: ${({ $editing }) => ($editing ? '#171b26' : 'transparent')};

  &:focus-within {
    outline: ${({ $editing }) => ($editing ? '2px solid #a78bfa' : 'none')};
    outline-offset: 2px;
  }
`;

export const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px;
  border-bottom: 1px solid rgba(167, 139, 250, 0.2);
`;

export const Tool = styled.button`
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  background: #1d2232;
  color: #e6e8ed;
  cursor: pointer;
  &[aria-pressed='true'] {
    background: #8b5cf6;
    color: #fff;
  }
  &:hover:not(:disabled) {
    border-color: #a78bfa;
  }
  &:focus-visible {
    outline: 2px solid #c4b5fd;
    outline-offset: 2px;
  }
  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

export const Content = styled.div<{ $editing: boolean }>`
  .tiptap {
    min-height: ${({ $editing }) => ($editing ? '360px' : '0')};
    padding: ${({ $editing }) => ($editing ? '16px' : '0')};
    outline: none;
    color: #e6e8ed;
    font-size: 20px;
    font-weight: 400;
    line-height: 1.75;
    letter-spacing: 0;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
    text-align: left;
  }

  .tiptap * {
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
    font-style: inherit;
    line-height: inherit;
  }
  .tiptap p {
    margin: 0;
    min-height: 1.75em;
  }
  .tiptap strong {
    font-weight: 700;
  }
  .tiptap em {
    font-style: italic;
  }
  .tiptap u {
    text-decoration: underline;
  }
  .tiptap s {
    text-decoration: line-through;
  }
  .tiptap ul,
  .tiptap ol {
    margin: 4px 0;
    padding-left: 1.5em;
  }
  .tiptap ul {
    list-style: disc;
  }
  .tiptap ol {
    list-style: decimal;
  }
  .tiptap li {
    list-style: inherit;
  }
  .tiptap li::marker {
    color: #a78bfa;
  }

  .tiptap blockquote {
    margin: 8px 0;
    padding-left: 1em;
    border-left: 3px solid #a78bfa;
  }

  @media (max-width: 600px) {
    .tiptap {
      font-size: 18px;
    }
  }
`;
