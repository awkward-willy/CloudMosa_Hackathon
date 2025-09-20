export interface TransactionPutPayload {
  id: string;
  description: string;
  amount: number;
  type: string;
  income: boolean;
}
