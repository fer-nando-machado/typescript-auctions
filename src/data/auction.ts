import { Auction } from "../types/auction";

export const findById = (id: string): Auction | undefined => {
  return auctions.find((auction) => auction.id === id);
};

export const create = (auction: Auction): number => {
  return auctions.push(auction);
};

const auctions: Auction[] = [];
