import { HttpClient, HttpRequest, HttpResponse, HttpStatusCode } from '../http';

export const mockHttpRequest = (): HttpRequest => ({
  url: 'any_url',
  method: 'post',
  body: 'any_body',
});

export class HttpClientSpy<R = any> implements HttpClient<R> {
  url?: string;
  method?: string;
  body?: any;
  headers?: any;
  response: HttpResponse<R> = {
    statusCode: HttpStatusCode.ok,
  };

  async request(data: HttpRequest): Promise<HttpResponse<R>> {
    this.url = data.url;
    this.method = data.method;
    this.body = data.body;
    this.headers = data.headers;
    return this.response;
  }
}
