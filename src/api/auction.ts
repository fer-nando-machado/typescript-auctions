import { Response, Router } from "express";
import { determineWinner, generateId } from "../core/auction";
import { create, find, placeBid } from "../data/auction";
import { UserRequest, authorize } from "./user";
import { Permission } from "../types/user";

const auctionRouter = Router();

auctionRouter.post(
  "/",
  authorize(Permission.CreateAuction),
  (req: UserRequest, res: Response) => {
    const { title, endTime } = req.body;
    if (!title || !endTime) {
      res.status(400).json({ error: "Title and endTime are required" });
      return;
    }

    const newAuction = {
      id: generateId(),
      title,
      endTime,
      bids: [],
    };
    create(newAuction);
    res.status(201).json({ id: newAuction.id });
  }
);

auctionRouter.get(
  "/:id",
  authorize(Permission.ViewAuction),
  (req: UserRequest, res: Response) => {
    const { id } = req.params;
    const auction = find(id);
    if (!auction) {
      res.status(404).json({ error: "Auction not found" });
      return;
    }

    res.status(200).json({
      id: auction.id,
      title: auction.title,
      endTime: auction.endTime,
      winnerUsername: determineWinner(auction),
    });
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
      res.status(400).json({ error: "Bid value must be greater than zero" });
      return;
    }

    const bids = placeBid(id, { username: user!.username, value });
    if (!bids) {
      res.status(404).json({ error: "Auction not found" });
      return;
    }

    res.status(200).send();
  }
);

export default auctionRouter;
