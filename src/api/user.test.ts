import request from "supertest";
import express, { Response } from "express";
import { authenticate, authorize, Errors, UserRequest } from "./user";
import { Permission } from "../types/user";
import { find } from "../data/user";

jest.mock("../data/user");

const app = express();
app.use(express.json());

app.get("/authenticate", authenticate, (req: UserRequest, res: Response) => {
  res.status(200).json({ user: req.user });
});

app.get(
  "/authorize",
  authenticate,
  authorize(Permission.ViewAuction),
  (req: UserRequest, res: Response) => {
    res.status(200).json({ user: req.user });
  }
);

describe("User middleware router", () => {
  describe("authenticate", () => {
    it("should authenticate user with valid credentials", async () => {
      jest.mocked(find).mockImplementationOnce((username, password) => {
        return { username, password, permissions: [] };
      });

      const response = await request(app)
        .get("/authenticate")
        .set(
          "Authorization",
          `Basic ${Buffer.from("test-user:test-password").toString("base64")}`
        );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        user: { username: "test-user", permissions: [] },
      });
    });

    it("should return 400 if authorization header is invalid", async () => {
      const response = await request(app).get("/authenticate");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: Errors.InvalidHeader });
    });

    it("should return 401 if credentials habe an invalid format", async () => {
      const response = await request(app)
        .get("/authenticate")
        .set(
          "Authorization",
          `Basic ${Buffer.from("invalid-credentials").toString("base64")}`
        );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: Errors.InvalidCredentials });
    });

    it("should return 401 if credentials do not match", async () => {
      jest
        .mocked(find)
        .mockImplementationOnce(jest.requireActual("../data/user").find);

      const response = await request(app)
        .get("/authenticate")
        .set(
          "Authorization",
          `Basic ${Buffer.from("unmatched:credentials").toString("base64")}`
        );

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: Errors.InvalidCredentials });
    });
  });

  describe("authorize", () => {
    it("should allow access if user has the required permission", async () => {
      jest.mocked(find).mockImplementationOnce((username, password) => {
        return { username, password, permissions: [Permission.ViewAuction] };
      });

      const response = await request(app)
        .get("/authorize")
        .set(
          "Authorization",
          `Basic ${Buffer.from("test-user:test-pass").toString("base64")}`
        );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        user: {
          username: "test-user",
          permissions: [Permission.ViewAuction],
        },
      });
    });

    it("should return 403 if user lacks the required permission", async () => {
      jest.mocked(find).mockImplementationOnce((username, password) => {
        return { username, password, permissions: [Permission.Bid] };
      });

      const response = await request(app)
        .get("/authorize")
        .set(
          "Authorization",
          `Basic ${Buffer.from("test-user:test-pass").toString("base64")}`
        );

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ error: Errors.InvalidPermissions });
    });
  });
});
