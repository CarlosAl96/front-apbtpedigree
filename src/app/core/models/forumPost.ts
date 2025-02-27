export interface ForumPost {
  id: number;
  subject?: string;
  message: string;
  id_author: number;
  id_post_reply: number;
  id_topic: number;
  id_categories: number;
  id_deleted: number;
  first: boolean;
  created_at: Date;
  updated_at: Date;

  //data user

  username?: string;
  picture?: string;
  date_joined?: Date;
  city?: string;
  state?: string;
  country?: string;
  posts?: number;
  location?: string;
  level?: string;
  stars?: number;
  email?: string;
  show_email?: boolean;
  show_phone?: boolean;
  show_location?: boolean;
}
