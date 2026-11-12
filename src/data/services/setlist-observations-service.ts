import { AxiosHttpClient } from '@/infra/http/axios-http-client/axios-http-client';

const client = new AxiosHttpClient();

export const saveSetlistObservations = async (
  setlistId: string,
  itemId: string,
  observations: string,
): Promise<string> => {
  const response = await client.request({
    url: `${window.env.API}/setlists/${encodeURIComponent(setlistId)}/items/${encodeURIComponent(itemId)}/observations`,
    method: 'patch',
    body: { observations },
  });
  if (response.statusCode !== 200 || typeof response.body?.observations !== 'string') {
    throw new Error('Não foi possível salvar as observações.');
  }
  return response.body.observations;
};
