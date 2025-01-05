import HttpClient from '@/infra/http-client';

export class AuthenticationService {
  baseUrl = import.meta.env.VITE_STATEMENT_REQUEST_BASE_URL;

  constructor(private httpClient: HttpClient) {}

  async signIn(): Promise<[]> {
    try {
      const response = await this.httpClient.get(`${this.baseUrl}/Authentication`);

      return response;
    } catch (error) {
      return [];
    }
  }
}

export default AuthenticationService;
