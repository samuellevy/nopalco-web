import { Song } from '@/domain/models';

export interface UpdateSongDTO extends Partial<Omit<Song, 'content'>> {
  content?: string;
}

export interface UpdateSongRequest {
  execute: (songId: string, songData: UpdateSongDTO) => Promise<void>;
}
