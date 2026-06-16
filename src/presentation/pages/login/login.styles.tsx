import styled from 'styled-components';

export const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: radial-gradient(circle at top, ${({ theme }) => theme.colors.grayBg} 0%, #09090d 65%, #020205 100%);
`;

export const Card = styled.div`
  width: min(100%, 420px);
  background: rgba(13, 14, 25, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 32px;
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.28);
  padding: 3rem 2.25rem;
`;

export const Topbar = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.25rem;
`;

export const IconWrapper = styled.div`
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 16px;
  background: rgba(187, 134, 252, 0.14);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.purple};
  margin: 0 auto 1.5rem;
`;

export const Title = styled.h1`
  margin: 0;
  font-size: 2.4rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.white};
  text-align: center;
`;

export const Subtitle = styled.p`
  margin: 0.85rem 0 2.2rem;
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.75;
  text-align: center;
  font-size: 1.1rem;
`;

export const Form = styled.form`
  display: grid;
  gap: 1.5rem;
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const Label = styled.label`
  color: rgba(255, 255, 255, 0.85);
  font-size: 1rem;
  font-weight: 600;
`;

export const Input = styled.input`
  width: 100%;
  min-height: 3.5rem;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: ${({ theme }) => theme.colors.white};
  font-size: 1.05rem;
  padding: 0 1rem;
  outline: none;

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.purple};
    box-shadow: 0 0 0 3px rgba(187, 134, 252, 0.12);
  }
`;

export const PasswordWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const PasswordToggle = styled.button`
  position: absolute;
  right: 1rem;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.68);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  &:hover {
    color: ${({ theme }) => theme.colors.white};
  }
`;

export const OptionsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const CheckboxLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  color: rgba(255, 255, 255, 0.85);
  font-size: 1rem;
`;

export const Checkbox = styled.input`
  width: 1rem;
  height: 1rem;
  accent-color: ${({ theme }) => theme.colors.purple};
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.06);
`;

export const ForgotLink = styled.a`
  color: ${({ theme }) => theme.colors.purple};
  font-size: 1rem;
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.colors.white};
  }
`;

export const Error = styled.span`
  color: ${({ theme }) => theme.colors.warning};
  font-size: 1rem;
  text-align: left;
`;

export const SubmitButton = styled.button`
  width: 100%;
  min-height: 3.5rem;
  border-radius: 18px;
  border: none;
  cursor: pointer;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  font-size: 1.1rem;
  font-weight: 700;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    transform: translateY(-1px);
  }
`;
