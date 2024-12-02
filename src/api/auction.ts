import { Response, Router } from "express";
import { selectWinner } from "../core/auction";
import { create, find, placeBid } from "../data/auction";
import { UserRequest, authorize } from "./user";
import { Auction } from "../types/auction";
import { Permission } from "../types/user";

export interface AuctionResponse extends Omit<Auction, "bids"> {
  winnerUsername: string | null;
}

export enum Errors {
  MissingRequiredFields = "Missing required fields",
  InvalidBidValue = "Bid value must be greater than zero",
  NotFound = "Auction not found",
}

const auctionRouter = Router();

auctionRouter.post(
  "/",
  authorize(Permission.CreateAuction),
  (req: UserRequest, res: Response) => {
    const { title, endTime } = req.body;
    if (!title || !endTime) {
      res.status(400).json({ error: Errors.MissingRequiredFields });
      return;
    }

    const { id } = create({ title, endTime });
    res.status(201).json({ id });
  }
);

auctionRouter.get(
  "/:id",
  authorize(Permission.ViewAuction),
  (req: UserRequest, res: Response) => {
    const { id } = req.params;
    const auction = find(id);
    if (!auction) {
      res.status(404).json({ error: Errors.NotFound });
      return;
    }

    const response: AuctionResponse = {
      id: auction.id,
      title: auction.title,
      endTime: auction.endTime,
      winnerUsername: selectWinner(auction),
    };
    res.status(200).json(response);
  }
);

auctionRouter.post(
  "/:id/bid",
  authorize(Permission.Bid),
  (req: UserRequest, res: Response) => {
    const { id } = req.params;
    const { value } = req.body;
    const user = req.user;
    if (!value || value <= 0) {
      res.status(400).json({ error: Errors.InvalidBidValue });
      return;
    }

    const bids = placeBid(id, { username: user!.username, value });
    if (!bids) {
      res.status(404).json({ error: Errors.NotFound });
      return;
    }

    res.status(200).send();
  }
);

export default auctionRouter;
