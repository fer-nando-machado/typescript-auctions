import { Request, Response, NextFunction } from "express";
import { findByUsernamePassword } from "../data/user";
import { User } from "../types/user";

export interface AuthorizedRequest extends Request {
  user?: Omit<User, "password">;
}

export const authorize = (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    res.status(401).json({ error: "Invalid Basic authorization header" });
    return;
  }

  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString();
  const [username, password] = credentials.split(":");

  if (!username || !password) {
    res.status(400).json({ error: "Invalid credentials format" });
    return;
  }

  const user = findByUsernamePassword(username, password);
  if (!user) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  req.user = user;
  next();
};
