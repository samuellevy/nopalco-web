import { HttpClient } from '@/data/http/http-client';
import { Song } from '@/domain/models/song';
import { CreateSongDTO, CreateSongRequest } from '@/domain/usecases/songs/create-song-request';

export class RemoteCreateSongRequest implements CreateSongRequest {
  constructor(private readonly httpClient: HttpClient<any>) {}

  async execute(songData: Partial<CreateSongDTO>): Promise<Song> {
    const url = `${window.env.API}/songs`;
    const httpResponse = await this.httpClient.request({
      url,
      method: 'post',
      body: songData,
    });

    switch (httpResponse.statusCode) {
      case 200:
      case 204:
      case 201:
        return { ...httpResponse.body, content: JSON.parse(httpResponse.body?.content) || [] };
      default:
        throw new Error('Unexpected error');
    }
  }
}
