import request from "supertest";
import express, { Response, NextFunction } from "express";
import auctionRouter from "./auction";
import { UserRequest, authenticate } from "./user";
import { create, insertBid } from "../data/auction";
import { KnownError } from "../types/auction";

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
      expect(response.body).toEqual({
        error: KnownError.MissingRequiredFields,
      });
    });

    it("should return 400 if the endTime is missing", async () => {
      const response = await request(app)
        .post("/auctions")
        .send({ title: "Rare Car" });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: KnownError.MissingRequiredFields,
      });
    });
  });

  describe("GET /auctions/:id", () => {
    it("should return a future Auction without a winner", async () => {
      const { id } = create({
        title: "Cheap Car",
        endTime: FUTURE_ISO_STRING,
      });

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
      const { id } = create({
        title: "Expensive Car",
        endTime: PAST_ISO_STRING,
      });
      insertBid(id, {
        username: "test-user",
        value: 100,
        time: PAST_ISO_STRING,
      });

      const response = await request(app).get(`/auctions/${id}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id,
        title: "Expensive Car",
        endTime: PAST_ISO_STRING,
        winnerUsername: "test-user",
      });
    });

    it("should return 404 if Auction is not found", async () => {
      const response = await request(app).get("/auctions/000000");
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: KnownError.NotFound });
    });
  });

  describe("POST /auctions/:id/bid", () => {
    it("should place a Bid and return 200", async () => {
      const { id } = create({
        title: "Real Car",
        endTime: FUTURE_ISO_STRING,
      });

      const bidResponse = await request(app)
        .post(`/auctions/${id}/bid`)
        .send({ value: 100 });
      expect(bidResponse.status).toBe(200);
    });

    it("should return 400 if the Bid value is invalid", async () => {
      const { id } = create({
        title: "Fake Car",
        endTime: FUTURE_ISO_STRING,
      });
      insertBid(id, {
        username: "test-user",
        value: 100,
        time: PAST_ISO_STRING,
      });

      const response = await request(app)
        .post(`/auctions/${id}/bid`)
        .send({ value: 100 });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: KnownError.InferiorBidValue });
    });

    it("should return 400 if a required field is missing", async () => {
      const { id } = create({
        title: "Ghost Car",
        endTime: FUTURE_ISO_STRING,
      });

      const response = await request(app).post(`/auctions/${id}/bid`).send();
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: KnownError.MissingRequiredFields,
      });
    });

    it("should return 409 if another valid Bid was placed before", async () => {
      const { id } = create({
        title: "Popular Car",
        endTime: FUTURE_ISO_STRING,
      });
      insertBid(id, {
        username: "test-user",
        value: 100,
        time: FUTURE_ISO_STRING,
      });

      const response = await request(app)
        .post(`/auctions/${id}/bid`)
        .send({ value: 100 });
      expect(response.status).toBe(409);
      expect(response.body).toEqual({ error: KnownError.ConflictingBidTime });
    });

    it("should return 404 if the Auction is not found", async () => {
      const response = await request(app)
        .post("/auctions/000000/bid")
        .send({ value: 100 });
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: KnownError.NotFound });
    });
  });
});
