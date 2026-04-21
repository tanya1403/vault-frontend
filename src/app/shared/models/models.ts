export interface PickupRequestKleeto {
  id: string;
  branch: string;
  addr: string;
  csm: string;
  mob: string;
  files: number;
  boxes: number;
  date: string;
  remarks: string;
  ownerName: string;
  consignmentId: string;
  state: string;
  actualPickupDate?: string;
}

export interface DocItem {
  type: string;
  vault: string;
  vaultedAt?: string;
}

export interface LAI {
  lai: string;
  docs: DocItem[];
}

export interface PickupRequest {
  id: string;
  branch: string;
  lais: LAI[];
}
