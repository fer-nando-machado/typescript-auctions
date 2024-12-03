import { Auction, Bid } from "../types/auction";

export const find = (id: string) => {
  return auctions.find((auction) => auction.id === id);
};

export const insertBid = (id: string, bid: Bid) => {
  return find(id)?.bids.push(bid);
};

export const create = (auction: Omit<Auction, "id" | "bids">): Auction => {
  const newAuction: Auction = { ...auction, bids: [], id: generateId() };
  auctions.push(newAuction);
  return newAuction;
};

const generateId = (): string => {
  return Math.random().toString(36).slice(2, 8);
};

const auctions: Auction[] = [];
