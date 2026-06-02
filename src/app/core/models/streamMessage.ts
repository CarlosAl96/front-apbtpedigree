export interface StreamMessage {
  id: number;
  user_id: number;
  username: string;
  message: string;
  img: string | null;
  audio: string | null;
  created_at: Date;
  updated_at: Date;
}
