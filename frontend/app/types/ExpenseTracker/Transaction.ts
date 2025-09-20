export interface TransactionShape {
  id: string;
  income: boolean;
  description: string;
  amount: number;
  type: string;
  time: string;
}

export interface UpdateActionState {
  success?: boolean;
  error?: string;
  transaction?: TransactionShape;
}

export interface CreateTransactionInput {
  description: string;
  amount: number;
  type: string;
  income: boolean;
}

export interface CreateActionState {
  success?: boolean;
  error?: string;
  created?: TransactionShape;
}

export interface DeleteActionState {
  success?: boolean;
  error?: string;
  id?: string;
}
