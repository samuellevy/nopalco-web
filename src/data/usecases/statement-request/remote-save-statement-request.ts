import { HttpClient, HttpStatusCode } from '@/data/http';
import { InvalidCredentialsError, UnexpectedError } from '@/domain/errors';

import { SaveStatementRequest, SaveStatementRequestParams } from '@/domain/usecases';

export class RemoteSaveStatementRequest implements SaveStatementRequest {
  constructor(
    private readonly url: string,
    private readonly httpClient: HttpClient<void>,
  ) {}

  async save(params: SaveStatementRequestParams): Promise<any> {
    const url = `${window.env.STATEMENT_REQUEST_API}${this.url}`;
    const { contractNumber, refundNumber, dtBegin, dtEnd, user } = params;

    const httpResponse = await this.httpClient.request({
      method: 'post',
      url,
      body: {
        contractNumber: contractNumber === 0 ? null : contractNumber,
        refundNumber: refundNumber === 0 ? null : refundNumber,
        dtBegin,
        dtEnd,
        user,
      },
    });

    switch (httpResponse.statusCode) {
      case HttpStatusCode.ok:
        return httpResponse.body;
      case HttpStatusCode.unauthorized:
        throw new InvalidCredentialsError();
      default:
        throw new UnexpectedError();
    }
  }
}
