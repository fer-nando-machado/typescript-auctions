import { Request, Response } from "express";
import { create, findById } from "../data/auction";
import { Permissions } from "../types/user";
import { AuthorizedRequest } from "../api/user";

export const createAuction = (req: AuthorizedRequest, res: Response): void => {
  const user = req.user;
  if (!user || !user.permissions.includes(Permissions.CreateAuction)) {
    res.status(403).json({ error: "User not allowed to create auction" });
    return;
  }

  const { title, endTime } = req.body;
  if (!title || !endTime) {
    res.status(400).json({ error: "Title and endTime are required" });
    return;
  }

  const newAuction = {
    id: generateRandomId(),
    title,
    endTime,
    bids: [],
  };

  create(newAuction);

  res.status(201).json({ id: newAuction.id });
};

export const getAuctionById = (req: AuthorizedRequest, res: Response): void => {
  const user = req.user;
  if (!user || !user.permissions.includes(Permissions.ViewAuction)) {
    res.status(403).json({ error: "User not allowed to view auction" });
    return;
  }

  const { id } = req.params;
  const auction = findById(id);

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
};

export const placeBid = (req: AuthorizedRequest, res: Response): void => {
  const user = req.user;
  if (!user || !user.permissions.includes(Permissions.Bid)) {
    res.status(403).json({ error: "User not allowed to bid" });
    return;
  }

  const { id } = req.params;
  const { value } = req.body;
  if (!value || value <= 0) {
    res.status(400).json({ error: "Bid value must be greater than zero" });
    return;
  }

  const auction = findById(id);
  if (!auction) {
    res.status(404).json({ error: "Auction not found" });
    return;
  }

  auction.bids.push({ username: user.username, value });

  res.status(201).json({ message: "Bid placed successfully" });
};

const determineWinner = (auction: any): string | null => {
  if (new Date(auction.endTime) > new Date()) return null;

  let winner = null;
  let maxBid = 0;

  const userBids: { [key: string]: number } = {};

  for (const bid of auction.bids) {
    userBids[bid.username] = Math.max(bid.value, userBids[bid.username] || 0);

    if (userBids[bid.username] > maxBid) {
      maxBid = userBids[bid.username];
      winner = bid.username;
    }
  }

  return winner;
};

const generateRandomId = (): string => {
  return Math.random().toString(36).slice(2, 8);
};
