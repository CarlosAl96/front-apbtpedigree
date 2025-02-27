export interface User {
  id: number;
  username: string;
  password?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  ip: string | null;
  street: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  picture: string | null;
  posts: number;

  is_superuser: boolean;
  stateOnline: boolean;
  adminuser: boolean;
  is_staff: boolean;
  is_active: boolean;
  is_enabled: boolean;
  forum_ban: boolean;
  subscription: boolean;
  last_login: Date | null;
  date_joined: Date;
  payment_at: Date | null;

  show_email: boolean | number;
  show_phone: boolean | number;
  show_location: boolean | number;
}
