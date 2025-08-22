import { HttpClient } from '@/data/http/http-client';
import { UpdateSongDTO, UpdateSongRequest } from '@/domain/usecases/songs/update-song-request';

export class RemoteUpdateSongRequest implements UpdateSongRequest {
  constructor(private readonly httpClient: HttpClient<any>) {}

  async execute(songId: string, songData: Partial<UpdateSongDTO>): Promise<void> {
    const url = `${window.env.API}/songs/${songId}`;
    const httpResponse = await this.httpClient.request({
      url,
      method: 'patch',
      body: songData,
    });

    switch (httpResponse.statusCode) {
      case 200:
        return { ...httpResponse.body, content: JSON.parse(httpResponse.body?.content) || [] };
      case 204:
        return null;
      default:
        throw new Error('Unexpected error');
    }
  }
}
