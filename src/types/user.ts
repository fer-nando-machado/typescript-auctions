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

export enum KnownError {
  InvalidHeader = "Invalid authorization header",
  InvalidCredentials = "Invalid username or password",
  InvalidPermissions = "User is not authorized to perform that action",
}
