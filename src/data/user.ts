import { User, Permissions } from "../types/user";

export const findByUsernamePassword = (
  username: string,
  password: string
): User | undefined => {
  return users.find((u) => u.username === username && u.password === password);
};

const users: User[] = [
  {
    username: "employee",
    password: "employee_password",
    permissions: [Permissions.CreateAuction, Permissions.ViewAuction],
  },
  {
    username: "bidder1",
    password: "bidder1_password",
    permissions: [Permissions.Bid, Permissions.ViewAuction],
  },
  {
    username: "bidder2",
    password: "bidder2_password",
    permissions: [Permissions.Bid, Permissions.ViewAuction],
  },
  {
    username: "bidder3",
    password: "bidder3_password",
    permissions: [Permissions.Bid, Permissions.ViewAuction],
  },
];
