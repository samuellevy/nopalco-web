import { HttpClient } from '@/data/http/http-client';
import { StatementRequest } from '@/domain/models';
import {
  LoadStatementRequest,
  LoadStatementRequestParams,
  LoadStatementRequestResult,
  LoadStatementRequestResultItem,
} from '@/domain/usecases/statement-request/load-statement-request.usecase';

export class RemoteLoadStatementRequest implements LoadStatementRequest {
  constructor(
    private readonly url: string,
    private readonly httpClient: HttpClient<LoadStatementRequestResult<LoadStatementRequestResultItem[]>>,
  ) {}

  private formatDate = (date: string): string => {
    if (date === null) return '';
    const formatedDate = new Date(date);
    const [year, month, day] = formatedDate.toISOString().substring(0, 10).split('-');
    return `${day}/${month}/${year}`;
  };

  async load(params: LoadStatementRequestParams): Promise<LoadStatementRequestResult<StatementRequest[]>> {
    const url = `${window.env.STATEMENT_REQUEST_API}${this.url}`;
    const httpResponse = await this.httpClient.request({
      url,
      method: 'get',
      params,
    });

    const statementRequestList: StatementRequest[] = httpResponse.body.items.map(
      (data: LoadStatementRequestResultItem) => ({
        id: data.id,
        period: `${this.formatDate(data.beginningPeriod)} - ${this.formatDate(data.endPeriod)}`,
        contract: data.contract === null ? '' : data.contract,
        refund: data.refund === null ? '' : data.refund,
        requester: data.requestUser,
        registrationDate: this.formatDate(data.dataRegistration),
        generationDate: this.formatDate(data.generationDate),
        status: data.status,
      }),
    );

    switch (httpResponse.statusCode) {
      case 200:
        return {
          page: httpResponse.body.page,
          pageSize: httpResponse.body.pageSize,
          totalRows: httpResponse.body.totalRows,
          items: statementRequestList,
        };
      case 204:
        return null;
      default:
        throw new Error('Unexpected error');
    }
  }
}
