import { HttpClient } from '@/data/http/http-client';
import { Song } from '@/domain/models';
import { LoadAllSongsRequest, LoadAllSongsRequestResult } from '@/domain/usecases';

export class RemoteLoadAllSongsRequest implements LoadAllSongsRequest {
  constructor(
    private readonly url: string,
    private readonly httpClient: HttpClient<LoadAllSongsRequestResult<Song[]>>,
  ) {}

  async execute(): Promise<LoadAllSongsRequestResult<Song[]>> {
    const url = `${import.meta.env.VITE_NOPALCO_API}${this.url}`;
    const httpResponse = await this.httpClient.request({
      url,
      method: 'get',
    });

    switch (httpResponse.statusCode) {
      case 200:
        return {
          page: httpResponse.body.page,
          pageSize: httpResponse.body.pageSize,
          totalRows: httpResponse.body.totalRows,
          songs: httpResponse.body.songs.map((item: any) => {
            const mappedItem: Song = { ...item, imageUrl: item!.image_url };

            return mappedItem;
          }),
        };
      case 204:
        return null;
      default:
        throw new Error('Unexpected error');
    }
  }
}
