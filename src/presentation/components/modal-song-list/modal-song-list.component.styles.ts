import styled from 'styled-components';

//place holder white
export const FormInput = styled.input`
  background-color: #4191e1;
  color: white;
  font-size: 14px;
  padding: 10px;
  &::placeholder {
    color: white;
    opacity: 0.8; /* opcional — deixa o texto do placeholder um pouco mais suave */
  }
`;

export const ModalClose = styled.button`
  background: #444444;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ModalSongList = styled.div<{ $open: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100%;
  background-color: ${({ theme }) => theme.variants.lucide.screenBackground};
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 1rem;

  transform: ${({ $open }) => ($open ? 'translateX(0)' : 'translateX(100%)')};
  transition: transform 0.3s ease-in-out;
`;

export const ModalSongListHeader = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const ModalSongListContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  gap: 1rem;
  margin-top: 1rem;
`;
