import { Request, Response, NextFunction } from "express";
import { find } from "../data/user";
import { User, Permission as Permission } from "../types/user";

export interface UserRequest extends Request {
  user?: Omit<User, "password">;
}

export const authenticate = (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Basic ")) {
    res.status(401).json({ error: "Invalid Basic authorization header" });
    return;
  }

  const base64 = header.split(" ")[1];
  const credentials = Buffer.from(base64, "base64").toString();
  const [username, password] = credentials.split(":");
  if (!username || !password) {
    res.status(400).json({ error: "Invalid credentials format" });
    return;
  }

  const user = find(username, password);
  if (!user) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  req.user = user;
  next();
};

export const authorize =
  (permission: Permission) =>
  (req: UserRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user || !user.permissions.includes(permission)) {
      res.status(403).json({ error: "User is not authorized for this action" });
      return;
    }

    next();
  };
