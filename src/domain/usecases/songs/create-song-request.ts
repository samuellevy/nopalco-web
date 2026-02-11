import { Song } from '@/domain/models';

export interface CreateSongDTO extends Partial<Omit<Song, 'content'>> {
  content?: string;
}

export interface CreateSongRequest {
  execute: (songData: CreateSongDTO) => Promise<Song>;
}
