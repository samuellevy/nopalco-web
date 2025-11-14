import { useEffect, useRef } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import { Song } from '@/domain/models';
import { Container } from './sheet-music.page.styles';

type Props = {
  song?: Song;
  sheet?: string;
};

const SheetMusicPage: React.FC<Props> = ({ song, sheet }) => {
  const ref = useRef<HTMLDivElement>(null);
  const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);

  useEffect(() => {
    if (!ref.current || osmdRef.current) return; // ✅ evita duplicar

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

    osmd.load(`/scores/${sheet}`).then(() => osmd.render());
  }, [sheet]);

  return (
    <Container>
      <div className="osmd" ref={ref}></div>
    </Container>
  );
};

export default SheetMusicPage;
