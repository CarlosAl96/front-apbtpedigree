export interface Stream {
  id: number;
  proposed_start_date: Date;
  actual_start_date?: Date;
  proposed_end_date: Date;
  actual_end_date?: Date;
  user_count: number;
  price: number;
  chat_message_count: number;
  title: string;
  url: string;
  is_live: boolean;
  description: string;
  created_at: Date;
  updated_at: Date;
  is_completed: boolean;
}
