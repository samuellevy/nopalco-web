export interface StatementRequest {
  id: number;
  status: string;
  period: string;
  refund: string | number | null;
  contract: string | number | null;
  requester: string;
  registrationDate: string;
  generationDate: string;
}
