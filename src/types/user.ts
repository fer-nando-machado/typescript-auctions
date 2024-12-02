export interface User {
  username: string;
  password: string;
  permissions: Permission[];
}

export enum Permission {
  CreateAuction = "create_auction",
  ViewAuction = "view_auction",
  Bid = "bid",
}
