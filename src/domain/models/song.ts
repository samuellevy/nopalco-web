import { Singer } from './setlist';

export interface Content {
  block: string;
  notes: (string | [string, string])[];
  score?: string;
  obs?: string;
}

export interface Song {
  uid?: string;
  id?: string;
  name: string;
  author?: string;
  bpm?: string;
  key?: string;
  rhythm?: string;
  duration?: string;
  imageUrl?: string;
  content?: Content[];
  lyrics?: string;
  new?: boolean;
  singers?: Singer[];
}
