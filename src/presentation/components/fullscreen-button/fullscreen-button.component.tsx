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
    <S.Button type="button" title="Tela cheia" aria-label="Tela cheia" onClick={() => goFullscreen()}>
      <ExpandIcon aria-hidden="true" />
    </S.Button>
  );
};

export default FullscreenButtonComponent;
