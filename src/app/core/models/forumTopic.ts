export interface ForumTopic {
  id: number;
  name: string;
  replies: number;
  author: string;
  views: number;
  last_post: string;
  id_categories: number;
  sticky: boolean;
  last_post_info?: any;
}
