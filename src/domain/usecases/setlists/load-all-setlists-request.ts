import { Setlist } from '@/domain/models/setlist';

export interface LoadAllSetlistsRequest {
  execute: () => Promise<Setlist[]>;
}
