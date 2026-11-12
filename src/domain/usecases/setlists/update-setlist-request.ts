export interface SetlistUpdateDTO {
  name?: string;
  description?: string;
  address?: string;
  date?: string | Date;
  groupId?: string | null;
  items?: {
    id?: string;
    songId: string;
    order: number;
    key?: string;
    singerId?: string;
    pureTitle?: string;
  }[];
}

export interface UpdateSetlistRequest {
  execute: (setlistId: string, setlistData: SetlistUpdateDTO) => Promise<void>;
}
