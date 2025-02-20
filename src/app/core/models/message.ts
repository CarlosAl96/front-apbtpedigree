export interface Message {
  id: number;
  id_chat: number;
  id_sender: number;
  id_receiver: number;
  username_sender?: string;
  img_sender?: string;
  message: string;
  img: string | null;
  created_at: Date;
}
