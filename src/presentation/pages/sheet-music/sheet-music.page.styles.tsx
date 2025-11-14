import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  color: #ffffff;
  filter: invert(1);
  /* min-width: 1200px; */
  width: 100%;
  overflow-x: auto;

  .osmd {
    fill: tomato !important;

    .vf-tabnote {
      rect {
        stroke: #e4e4e0 !important;
        fill: #e4e4e0 !important;
        background-color: #e4e4e0 !important;
      }
      text {
        fill: #000;
        stroke: #000;
      }
    }
  }
`;

export const SheetBox = styled.div`
  background: white; /* fundo preto */
  filter: invert(1);
`;
