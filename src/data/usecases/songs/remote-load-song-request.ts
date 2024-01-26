import { HttpClient } from '@/data/http/http-client';
import { Song } from '@/domain/models';
import { LoadSongRequest } from '@/domain/usecases/songs/load-song-request';

export class RemoteLoadSongRequest implements LoadSongRequest {
  constructor(
    private readonly url: string,
    private readonly httpClient: HttpClient<Song>,
  ) {}

  async execute(uid: string): Promise<Song> {
    const url = `${import.meta.env.VITE_NOPALCO_API}${this.url}/${uid}`;
    const httpResponse = await this.httpClient.request({
      url,
      method: 'get',
    });

    switch (httpResponse.statusCode) {
      case 200:
        return httpResponse.body;
      case 204:
        return null;
      default:
        throw new Error('Unexpected error');
    }
  }
}
