import { Request, Response, NextFunction } from "express";
import { User, Permission as Permission } from "../types/user";
import { find } from "../data/user";

export interface UserRequest extends Request {
  user?: Omit<User, "password">;
}

export enum Errors {
  InvalidHeader = "Invalid authorization header",
  InvalidCredentials = "Invalid username or password",
  InvalidPermissions = "User is not authorized to perform that action",
}

export const authenticate = (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Basic ")) {
    res.status(400).json({ error: Errors.InvalidHeader });
    return;
  }

  const base64 = header.split(" ")[1];
  const credentials = Buffer.from(base64, "base64").toString();
  const [username, password] = credentials.split(":");
  if (!username || !password) {
    res.status(400).json({ error: Errors.InvalidHeader });
    return;
  }

  const user = find(username, password);
  if (!user) {
    res.status(401).json({ error: Errors.InvalidCredentials });
    return;
  }

  req.user = {
    username: user.username,
    permissions: user.permissions,
  };
  next();
};

export const authorize =
  (permission: Permission) =>
  (req: UserRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user || !user.permissions.includes(permission)) {
      res.status(403).json({ error: Errors.InvalidPermissions });
      return;
    }

    next();
  };
