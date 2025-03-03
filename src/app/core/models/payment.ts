export interface Payment {
  id: number;
  user_id: number;
  username: string;
  stream_id: number;
  title: string;
  amount: number;
  payment_method: string;
  transaction_id: string;
  payment_status: string;
  created_at: Date;
  updated_at: Date;
}
