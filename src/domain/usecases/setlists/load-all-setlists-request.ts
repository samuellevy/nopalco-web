import { Setlist } from '@/domain/models/setlist';

export interface LoadAllSetlistsRequest {
  execute: (all?: boolean) => Promise<Setlist[]>;
}
