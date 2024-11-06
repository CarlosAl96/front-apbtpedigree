import { User } from './user';

export interface UserTokenData {
  tokenType: String;
  user: User;
  iat: number;
  exp: number;
}
