import { HttpClient } from '@/data/http/http-client';
import { UpdateSongDTO, UpdateSongRequest } from '@/domain/usecases/songs/update-song-request';
import { Song } from '@/domain/models';

export class RemoteUpdateSongRequest implements UpdateSongRequest {
  constructor(private readonly httpClient: HttpClient<any>) { }

  async execute(songId: string, songData: Partial<UpdateSongDTO>): Promise<Song | void> {
    const url = `${window.env.API}/songs/${songId}`;
    const httpResponse = await this.httpClient.request({
      url,
      method: 'patch',
      body: songData,
    });

    switch (httpResponse.statusCode) {
      case 200:
        return {
          ...httpResponse.body,
          content: typeof httpResponse.body?.content === 'string'
            ? JSON.parse(httpResponse.body.content)
            : httpResponse.body?.content || [],
        };
      case 204:
        return null;
      default:
        throw new Error('Unexpected error');
    }
  }
}
