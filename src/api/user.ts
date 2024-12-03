import { Request, Response, NextFunction } from "express";
import { User, Permission, KnownError } from "../types/user";
import { find } from "../data/user";

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
    res.status(400).json({ error: KnownError.InvalidHeader });
    return;
  }

  const base64 = header.split(" ")[1];
  const credentials = Buffer.from(base64, "base64").toString();
  const [username, password] = credentials.split(":");
  if (!username || !password) {
    res.status(400).json({ error: KnownError.InvalidHeader });
    return;
  }

  const user = find(username, password);
  if (!user) {
    res.status(401).json({ error: KnownError.InvalidCredentials });
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
      res.status(403).json({ error: KnownError.InvalidPermissions });
      return;
    }

    next();
  };
