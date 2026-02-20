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
  const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sheet) return;

    setError(null);

    fetch(`/assets/scores/${sheet}`, { method: 'HEAD' })
      .then((response) => {
        if (!response.ok) {
          setError('Sheet music not found.');
          return;
        }

        if (!ref.current || osmdRef.current) return;

        const osmd = new OpenSheetMusicDisplay(ref.current, {
          autoResize: true,
          backend: 'svg',
          drawTitle: false,
          drawComposer: false,
        });

        osmd.setOptions({
          drawPartNames: false, // remove nome lateral
          drawPartAbbreviations: false,
        });

        osmdRef.current = osmd;

        osmd
          .load(`/assets/scores/${sheet}`)
          .then(() => {
            setError(null);
            osmd.render();
          })
          .catch((err) => {
            setError('Failed to load sheet music.');
            console.error(err);
          });
      })
      .catch(() => {
        setError('Failed to check sheet music.');
      });
  }, [sheet]);

  return (
    <Container>
      {error ? (
        <div style={{ color: 'red', textAlign: 'center', padding: '20px', display: 'none' }}>{error}</div>
      ) : (
        <div className="osmd" ref={ref}></div>
      )}
    </Container>
  );
};

export default SheetMusicPage;
