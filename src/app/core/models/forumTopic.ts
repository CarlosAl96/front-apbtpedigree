export interface ForumTopic {
  id: number;
  name: string;
  message: string;
  id_author: number;
  replies: number;
  author: string;
  views: number;
  last_post: string;
  id_categories: number;
  sticky: boolean;
  last_post_info?: any;
  is_announcement: boolean;
  is_locked: boolean;
  is_deleted: boolean;
  is_popular?: boolean;
  new_posts?: boolean;
  category_name?: string;
  created_at: Date;
  updated_at: Date;
}
