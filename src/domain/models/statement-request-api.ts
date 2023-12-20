export interface StatementRequestApi {
  id: number;
  status: string;
  beginningPeriod: string;
  endPeriod: string;
  refund: number | null;
  contract: number | null;
  requestUser: string;
  dataRegistration: string;
  generationDate: string;
}
