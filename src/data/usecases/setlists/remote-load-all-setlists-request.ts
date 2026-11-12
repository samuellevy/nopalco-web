import { HttpClient } from '@/data/http/http-client';
import { Setlist } from '@/domain/models/setlist';
import { LoadAllSetlistsRequest } from '@/domain/usecases/setlists/load-all-setlists-request';

export class RemoteLoadAllSetlistsRequest implements LoadAllSetlistsRequest {
  constructor(private readonly httpClient: HttpClient<Setlist[]>) {}

  async execute(all = false): Promise<Setlist[]> {
    const url = `${window.env.API}/setlists`;
    const httpResponse = await this.httpClient.request({
      url,
      method: 'get',
      ...(all ? { params: { all: true } } : {}),
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
