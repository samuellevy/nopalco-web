import { StatementRequest } from '@/domain/models';

export interface LoadStatementRequestParams {
  skip: number;
  take: number;
  contract?: number;
  refund?: number;
}

export interface LoadStatementRequestResult<T> {
  page: number;
  pageSize: number;
  totalRows: number;
  items: T;
}

export interface LoadStatementRequestResultItem {
  id: number;
  dataRegistration: string;
  contract: number;
  refund: number;
  beginningPeriod: string;
  endPeriod: string;
  generationDate: string;
  createDate: string;
  requestUser: string;
  status: string;
}

export interface LoadStatementRequest {
  load: (params: LoadStatementRequestParams) => Promise<LoadStatementRequestResult<StatementRequest[]>>;
}
