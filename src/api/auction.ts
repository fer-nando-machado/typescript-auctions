import express from "express";
import { createAuction, getAuctionById, placeBid } from "../core/auction";

const auctionRouter = express.Router();

auctionRouter.post("/", createAuction);
auctionRouter.get("/:id", getAuctionById);
auctionRouter.post("/:id/bid", placeBid);

export default auctionRouter;
