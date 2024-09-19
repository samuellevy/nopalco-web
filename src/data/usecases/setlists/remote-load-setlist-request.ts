import { HttpClient } from '@/data/http/http-client';
import { Setlist } from '@/domain/models/setlist';
import { LoadSetlistRequest } from '@/domain/usecases/setlists/load-setlist-request';

export class RemoteLoadSetlistRequest implements LoadSetlistRequest {
  constructor(private readonly httpClient: HttpClient<any>) {}

  async execute(uid: string): Promise<Setlist> {
    const url = `${import.meta.env.VITE_NOPALCO_API}/setlists/${uid}`;
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
