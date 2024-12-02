import { User, Permission } from "../types/user";

export const find = (username: string, password: string) => {
  return users.find((u) => u.username === username && u.password === password);
};

const users: User[] = [
  {
    username: "employee",
    password: "employee_password",
    permissions: [Permission.CreateAuction, Permission.ViewAuction],
  },
  {
    username: "bidder1",
    password: "bidder1_password",
    permissions: [Permission.Bid, Permission.ViewAuction],
  },
  {
    username: "bidder2",
    password: "bidder2_password",
    permissions: [Permission.Bid, Permission.ViewAuction],
  },
  {
    username: "bidder3",
    password: "bidder3_password",
    permissions: [Permission.Bid, Permission.ViewAuction],
  },
];
