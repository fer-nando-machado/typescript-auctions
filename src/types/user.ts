export interface User {
  username: string;
  password: string;
  permissions: Permissions[];
}

export enum Permissions {
  CreateAuction = "create_auction",
  ViewAuction = "view_auction",
  Bid = "bid",
}
