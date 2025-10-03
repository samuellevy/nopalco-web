import { HttpClient } from '@/data/http/http-client';
import { CreateSetlistDTO, CreateSetlistRequest } from '@/domain/usecases/setlists/create-setlist-request';

export class RemoteCreateSetlistRequest implements CreateSetlistRequest {
  constructor(private readonly httpClient: HttpClient<any>) {}

  async execute(body: CreateSetlistDTO): Promise<any> {
    const url = `${window.env.API}/setlists`;
    const httpResponse = await this.httpClient.request({
      url,
      method: 'post',
      body,
    });

    switch (httpResponse.statusCode) {
      case 201:
        return httpResponse.body;
      case 204:
        return null;
      default:
        throw new Error('Unexpected error');
    }
  }
}
