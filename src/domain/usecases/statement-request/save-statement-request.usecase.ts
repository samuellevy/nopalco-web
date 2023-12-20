export type SaveStatementRequestParams = {
  contractNumber: number;
  refundNumber: number;
  dtBegin: string;
  dtEnd: string;
  user: string;
};

export interface SaveStatementRequest {
  save: (params: SaveStatementRequestParams) => Promise<void>;
}
