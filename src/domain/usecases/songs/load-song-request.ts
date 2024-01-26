import { Song } from '@/domain/models/song';

export interface LoadSongRequest {
  execute: (uid: string) => Promise<Song>;
}
