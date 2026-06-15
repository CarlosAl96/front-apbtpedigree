export type PedigreeClaimStatus = 'pending' | 'approved' | 'denied';

export interface PedigreeClaim {
  id: number;
  user_id: number;
  pedigree_id: number;
  status: PedigreeClaimStatus;
  message: string | null;
  admin_note: string | null;
  reviewed_by: number | null;
  reviewed_at: Date | null;
  created_at: Date;
  updated_at: Date;
  pedigree_name: string | null;
  pedigree_beforeNameTitles: string | null;
  pedigree_afterNameTitles: string | null;
  current_owner: string | null;
  current_owner_id: number | null;
  requester_username?: string;
  requester_first_name?: string | null;
  requester_last_name?: string | null;
  reviewer_username?: string | null;
}
