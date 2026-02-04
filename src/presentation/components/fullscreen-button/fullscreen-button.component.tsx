import * as S from './fullscreen-button.component.styles';
import { ExpandIcon } from 'lucide-react';

const FullscreenButtonComponent = () => {
  const goFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      }
    }
  };

  return (
    <S.Button onClick={() => goFullscreen()}>
      <ExpandIcon />
    </S.Button>
  );
};

export default FullscreenButtonComponent;
