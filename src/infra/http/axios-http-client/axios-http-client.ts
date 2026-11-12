import axios, { AxiosResponse } from 'axios';

import { HttpRequest, HttpResponse } from '@/data/http';
import { HttpClient } from '@/data/http/http-client';
import { clearAccount, getAccessToken } from '@/main/config/session';

export class AxiosHttpClient implements HttpClient {
  async request(data: HttpRequest): Promise<HttpResponse> {
    let axiosResponse: AxiosResponse;
    const token = data.url.startsWith(`${window.env.API}/`) ? getAccessToken() : null;
    try {
      axiosResponse = await axios.request({
        url: data.url,
        method: data.method,
        data: data.body,
        headers: { ...data.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        params: data.params,
      });
    } catch (error) {
      axiosResponse = error.response;
    }
    if (token && axiosResponse.status === 401) clearAccount();
    return {
      statusCode: axiosResponse.status,
      body: axiosResponse.data,
    };
  }
}
