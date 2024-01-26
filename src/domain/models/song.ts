export interface Content {
  block: string;
  notes: (string | [string, string])[];
}

export interface Version {
  name: string;
  content: Content[];
}

export interface Song {
  uid: string;
  mashup: string;
  name: string;
  author: string;
  bpm: string;
  key: string;
  timeSignature: string;
  rhythm: string;
  duration: string;
  versions: Version[];
  imageUrl: string;
}
