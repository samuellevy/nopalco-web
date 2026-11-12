import { Song } from '@/domain/models';

export interface UpdateSongDTO extends Partial<Omit<Song, 'content' | 'singers'>> {
  content?: string;
  singers?: { id?: string; name: string; key: string }[];
}

export interface UpdateSongRequest {
  execute: (songId: string, songData: UpdateSongDTO) => Promise<Song | void>;
}
