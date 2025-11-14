import React, { useEffect, useRef } from 'react';
import { Annotation, Formatter, Renderer, Stave, StaveNote, Voice } from 'vexflow';
import { SheetBox } from './sheet-music.page.styles';
import { Song, Content } from '@/domain/models';

type Props = {
  song: Song;
};

const SheetMusicPage: React.FC<Props> = ({ song }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!song.content) return;

    const div = ref.current;
    div!.innerHTML = '';

    const renderer = new Renderer(div!, Renderer.Backends.SVG);
    renderer.resize(800, 400);
    const ctx = renderer.getContext();

    const beatsPerMeasure = 2; // 2/4
    const beatValue = 4; // semínima = 1 batida
    const measureWidth = 200;
    const maxX = 1600;
    const lineHeight = 120;

    let x = 10;
    let y = 40;

    // junta todas as notas de todos os blocos
    const allNotes: string[] = [];
    song.content.forEach((block: Content) => {
      allNotes.push(...(block.notes as string[]));
    });

    // substitui '%' pelo último acorde real
    const notesWithKeys: string[] = [];
    let lastKey = 'C';
    allNotes.forEach((n) => {
      if (n === '%') {
        notesWithKeys.push(lastKey);
      } else {
        lastKey = n;
        notesWithKeys.push(n);
      }
    });

    // divide em compassos
    for (let i = 0; i < notesWithKeys.length; i += beatsPerMeasure) {
      const measureNotesData = notesWithKeys.slice(i, i + beatsPerMeasure);

      // se tiver menos de beatsPerMeasure, adiciona rest
      while (measureNotesData.length < beatsPerMeasure) {
        measureNotesData.push('rest');
      }

      // cria stave
      const stave = new Stave(x, y, measureWidth);
      if (i === 0) {
        stave.addClef('treble').addTimeSignature(`${beatsPerMeasure}/4`);
      }
      stave.setContext(ctx).draw();

      // cria notas para o compasso
      const staveNotes = measureNotesData.map((key) => {
        if (key === 'rest') {
          return new StaveNote({ keys: ['b/4'], duration: 'qr' }); // semínima de descanso
        }
        return new StaveNote({ keys: ['b/4'], duration: 'q' }).addModifier(
          new Annotation(key).setFont('Arial', 14).setVerticalJustification(Annotation.VerticalJustify.TOP),
          0,
        );
      });

      // cria voice e adiciona notas
      const voice = new Voice({ numBeats: beatsPerMeasure, beatValue: beatValue });
      voice.addTickables(staveNotes);

      // formata e desenha
      new Formatter().joinVoices([voice]).format([voice], measureWidth - 20);
      voice.draw(ctx, stave);

      // avança posição
      x += measureWidth;
      if (x + measureWidth > maxX) {
        x = 10;
        y += lineHeight;
      }
    }
  }, [song]);

  return <SheetBox ref={ref} />;
};

export default SheetMusicPage;
