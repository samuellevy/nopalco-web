import React from 'react';
import styled, { keyframes } from 'styled-components';

interface BpmBoxProps {
  bpm: number;
}

// Função que converte BPM para a duração da animação (em segundos)
const calculateDuration = (bpm: number) => (60 / bpm) * 4;

// Definindo a animação que move a cor laranja de um bloco para outro
const moveColor = keyframes`
  0%, 25% { background-color: #ff6347; }   /* Primeiro bloco laranja */
  25%, 50% { background-color: #fff; }     /* Branco */
  50%, 75% { background-color: #fff; }     /* Branco */
  75%, 100% { background-color: #fff; }    /* Branco */
`;

// Cada bloco terá uma animação com tempo de atraso diferente
const Block = styled.div<{ index: number; duration: number }>`
  width: 100px;
  height: 100px;
  background-color: #fff;
  animation: ${moveColor} ${({ duration }) => duration}s linear infinite;
  animation-delay: ${({ index, duration }) => (index * duration) / 4}s;
  display: inline-block;
  border: 1px solid #000;
`;

// Contêiner para os 4 blocos
const BlockContainer = styled.div`
  display: flex;
  gap: 10px;
`;

// Componente BpmBox que recebe o BPM e ajusta a animação
const BpmBox: React.FC<BpmBoxProps> = ({ bpm }) => {
  const duration = calculateDuration(bpm);

  return (
    <BlockContainer>
      {[0, 1, 2, 3].map((i) => (
        <Block key={i} index={i} duration={duration} />
      ))}
    </BlockContainer>
  );
};

export default BpmBox;
