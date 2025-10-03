import { SetlistItem } from '@/domain/models/setlist';

export interface CreateSetlistSongDTO {
  pureTitle: string;
  songId: string | null;
  order: string;
  key: string;
}

export interface CreateSetlistDTO {
  name: string;
  description: string;
  items: CreateSetlistSongDTO[];
  address?: string;
  date?: Date;
}

export interface CreateSetlistRequest {
  execute: (body: CreateSetlistDTO) => Promise<SetlistItem>;
}
