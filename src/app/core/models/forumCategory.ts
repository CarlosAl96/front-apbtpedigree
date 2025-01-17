export interface ForumCategory {
  id: number;
  name: string;
  description: string;
  moderators: string;
  topics: number;
  posts: number;
  last_post: string;
  last_post_info?: any;
}
