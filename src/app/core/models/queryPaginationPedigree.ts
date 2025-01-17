export interface QueryPaginationPedigree {
  page: number;
  size: number;
  orderBy: string;
  registeredName?: string;
  dogId?: number;
  registrationNumber?: string;
  callname?: string;
  breeder?: string;
  owner?: string;
  userId?: number;
}
