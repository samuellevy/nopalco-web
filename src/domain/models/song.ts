export interface Content {
  block: string;
  notes: (string | [string, string])[];
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
  new?: boolean;
}
