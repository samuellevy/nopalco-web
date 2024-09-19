import { HttpClient } from '@/data/http/http-client';
import { ArtistData, GetArtistData } from '@/domain/usecases/songs/get-artist-data-request';

export class RemoteGetArtistDataRequest implements GetArtistData {
  constructor(private readonly httpClient: HttpClient<any>) {}

  async execute(): Promise<ArtistData> {
    const url = `https://api.spotify.com/v1/search`;
    const httpResponse = await this.httpClient.request({
      url,
      params: {
        q: 'Zeca Baleiro',
        type: 'artist',
        limit: 1,
      },
      method: 'get',
    });

    switch (httpResponse.statusCode) {
      case 200:
        console.log(httpResponse.body);
        return null;
      case 204:
        return null;
      default:
        throw new Error('Unexpected error');
    }
  }
}
