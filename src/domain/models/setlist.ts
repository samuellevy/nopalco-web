import { Song } from './song';

export interface SetlistItem {
  id: string;
  order: number;
  song: Song;
  key?: string;
  pureTitle?: string;
  pureAuthor?: string;
}

export interface Setlist {
  id: string;
  name: string;
  description: string;
  address: string;
  date?: Date;
  items: SetlistItem[];
}
