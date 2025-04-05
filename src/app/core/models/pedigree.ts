export interface Pedigree {
  id: number;
  name: string;
  beforeNameTitles: string | null;
  afterNameTitles: string | null;
  description: string;
  birthdate: string;
  owner: string;
  breeder: string;
  conditioned_weight: string;
  chain_weight: string;
  img: string;
  sex: string;
  color: string;
  callname: string | null;
  registration: string | null;

  father_id: number;
  mother_id: number;
  user_id: number;
  entered_by: number;
  entered_by_name: string;

  status: string;
  fightcolor: string;
  title: number;
  seen: number;
  private: boolean;
  changePermissions: string | null;
  descriptionOwner: string | null;
  registrationNumber: string | null;
  created_at: Date;
  updated_at: Date;

  fullname?: string | null;
  father_fullname?: string | null;
  mother_fullname?: string | null;
  father_name?: string;
  father_beforeNameTitles?: string;
  father_afterNameTitles?: string;
  mother_name?: string;
  mother_beforeNameTitles?: string;
  mother_afterNameTitle?: string;

  percentStatistic?: number;
}
