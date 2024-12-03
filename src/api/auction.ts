import { Response, Router } from "express";
import { placeBid, determineWinner } from "../core/auction";
import { create, find, insertBid } from "../data/auction";
import { UserRequest, authorize } from "./user";
import { Permission } from "../types/user";
import { Auction, KnownError } from "../types/auction";

interface AuctionResponse extends Omit<Auction, "bids"> {
  winnerUsername: string | null;
}

const auctionRouter = Router();

auctionRouter.post(
  "/",
  authorize(Permission.CreateAuction),
  (req: UserRequest, res: Response) => {
    const { title, endTime } = req.body;
    if (!title || !endTime) {
      res.status(400).json({ error: KnownError.MissingRequiredFields });
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
      res.status(404).json({ error: KnownError.NotFound });
      return;
    }

    const response: AuctionResponse = {
      id: auction.id,
      title: auction.title,
      endTime: auction.endTime,
      winnerUsername: determineWinner(auction),
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
    if (!value || !id || !user) {
      res.status(400).json({ error: KnownError.MissingRequiredFields });
      return;
    }

    try {
      placeBid(id, {
        value,
        username: user.username,
        time: new Date().toISOString(),
      });
      res.status(200).send();
    } catch (error) {
      const knownError = error as Error;
      switch (knownError.message) {
        case KnownError.NotFound:
          res.status(404).json({ error: knownError.message });
          break;
        case KnownError.Ended:
        case KnownError.InferiorBidValue:
          res.status(400).json({ error: knownError.message });
          break;
        case KnownError.ConflictingBidTime:
          res.status(409).json({ error: knownError.message });
          break;
        default:
          res.status(500).json({ error });
      }
    }
  }
);

export default auctionRouter;
