import { useEffect, useRef, useState } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import { Song } from '@/domain/models';
import { Container } from './sheet-music.page.styles';

type Props = {
  song?: Song;
  sheet?: string;
};

const SheetMusicPage: React.FC<Props> = ({ sheet }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sheet) return;

    let cancelled = false;
    setError(null);
    const filename = encodeURIComponent(sheet);
    const apiUrl = `${window.env.API}/scores/${filename}`;

    const load = async () => {
      let url = `/assets/scores/${filename}`;
      const response = await fetch(apiUrl, { method: 'HEAD' }).catch(() => null);
      if (response?.ok) url = apiUrl;
      if (cancelled || !ref.current) return;
      ref.current.replaceChildren();
      const osmd = new OpenSheetMusicDisplay(ref.current, {
        autoResize: true,
        backend: 'svg',
        drawTitle: false,
        drawComposer: false,
      });
      osmd.setOptions({ drawPartNames: false, drawPartAbbreviations: false });
      try {
        await osmd.load(url);
        if (!cancelled) osmd.render();
      } catch (err) {
        if (!cancelled) setError('Não foi possível carregar a partitura.');
        console.error(err);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [sheet]);

  return (
    <Container>
      {error && <div role="alert">{error}</div>}
      <div className="osmd" ref={ref}></div>
    </Container>
  );
};

export default SheetMusicPage;
