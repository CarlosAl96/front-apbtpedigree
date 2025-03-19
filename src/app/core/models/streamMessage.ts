export interface StreamMessage {
  id: number;
  user_id: number;
  username: string;
  message: string;
  created_at: Date;
  updated_at: Date;
}
