import { Setlist } from '@/domain/models/setlist';

export interface LoadSetlistRequest {
  execute: (uid: string) => Promise<Setlist>;
}
