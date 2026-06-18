import { Song } from './song';

export interface Singer {
  id: string;
  name: string;
  key?: string;
}

export interface SetlistItem {
  id: string;
  order: number;
  song: Song;
  key?: string;
  singer?: Singer;
  pureTitle?: string;
  pureAuthor?: string;
}

export interface Setlist {
  id: string;
  name: string;
  description: string;
  address: string;
  date?: Date;
  order?: number;
  items: SetlistItem[];
}
