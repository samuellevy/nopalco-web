import { Song } from '@/domain/models/song';

export interface LoadAllSongsRequestResult<T> {
  page: number;
  pageSize: number;
  totalRows: number;
  songs: T;
}

export interface LoadAllSongsRequest {
  execute: () => Promise<LoadAllSongsRequestResult<Song[]>>;
}
