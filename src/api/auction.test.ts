import request from "supertest";
import express, { Response, NextFunction } from "express";
import auctionRouter, { Errors } from "./auction";
import { UserRequest, authenticate } from "./user";

jest.mock("./user", () => ({
  authenticate: jest.fn(
    (req: UserRequest, _res: Response, next: NextFunction) => {
      req.user = { username: "test-user", permissions: [] };
      next();
    }
  ),
  authorize: jest.fn(
    () => (_req: UserRequest, _res: Response, next: NextFunction) => next()
  ),
}));

const PAST_ISO_STRING = new Date(Date.now() - 10000).toISOString();
const FUTURE_ISO_STRING = new Date(Date.now() + 10000).toISOString();

const app = express();
app.use(express.json());
app.use(authenticate);
app.use("/auctions", auctionRouter);

describe("Auction router", () => {
  describe("POST /auctions", () => {
    it("should create a new Auction and return 201", async () => {
      const response = await request(app)
        .post("/auctions")
        .send({ title: "Collectible Car", endTime: FUTURE_ISO_STRING });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
    });

    it("should return 400 if the title is missing", async () => {
      const response = await request(app)
        .post("/auctions")
        .send({ endTime: FUTURE_ISO_STRING });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: Errors.MissingRequiredFields });
    });

    it("should return 400 if the endTime is missing", async () => {
      const response = await request(app)
        .post("/auctions")
        .send({ title: "Rare Car" });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: Errors.MissingRequiredFields });
    });
  });

  describe("GET /auctions/:id", () => {
    it("should return a future Auction without winner", async () => {
      const createResponse = await request(app)
        .post("/auctions")
        .send({ title: "Cheap Car", endTime: FUTURE_ISO_STRING });
      const { id } = createResponse.body;

      const response = await request(app).get(`/auctions/${id}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id,
        title: "Cheap Car",
        endTime: FUTURE_ISO_STRING,
        winnerUsername: null,
      });
    });

    it("should return a past Auction with a winner", async () => {
      const createResponse = await request(app)
        .post("/auctions")
        .send({ title: "Expensive Car", endTime: PAST_ISO_STRING });
      const { id } = createResponse.body;

      const bidResponse = await request(app)
        .post(`/auctions/${id}/bid`)
        .send({ value: 100 });
      expect(bidResponse.status).toBe(200);

      const response = await request(app).get(`/auctions/${id}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id,
        title: "Expensive Car",
        endTime: PAST_ISO_STRING,
        winnerUsername: "test-user",
      });
    });

    it("should return 404 if auction is not found", async () => {
      const response = await request(app).get("/auctions/000000");
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: Errors.NotFound });
    });
  });

  describe("POST /auctions/:id/bid", () => {
    it("should place a bid and return 200", async () => {
      const createResponse = await request(app)
        .post("/auctions")
        .send({ title: "Real Car", endTime: FUTURE_ISO_STRING });
      const { id } = createResponse.body;

      const bidResponse = await request(app)
        .post(`/auctions/${id}/bid`)
        .send({ value: 100 });
      expect(bidResponse.status).toBe(200);
    });

    it("should return 400 if bid value is invalid", async () => {
      const createResponse = await request(app)
        .post("/auctions")
        .send({ title: "Fake Car", endTime: FUTURE_ISO_STRING });

      const { id } = createResponse.body;

      const response = await request(app)
        .post(`/auctions/${id}/bid`)
        .send({ value: -1 });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: Errors.InvalidBidValue });
    });

    it("should return 404 if auction is not found", async () => {
      const response = await request(app)
        .post("/auctions/000000/bid")
        .send({ value: 100 });
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: Errors.NotFound });
    });
  });
});
