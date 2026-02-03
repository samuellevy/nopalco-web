import { HttpClient } from '@/data/http/http-client';
import { SetlistUpdateDTO, UpdateSetlistRequest } from '@/domain/usecases/setlists/update-setlist-request';

export class RemoteUpdateSetlistRequest implements UpdateSetlistRequest {
  constructor(private readonly httpClient: HttpClient<any>) {}

  async execute(setlistId: string, setlistData: SetlistUpdateDTO): Promise<void> {
    const url = `${window.env.API}/setlists/${setlistId}`;
    const httpResponse = await this.httpClient.request({
      url,
      method: 'patch',
      body: setlistData,
    });

    switch (httpResponse.statusCode) {
      case 200:
        return { ...(httpResponse.body || []) };
      case 204:
        return null;
      default:
        throw new Error('Unexpected error');
    }
  }
}
