export interface SetlistUpdateDTO {
  name?: string;
  description?: string;
  address?: string;
  date?: string | Date;
  items?: {
    id?: string;
    songId: string;
    order: number;
    key?: string;
    pureTitle?: string;
  }[];
}

export interface UpdateSetlistRequest {
  execute: (setlistId: string, setlistData: SetlistUpdateDTO) => Promise<void>;
}
