export interface QueryPaginationPedigree {
  page: number;
  size: number;
  orderBy: string;
  registeredName?: string;
  dogId?: number | string;
  registrationNumber?: string;
  callname?: string;
  breeder?: string;
  owner?: string;
  ownerUsername?: string;
  ownerId?: number;
  ownerName?: string;
  userId?: number;
  superUsersOnly?: boolean;
}
